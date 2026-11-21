// Экраны: вход, регистрация, сброс пароля, вход по коду.
import { el } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { Guard } from '../../core/guard.js';
import { Api } from '../../core/api.js';
import { Router } from '../../core/router.js';
import { S, shell, msg, button, busy, emailField, pwField, meter } from './forms.js';

const link = (text, fn) => el('button', { type: 'button', class: 'link', onclick: fn }, text);
const goEmail = e => Guard.isEmail(e);

export function loginScreen(flow, params = {}) {
  const em = emailField(params.email || ''), pw = pwField('current-password'), err = msg(), go = button(S('go')), extra = el('div');
  if (params.note) err.set(params.note, 'note');
  const form = el('form', { novalidate: true, onsubmit: async e => {
    e.preventDefault(); const email = em.i.value.trim().toLowerCase(); extra.replaceChildren();
    if (!goEmail(email)) return err.set(S('badEmail'));
    if (!pw.i.value) return err.set(S('noPw'));
    err.set(''); busy(go, true);
    try { const d = await Api.auth.signIn(email, pw.i.value); await flow.enter(d.session); }
    catch (x) {
      err.set(t(x.key || 'err.generic'));
      if (x.key === 'err.notconfirmed') extra.append(el('button', { type: 'button', class: 'btn ghost rip', onclick: async () => { try { await Api.auth.resendSignup(email); Router.go('code', { kind: 'signup', email }); } catch (y) { err.set(t(y.key)); } } }, S('enterCode')));
    } finally { busy(go, false); }
  } }, em.wrap, pw.wrap, err.el, go, extra);
  return shell(el('h1', { text: S('login') }), el('p', { class: 'sub', text: S('loginSub') }), form,
    el('div', { class: 'links' }, link(S('byCode'), () => Router.go('codeLogin', { email: em.i.value.trim() })), link(S('forgot'), () => Router.go('forgot', { email: em.i.value.trim() })), link(S('create'), () => Router.go('signup', { email: em.i.value.trim() }))));
}

export function signupScreen(flow, params = {}) {
  const em = emailField(params.email || ''), pw = pwField('new-password'), err = msg(), go = button(S('getCode'));
  const form = el('form', { novalidate: true, onsubmit: async e => {
    e.preventDefault(); const email = em.i.value.trim().toLowerCase();
    if (!goEmail(email)) return err.set(S('badEmail'));
    if (pw.i.value.length < 8) return err.set(S('shortPw'));
    err.set(''); busy(go, true);
    try {
      const d = await Api.auth.signUp(email, pw.i.value);
      if (d.session) return flow.enter(d.session);
      if (d.user && d.user.identities && d.user.identities.length === 0) return err.set(t('err.exists'));
      Router.go('code', { kind: 'signup', email });
    } catch (x) { err.set(t(x.key || 'err.generic')); } finally { busy(go, false); }
  } }, em.wrap, pw.wrap, meter(pw.i), err.el, go);
  return shell(el('h1', { text: S('signup') }), el('p', { class: 'sub', text: S('signupSub') }), form, el('div', { class: 'links' }, link(S('haveAcc'), () => Router.go('login', { email: em.i.value.trim() }))));
}

function emailOnly(title, sub, kind, fn, params) {
  const em = emailField(params.email || ''), err = msg(), go = button(S('getCode'));
  const form = el('form', { novalidate: true, onsubmit: async e => {
    e.preventDefault(); const email = em.i.value.trim().toLowerCase();
    if (!goEmail(email)) return err.set(S('badEmail'));
    err.set(''); busy(go, true);
    try { await fn(email); Router.go('code', { kind, email }); } catch (x) { err.set(t(x.key || 'err.generic')); } finally { busy(go, false); }
  } }, em.wrap, err.el, go);
  return shell(el('h1', { text: title }), el('p', { class: 'sub', text: sub }), form, el('div', { class: 'links' }, link(S('cancel'), () => Router.go('login', { email: em.i.value.trim() }))));
}
export const forgotScreen = (flow, p = {}) => emailOnly(S('forgotTitle'), S('forgotSub'), 'recovery', Api.auth.reset, p);
export const codeLoginScreen = (flow, p = {}) => emailOnly(S('codeLogin'), S('codeLoginSub'), 'email', Api.auth.sendCode, p);
