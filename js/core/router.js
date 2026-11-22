// Экраны и переходы. «Назад» телефона работает через History API.
import { Log } from './log.js';
import { Hooks } from './hooks.js';
import { Store } from './store.js';
const screens = new Map();
const plain = o => { try { return structuredClone(o); } catch { return {}; } }; // в историю браузера нельзя класть функции
let cur = null, idx = 0, seq = 0, intent = null;
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
const tabs = [];
export const Router = {
  home: 'about',
  tabs,
  addTab(t) { tabs.push(t); tabs.sort((a, b) => (a.order ?? 9) - (b.order ?? 9)); },
  landing: () => tabs[0]?.id || 'account', // куда попадаем после входа
  register: (name, def) => screens.set(name, typeof def === 'function' ? { render: def } : def),
  current: () => cur?.name,
  // Подменяет текущую запись истории без перерисовки (чтобы «назад» вело в нужное место)
  rewrite(name, params = {}) { history.replaceState({ kf: 1, i: idx, name, params: plain(params) }, ''); },
  intended: () => intent, // куда уже отправили, но экран ещё рисуется
  go(name, params = {}, { replace = false } = {}) {
    if (!screens.has(name)) return Log.error('router', 'нет экрана: ' + name);
    intent = name;
    if (replace) history.replaceState({ kf: 1, i: idx, name, params: plain(params) }, '');
    else history.pushState({ kf: 1, i: ++idx, name, params: plain(params) }, '');
    return show(name, params);
  },
  back() { if (idx > 0) history.back(); else Router.go(Router.home, {}, { replace: true }); }
};
addEventListener('popstate', e => { const s = e.state; if (s?.kf) { idx = s.i; show(s.name, s.params); } });
