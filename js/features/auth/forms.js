// Общие кусочки форм входа (без innerHTML с пользовательским текстом).
import { el, icon } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
export const S = k => t('a.' + k);
export const shell = (...kids) => el('section', { class: 'auth' }, el('div', { class: 'brand' }, icon('logo'), el('span', { text: 'Kinsfolk' })), ...kids);
export function msg() { const e = el('p', { class: 'err', role: 'alert' }); return { el: e, set(txt, cls = 'err') { e.textContent = txt || ''; e.className = cls + (txt ? ' on' : ''); } }; }
export function button(label, extra = '') { return el('button', { class: 'btn rip ' + extra, type: 'submit' }, el('i', { class: 'spin' }), el('b', { text: label })); }
export const busy = (b, on) => { b.disabled = on; b.classList.toggle('busy', on); };
export function emailField(value = '') {
  const i = el('input', { id: 'email', type: 'email', inputmode: 'email', autocomplete: 'email', autocapitalize: 'off', spellcheck: 'false', placeholder: 'name@example.com', value });
  return { i, wrap: el('label', { class: 'fld' }, el('span', { text: S('email') }), i) };
}
export function pwField(ac, id = 'pw') {
  const i = el('input', { id, type: 'password', autocomplete: ac, placeholder: '••••••••', autocapitalize: 'off' });
  const eye = el('button', { type: 'button', class: 'eye', 'aria-label': S('show'), onclick: () => { const s = i.type === 'password'; i.type = s ? 'text' : 'password'; eye.replaceChildren(icon(s ? 'eyeoff' : 'eye')); } }, icon('eye'));
  return { i, wrap: el('label', { class: 'fld' }, el('span', { text: S('pw') }), el('div', { class: 'pw' }, i, eye)) };
}
export function level(p) {
  if (p.length < 8) return 0;
  const n = [/[a-zа-я]/, /[A-ZА-Я]/, /\d/, /[^\w\s]/].filter(r => r.test(p)).length + (p.length >= 12 ? 1 : 0);
  return n <= 1 ? 1 : n <= 3 ? 2 : 3;
}
export function meter(input) {
  const bars = [0, 1, 2].map(() => el('i')), lab = el('small', { class: 'mono', text: S('min8') });
  const upd = () => { const l = level(input.value); bars.forEach((b, k) => (b.className = k < l ? 'l' + l : '')); lab.textContent = l === 0 ? S('min8') : S(['', 'weak', 'mid', 'strong'][l]); };
  input.addEventListener('input', upd);
  return el('div', { class: 'meter' }, el('div', {}, bars), lab);
}
