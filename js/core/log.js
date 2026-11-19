// Журнал ошибок: последние 50 записей (память + localStorage). Ни от чего не зависит.
import { APP_VERSION } from './config.js';
const KEY = 'kf_log', MAX = 50;
let items = [];
try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { items = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} };
const add = (level, where, e) => {
  const msg = typeof e === 'string' ? e : `${e?.name || 'Error'}: ${e?.message || e}${e?.code ? ' [' + e.code + ']' : ''}${e?.status ? ' (' + e.status + ')' : ''}`;
  items.push({ t: new Date().toISOString(), level, where: String(where), msg: msg.slice(0, 400) });
  if (items.length > MAX) items = items.slice(-MAX);
  save(); if (level === 'error') console.error('[kf]', where, e);
};
export const Log = {
  info: (w, e) => add('info', w, e), error: (w, e) => add('error', w, e),
  list: () => items.slice().reverse(),
  clear() { items = []; save(); },
  text() {
    const head = `Kinsfolk ${APP_VERSION}\n${navigator.userAgent}\n${new Date().toISOString()}\n`;
    return head + (items.length ? items.map(i => `${i.t} ${i.level} ${i.where}: ${i.msg}`).join('\n') : '(журнал пуст)');
  },
  install() {
    addEventListener('error', e => add('error', 'window', e.error || e.message));
    addEventListener('unhandledrejection', e => add('error', 'promise', e.reason || 'rejection'));
  }
};
