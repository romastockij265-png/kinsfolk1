// 6 ячеек: автопереход, вставка целого кода, автоотправка, автозаполнение из письма/SMS.
import { el } from '../../core/ui.js';
export function createOtp({ onComplete, length = 6 }) {
  const cells = Array.from({ length }, (_, i) => el('input', {
    type: 'text', inputmode: 'numeric', maxlength: i === 0 ? String(length) : '1', autocomplete: 'one-time-code',
    'aria-label': `Цифра ${i + 1}`, placeholder: ' ', pattern: '[0-9]*'
  }));
  const root = el('div', { class: 'otp' }, cells);
  const value = () => cells.map(c => c.value).join('');
  const finish = () => { const v = value(); if (v.length === length) onComplete(v); };
  const fill = (from, digits) => {
    const d = digits.replace(/\D/g, '').slice(0, length - from);
    [...d].forEach((ch, k) => { cells[from + k].value = ch; });
    cells[Math.min(from + d.length, length - 1)].focus();
    finish();
  };
  cells.forEach((c, i) => {
    c.addEventListener('input', () => { const v = c.value.replace(/\D/g, ''); if (v.length > 1) { c.value = ''; fill(i, v); } else { c.value = v; if (v && i < length - 1) cells[i + 1].focus(); finish(); } });
    c.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !c.value && i > 0) { cells[i - 1].value = ''; cells[i - 1].focus(); }
      if (e.key === 'ArrowLeft' && i > 0) cells[i - 1].focus();
      if (e.key === 'ArrowRight' && i < length - 1) cells[i + 1].focus();
    });
    c.addEventListener('paste', e => { e.preventDefault(); fill(i, (e.clipboardData || window.clipboardData).getData('text')); });
    c.addEventListener('focus', () => c.select());
  });
  return {
    el: root, value,
    clear() { cells.forEach(c => (c.value = '')); cells[0].focus(); },
    focus: () => cells[0].focus(),
    setDisabled: b => cells.forEach(c => (c.disabled = b)),
    shake() { root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake'); }
  };
}
