// Шина событий. Модули общаются друг с другом ТОЛЬКО через неё и store.
import { Log } from './log.js';
const map = new Map();
export const Hooks = {
  on(name, fn) { if (!map.has(name)) map.set(name, new Set()); map.get(name).add(fn); return () => Hooks.off(name, fn); },
  off(name, fn) { map.get(name)?.delete(fn); },
  // Ошибка в одном обработчике не мешает остальным.
  async run(name, data) {
    const out = [];
    for (const fn of [...(map.get(name) || [])]) { try { out.push(await fn(data)); } catch (e) { Log.error('hook:' + name, e); } }
    return out;
  }
};
