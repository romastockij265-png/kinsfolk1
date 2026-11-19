// Экраны и переходы. «Назад» телефона работает через History API.
import { Log } from './log.js';
import { Hooks } from './hooks.js';
import { Store } from './store.js';
const screens = new Map();
let cur = null, idx = 0, seq = 0;
async function show(name, params) {
  const def = screens.get(name); if (!def) return Log.error('router', 'нет экрана: ' + name);
  const mine = ++seq;
  let node;
  try { node = await def.render(params || {}); } catch (e) { return Log.error('screen:' + name, e); }
  if (mine !== seq) return; // пока рисовали, пользователь ушёл дальше
  const app = document.getElementById('app');
  app.querySelectorAll('.scr:not(.out)').forEach(o => { o.classList.add('out'); setTimeout(() => o.remove(), 220); });
  node.classList.add('scr'); app.append(node);
  cur = { name, params }; Store.set('route', name);
  await Hooks.run('route:changed', { name, params });
  await Hooks.run('ui:rendered', { name, node });
}
export const Router = {
  home: 'about',
  register: (name, def) => screens.set(name, typeof def === 'function' ? { render: def } : def),
  current: () => cur?.name,
  go(name, params = {}, { replace = false } = {}) {
    if (!screens.has(name)) return Log.error('router', 'нет экрана: ' + name);
    if (replace) history.replaceState({ kf: 1, i: idx, name, params }, '');
    else history.pushState({ kf: 1, i: ++idx, name, params }, '');
    return show(name, params);
  },
  back() { if (idx > 0) history.back(); else Router.go(Router.home, {}, { replace: true }); }
};
addEventListener('popstate', e => { const s = e.state; if (s?.kf) { idx = s.i; show(s.name, s.params); } });
