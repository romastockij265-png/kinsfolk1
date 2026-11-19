// ЕДИНСТВЕННОЕ место обращений к Supabase. Остальные модули вызывают функции отсюда.
import { SUPABASE_URL, SUPABASE_ANON_KEY, SB_CDN, isConfigured } from './config.js';
import { Log } from './log.js';
let client;
export async function sb() {
  if (client) return client;
  if (window.__SB__) return (client = window.__SB__); // подмена для проверки интерфейса (docs/TESTS.md)
  if (!isConfigured()) throw Object.assign(new Error('Supabase не настроен'), { code: 'not_configured' });
  const { createClient } = await import(SB_CDN);
  return (client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }));
}
export function errKey(e) {
  const m = `${e?.name || ''} ${e?.message || ''}`.toLowerCase(), c = String(e?.code || '').toLowerCase(), s = e?.status;
  if (!navigator.onLine || /failed to fetch|networkerror|load failed|retryablefetch/.test(m)) return 'err.net';
  if (s === 429 || /rate_limit/.test(c) || /rate limit|too many/.test(m)) return 'err.rate';
  if (/otp_expired/.test(c) || /expired|token has|otp/.test(m)) return 'err.code';
  if (/invalid_credentials/.test(c) || /invalid login/.test(m)) return 'err.credentials';
  if (s === 401 || /jwt/.test(m)) return 'err.session';
  return 'err.generic';
}
const transient = e => /failed to fetch|retryablefetch|networkerror|load failed/i.test(`${e?.name} ${e?.message}`) || e?.status >= 500;
const sleep = ms => new Promise(r => setTimeout(r, ms));
// call('имя', c => c.from('x').select()) — разворачивает {data,error}, повторяет только при сети/5xx.
// Для отправки писем и записи ставьте {retries:0}, чтобы не продублировать действие.
export async function call(label, fn, { retries = 2 } = {}) {
  for (let i = 0; ; i++) {
    try {
      const r = await fn(await sb());
      if (r && r.error) throw r.error;
      return r && 'data' in r ? r.data : r;
    } catch (e) {
      if (i >= retries || !transient(e)) { Log.error(label, e); throw Object.assign(new Error(e?.message || 'api'), { key: errKey(e), cause: e }); }
      await sleep(400 * 2 ** i);
    }
  }
}
export const Api = {
  sb, call, errKey,
  session: () => call('session', c => c.auth.getSession(), { retries: 0 }).then(d => d.session),
  onAuth: cb => sb().then(c => c.auth.onAuthStateChange((ev, s) => setTimeout(() => cb(ev, s), 0)))
};
