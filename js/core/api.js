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
  if (/pgrst205|42p01|could not find the table|does not exist/.test(`${c} ${m}`)) return 'err.setup'; // не выполнен SQL этапа
  if (/error sending .*email/.test(m)) return 'err.mail'; // Supabase не смог отправить письмо (проблема SMTP)
  if (!navigator.onLine || /failed to fetch|networkerror|load failed/.test(m) || (/retryablefetch/.test(m) && !s)) return 'err.net';
  if (/email_not_confirmed/.test(c) || /email not confirmed/.test(m)) return 'err.notconfirmed';
  if (/user_already_exists|email_exists/.test(c)) return 'err.exists';
  if (/weak_password/.test(c)) return 'err.weak';
  if (/same_password/.test(c)) return 'err.samepass';
  if (/otp_disabled/.test(c) || /signups not allowed/.test(m)) return 'err.nouser';
  if (c === '23505') return 'err.taken';
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
const A = (label, fn) => call(label, c => fn(c.auth), { retries: 0 }); // письма и пароли не повторяем
const auth = {
  sendCode: email => A('sendCode', a => a.signInWithOtp({ email, options: { shouldCreateUser: true } })), // новый аккаунт создаётся сам
  verify: (email, token) => A('verify', a => a.verifyOtp({ email, token, type: 'email' })),
  signOut: (scope = 'local') => A('signOut', a => a.signOut({ scope })),
  deleteAccount: () => call('deleteAccount', c => c.rpc('delete_my_account'), { retries: 0 })
};
const profiles = {
  get: id => call('profile.get', c => c.from('profiles').select('*').eq('id', id).maybeSingle()),
  async usernameFree(u, myId) {
    const d = await call('profile.free', c => c.from('profiles').select('id').eq('username', u).limit(1));
    return !d.length || d[0].id === myId;
  },
  save: p => call('profile.save', c => c.from('profiles').upsert(p, { onConflict: 'id' }).select().single(), { retries: 0 }),
  async search(q, myId) {
    const e = q.replace(/[\\%_]/g, m => '\\' + m), cols = 'id,username,display_name,avatar_url,bio';
    const [a, b] = await Promise.all([
      call('people.username', c => c.from('profiles').select(cols).ilike('username', e + '%').neq('id', myId).limit(20)),
      call('people.name', c => c.from('profiles').select(cols).ilike('display_name', '%' + e + '%').neq('id', myId).limit(20))
    ]);
    const seen = new Set();
    return [...a, ...b].filter(p => !seen.has(p.id) && seen.add(p.id)).slice(0, 20);
  },
  async removeAvatarFile(url) { // старый файл аватара; ошибки не важны
    const m = /\/avatars\/(.+?)(\?|$)/.exec(url || ''); if (!m) return;
    try { await call('avatar.remove', c => c.storage.from('avatars').remove([decodeURIComponent(m[1])]), { retries: 0 }); } catch { /* не страшно */ }
  },
  async uploadAvatar(uid, blob) {
    const path = `${uid}/avatar-${Date.now()}.jpg`;
    await call('avatar.upload', c => c.storage.from('avatars').upload(path, blob, { contentType: 'image/jpeg', upsert: true }), { retries: 0 });
    return (await sb()).storage.from('avatars').getPublicUrl(path).data.publicUrl;
  }
};
const chats = {
  list: () => call('chats.list', c => c.rpc('my_chats')),
  start: other => call('chats.start', c => c.rpc('start_direct_chat', { other }), { retries: 0 }),
  // before — старее этого id (подгрузка истории), after — новее (догрузка пропущенного)
  async messages(chatId, { before = null, after = null, limit = 50 } = {}) {
    const d = await call('messages.load', c => {
      let q = c.from('messages').select('*').eq('chat_id', chatId);
      if (before) q = q.lt('id', before);
      if (after) q = q.gt('id', after);
      return q.order('id', { ascending: !!after }).limit(limit);
    });
    return after ? d : d.reverse();
  },
  send: (chatId, body, me) => call('messages.send', c => c.from('messages').insert({ chat_id: chatId, sender_id: me, body, kind: 'text' }).select().single(), { retries: 0 }),
  markRead: (chatId, me, msgId) => call('chats.read', c => c.from('chat_members').update({ last_read_message_id: msgId }).eq('chat_id', chatId).eq('user_id', me), { retries: 0 }),
  // Сообщения и новые чаты «вживую». Возвращает функцию отписки.
  async subscribe(me, on) {
    const c = await sb();
    const ch = c.channel('kf-' + me)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, p => on.message?.(p.new))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_members', filter: `user_id=eq.${me}` }, () => on.members?.())
      .subscribe(status => on.status?.(status));
    return () => c.removeChannel(ch);
  }
};
export const Api = {
  auth, profiles, chats,
  sb, call, errKey,
  session: () => call('session', c => c.auth.getSession(), { retries: 0 }).then(d => d.session),
  onAuth: cb => sb().then(c => c.auth.onAuthStateChange((ev, s) => setTimeout(() => cb(ev, s), 0)))
};
