import { getTheme, setTheme, getSize, setSize } from './theme.js';
export function settingsScreen({ UI, Router, I18n }) {
  const { el, icon } = UI, t = I18n.t;
  const seg = (items, get, set) => {
    const box = el('div', { class: 'segc' });
    const mark = () => [...box.children].forEach((b, i) => b.classList.toggle('on', items[i][0] === get()));
    items.forEach(([k, label]) => box.append(el('button', { type: 'button', class: 'rip', onclick: () => { set(k); mark(); } }, label)));
    mark(); return box;
  };
  const row = (ic, label, fn) => el('button', { class: 'btn ghost rip', type: 'button', onclick: fn }, icon(ic), label);
  return UI.tabbed('settings', el('section', { class: 'st' },
    el('div', { class: 'hd' }, el('h1', { text: t('s.title') })),
    el('p', { class: 'sub', text: t('s.theme') }), seg([['dark', t('s.dark')], ['light', t('s.light')], ['auto', t('s.auto')]], getTheme, setTheme),
    el('p', { class: 'sub', text: t('s.fs') }), seg([['small', t('s.small')], ['normal', t('s.normal')], ['large', t('s.large')]], getSize, setSize),
    row('info', t('s.about'), () => Router.go('about')), row('list', t('s.log'), () => Router.go('log'))));
}
