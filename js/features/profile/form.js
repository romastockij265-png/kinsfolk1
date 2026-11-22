// Общая форма профиля: «Создайте профиль» (этап 1) и «Изменить профиль» (этап 2).
import { el, icon } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { Guard, LIMITS } from '../../core/guard.js';
import { Api } from '../../core/api.js';
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
export function profileForm({ title, sub, user, profile = null, submitLabel, withBio = false, onCancel = null }) {
  const uid = user.id, oldName = profile?.username || '', oldAvatar = Guard.safeUrl(profile?.avatar_url || '');
  let blob = null, ok = !!profile, seq = 0, timer;
  const name = el('input', { id: 'dn', maxlength: String(LIMITS.name), autocomplete: 'name', placeholder: 'Как вас зовут', value: profile?.display_name || (user.email || '').split('@')[0].slice(0, LIMITS.name) });
  const un = el('input', { id: 'un', maxlength: String(LIMITS.username), autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false', placeholder: 'username', value: oldName });
  const bio = el('textarea', { id: 'bio', maxlength: String(LIMITS.bio), rows: '3', placeholder: P('bioPh') }); bio.value = profile?.bio || '';
  const st = el('p', { class: 'st', 'aria-live': 'polite' }), err = msg(), go = button(submitLabel);
  const prev = el('div', { class: 'ava' }, oldAvatar ? el('img', { alt: '', src: oldAvatar }) : el('span', { text: '+' }));
  const file = el('input', { type: 'file', accept: 'image/*', 'aria-label': P('photo') });
  prev.append(icon('camera'), file);
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return; const c = Guard.checkFile(f, 'image'); if (!c.ok) return err.set(c.reason);
    try { blob = await resize(f); prev.replaceChildren(el('img', { alt: '', src: URL.createObjectURL(blob) }), file); err.set(''); } catch { blob = null; err.set(P('photoBad')); }
  };
  const mark = (txt, cls = '') => { st.textContent = txt; st.className = 'st mono ' + cls; };
  mark(profile ? '' : P('rule'));
  un.oninput = () => {
    un.value = un.value.toLowerCase().replace(/[^a-z0-9_]/g, ''); clearTimeout(timer); const v = un.value, my = ++seq;
    if (profile && v === oldName) { ok = true; return mark(''); }
    ok = false;
    if (!Guard.isUsername(v)) return mark(P('rule'), v ? 'bad' : '');
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
      let avatar_url = profile?.avatar_url ?? null;
      if (blob) { try { avatar_url = await Api.profiles.uploadAvatar(uid, blob); } catch { err.set(P('photoBad')); return; } }
      const row = { id: uid, username: un.value, display_name: Guard.clamp(dn, LIMITS.name), avatar_url };
      if (withBio) row.bio = Guard.clamp(bio.value.trim(), LIMITS.bio) || null; else if (profile) row.bio = profile.bio ?? null;
      const p = await Api.profiles.save(row);
      if (blob && oldAvatar) Api.profiles.removeAvatarFile(oldAvatar);
      await Hooks.run('profile:saved', p);
    } catch (x) { if (x.key === 'err.taken') { ok = false; mark(t('err.taken'), 'bad'); } err.set(t(x.key || 'err.generic')); } finally { busy(go, false); }
  } },
  prev, el('label', { class: 'fld' }, el('span', { text: P('name') }), name),
  el('label', { class: 'fld' }, el('span', { text: P('user') }), el('div', { class: 'pre' }, el('b', { text: '@' }), un)), st,
  withBio ? el('label', { class: 'fld' }, el('span', { text: P('bio') }), bio) : null, err.el, go,
  onCancel ? el('button', { type: 'button', class: 'link', onclick: onCancel }, P('cancel')) : null);
  return shell(el('h1', { text: title }), sub ? el('p', { class: 'sub', text: sub }) : null, form);
}
