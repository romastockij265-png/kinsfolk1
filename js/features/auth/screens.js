// Экран входа: только почта → код. Новый и существующий пользователь входят одинаково.
import { el } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { Guard } from '../../core/guard.js';
import { Api } from '../../core/api.js';
import { Router } from '../../core/router.js';
import { S, shell, msg, button, busy, emailField } from './forms.js';

export function loginScreen(flow, params = {}) {
  const em = emailField(params.email || ''), err = msg(), go = button(S('getCode'));
  if (params.note) err.set(params.note, 'note');
  const form = el('form', { novalidate: true, onsubmit: async e => {
    e.preventDefault(); const email = em.i.value.trim().toLowerCase();
    if (!Guard.isEmail(email)) return err.set(S('badEmail'));
    err.set(''); busy(go, true);
    try { await Api.auth.sendCode(email); Router.go('code', { email }); }
    catch (x) { err.set(t(x.key || 'err.generic')); } finally { busy(go, false); }
  } }, em.wrap, err.el, go);
  setTimeout(() => em.i.isConnected && !params.note && em.i.focus(), 350);
  return shell(el('h1', { text: S('login') }), el('p', { class: 'sub', text: S('loginSub') }), form,
    el('button', { type: 'button', class: 'link', onclick: () => Router.go('log') }, S('log')));
}
