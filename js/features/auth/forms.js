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
