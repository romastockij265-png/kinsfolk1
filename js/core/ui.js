// Интерфейсные помощники. Пользовательский текст — только через textContent (el()).
import { t } from './i18n.js';
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
  check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'
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
export const UI = { el, icon, toast, sheet, dialog, initRipple, loadCss };
