// Интерфейсные помощники. Пользовательский текст — только через textContent (el()).
import { t } from './i18n.js';
import { Router } from './router.js';
import { Store } from './store.js';
export function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) { if (c == null || c === false) continue; n.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return n;
}
const ICONS = {
  logo: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>', back: '<path d="M15 5l-7 7 7 7"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M5 16V5a1 1 0 0 1 1-1h10"/>', trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', eyeoff: '<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.5 9.5 0 0 0 4.2-1"/>',
  camera: '<path d="M9 4 7.5 6H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3.500L15 4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>', logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.5-2.4.9a7.7 7.7 0 0 0-1.7-1L15 3h-4l-.3 2.9a7.7 7.7 0 0 0-1.7 1l-2.4-.9-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.5 2.4-.9c.5.4 1.1.7 1.7 1L11 21h4l.3-2.9c.6-.3 1.2-.6 1.7-1l2.4.9 2-3.5z"/>', send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>', plus: '<path d="M12 5v14M5 12h14"/>', chats: '<path d="M4 5h16v11H9l-5 4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
};
export function icon(name, cls = '') { const w = el('span', { class: 'ic ' + cls }); w.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`; return w; }
let tt;
export function toast(msg) {
  let e = document.querySelector('.toast');
  if (!e) { e = el('div', { class: 'toast', role: 'status' }); document.body.append(e); }
  e.textContent = msg; requestAnimationFrame(() => e.classList.add('on'));
  clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2200);
}
function overlay(content, mid) {
  const ov = el('div', { class: 'ov' + (mid ? ' mid' : '') }, content);
  const close = v => { ov.classList.remove('on'); setTimeout(() => ov.remove(), 300); removeEventListener('keydown', esc); return v; };
  const esc = e => e.key === 'Escape' && close();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  addEventListener('keydown', esc); document.body.append(ov); requestAnimationFrame(() => ov.classList.add('on'));
  return { ov, close };
}
export function sheet(title, ...content) { const s = el('div', { class: 'sheet' }, title ? el('h2', { text: title }) : null, ...content); return overlay(s, false); }
export function dialog({ title, text, ok = t('common.ok'), cancel = t('common.cancel'), danger = false }) {
  return new Promise(res => {
    let h;
    const box = el('div', { class: 'box' }, el('h2', { text: title }), text ? el('p', { text }) : null,
      el('div', { class: 'row' },
        cancel ? el('button', { class: 'btn ghost rip', onclick: () => res(h.close(false)) }, cancel) : null,
        el('button', { class: 'btn rip' + (danger ? ' danger' : ''), onclick: () => res(h.close(true)) }, ok)));
    h = overlay(box, true);
    h.ov.addEventListener('click', e => { if (e.target === h.ov) res(false); });
  });
}
// Экран с нижней панелью вкладок (список вкладок собирается из Router.tabs)
export function tabbed(active, ...kids) {
  const unread = (Store.get('chats') || []).reduce((n, c) => n + Number(c.unread || 0), 0);
  const nav = el('nav', { class: 'tabbar' }, Router.tabs.map(tb => el('button', { class: 'tab rip' + (tb.id === active ? ' on' : ''), type: 'button', 'aria-label': tb.label, onclick: () => { if (tb.id !== active) Router.go(tb.id, {}, { replace: true }); } },
    icon(tb.icon), el('span', { text: tb.label }), tb.id === 'chats' && unread ? el('i', { class: 'tb-badge', text: unread > 99 ? '99+' : String(unread) }) : null)));
  return el('section', { class: 'tabs-screen' }, el('div', { class: 'tab-body' }, ...kids), nav);
}
export function initRipple() {
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest?.('.rip'); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2, s = el('span', { class: 'rp' });
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    b.append(s); setTimeout(() => s.remove(), 650);
  });
}
// loadCss(new URL('./x.css', import.meta.url)) — подключить css модуля
export function loadCss(href) { document.head.append(el('link', { rel: 'stylesheet', href: String(href) })); }
export const UI = { el, icon, toast, sheet, dialog, tabbed, initRipple, loadCss };
