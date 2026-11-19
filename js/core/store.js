import { Log } from './log.js';
const state = { user: null, profile: null, chats: [], route: null };
const subs = new Map();
export const Store = {
  get: k => state[k],
  set(k, v) {
    if (state[k] === v) return;
    state[k] = v;
    for (const f of [...(subs.get(k) || []), ...(subs.get('*') || [])]) { try { f(v, k); } catch (e) { Log.error('store:' + k, e); } }
  },
  on(k, f) { if (!subs.has(k)) subs.set(k, new Set()); subs.get(k).add(f); return () => subs.get(k).delete(f); }
};
