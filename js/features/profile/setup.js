// Экран «Создайте профиль»: имя, @username (проверка вживую), фото.
import { el, icon } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { Guard, LIMITS } from '../../core/guard.js';
import { Api } from '../../core/api.js';
import { Store } from '../../core/store.js';
import { Hooks } from '../../core/hooks.js';
import { shell, msg, button, busy } from '../auth/forms.js';

const P = k => t('p.' + k);
function resize(file, px = 256) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, px / Math.min(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); c.toBlob(b => (b ? res(b) : rej(new Error('blob'))), 'image/jpeg', .85); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); }; img.src = url;
  });
}
export function setupScreen() {
  const user = Store.get('user') || {}, uid = user.id;
  let blob = null, ok = false, seq = 0, timer;
  const name = el('input', { id: 'dn', maxlength: String(LIMITS.name), autocomplete: 'name', placeholder: 'Как вас зовут', value: (user.email || '').split('@')[0].slice(0, LIMITS.name) });
  const un = el('input', { id: 'un', maxlength: String(LIMITS.username), autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', placeholder: 'username' });
  const st = el('p', { class: 'st', 'aria-live': 'polite' }), err = msg(), go = button(P('go'));
  const prev = el('div', { class: 'ava' }, el('span', { text: '+' }));
  const file = el('input', { type: 'file', accept: 'image/*', 'aria-label': P('photo') });
  prev.append(icon('camera'), file);
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return; const c = Guard.checkFile(f, 'image'); if (!c.ok) return err.set(c.reason);
    try { blob = await resize(f); const im = el('img', { alt: '', src: URL.createObjectURL(blob) }); prev.replaceChildren(im, file); err.set(''); } catch { blob = null; err.set(P('photoBad')); }
  };
  const mark = (txt, cls = '') => { st.textContent = txt; st.className = 'st mono ' + cls; };
  mark(P('rule'));
  un.oninput = () => {
    un.value = un.value.toLowerCase().replace(/[^a-z0-9_]/g, ''); ok = false; clearTimeout(timer); const v = un.value, my = ++seq;
    if (!Guard.isUsername(v)) return mark(v ? P('rule') : P('rule'), v ? 'bad' : '');
    mark(P('busy'));
    timer = setTimeout(async () => {
      try { const free = await Api.profiles.usernameFree(v, uid); if (my !== seq) return; ok = free; mark(free ? P('free') : t('err.taken'), free ? 'ok' : 'bad'); } catch { if (my === seq) mark(P('checkFail'), 'bad'); }
    }, 350);
  };
  const form = el('form', { novalidate: true, onsubmit: async e => {
    e.preventDefault(); const dn = name.value.trim();
    if (!dn) return err.set(P('noName'));
    if (!ok) return err.set(P('rule'));
    err.set(''); busy(go, true);
    try {
      let avatar_url = null;
      if (blob) { try { avatar_url = await Api.profiles.uploadAvatar(uid, blob); } catch { err.set(P('photoBad')); return; } }
      const p = await Api.profiles.save({ id: uid, username: un.value, display_name: Guard.clamp(dn, LIMITS.name), avatar_url });
      await Hooks.run('profile:saved', p);
    } catch (x) { if (x.key === 'err.taken') { ok = false; mark(t('err.taken'), 'bad'); } err.set(t(x.key || 'err.generic')); } finally { busy(go, false); }
  } },
  prev, el('label', { class: 'fld' }, el('span', { text: P('name') }), name),
  el('label', { class: 'fld' }, el('span', { text: P('user') }), el('div', { class: 'pre' }, el('b', { text: '@' }), un)), st, err.el, go);
  return shell(el('h1', { text: P('title') }), el('p', { class: 'sub', text: P('sub') }), form);
}
