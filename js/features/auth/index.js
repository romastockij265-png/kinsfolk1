// Модуль «Вход»: маршрутизация между экранами по состоянию сессии.
import './strings.js';
import { el } from '../../core/ui.js';
import { t } from '../../core/i18n.js';
import { loginScreen, signupScreen, forgotScreen, codeLoginScreen } from './screens.js';
import { codeScreen, newPassScreen } from './codeScreen.js';
import { S, shell, button, busy } from './forms.js';

export function register({ Hooks, Router, Store, Api, UI, config }) {
  UI.loadCss(new URL('../../../css/auth.css', import.meta.url));
  const st = { uid: null, recovering: false }; let entering = null;
  const flow = { st, enter };
  async function enter(session) {
    if (!session) { st.uid = null; return Router.go('login', {}, { replace: true }); }
    const uid = session.user.id;
    if (entering === uid) return; entering = uid;
    try {
      const p = await Api.profiles.get(uid);
      st.uid = uid; Store.set('user', session.user); Store.set('profile', p || null);
      Router.go(p ? 'account' : 'setup', {}, { replace: true });
    } catch (x) {
      if (x.key === 'err.session') { await Api.auth.signOut('local').catch(() => {}); Router.go('login', { note: t('err.session') }, { replace: true }); }
      else Router.go('retry', { msg: t(x.key || 'err.generic'), again: () => enter(session) }, { replace: true });
    } finally { entering = null; }
  }
  Router.register('login', p => loginScreen(flow, p));
  Router.register('signup', p => signupScreen(flow, p));
  Router.register('forgot', p => forgotScreen(flow, p));
  Router.register('codeLogin', p => codeLoginScreen(flow, p));
  Router.register('code', p => codeScreen(flow, p));
  Router.register('newpass', p => newPassScreen(flow, p));
  Router.register('retry', p => {
    const b = button(S('retry'));
    const f = el('form', { onsubmit: async e => { e.preventDefault(); busy(b, true); try { await p.again(); } finally { busy(b, false); } } }, b);
    return shell(el('h1', { text: S('loadFail') }), el('p', { class: 'sub', text: p.msg }), f);
  });
  Hooks.on('app:ready', async () => {
    if (!config.isConfigured() && !window.__SB__) return; // без ключей остаётся экран «О программе»
    try { await enter(await Api.session()); } catch (x) { Router.go('retry', { msg: t(x.key || 'err.generic'), again: async () => enter(await Api.session()) }, { replace: true }); }
  });
  Hooks.on('auth:signed-in', s => { if (!st.recovering && st.uid !== s?.user?.id) enter(s); });
  Hooks.on('auth:signed-out', () => {
    const manual = Store.get('manualOut'), keep = Store.get('loginNote') || ''; Store.set('manualOut', false); Store.set('loginNote', '');
    const was = !!st.uid; st.uid = null; Store.set('user', null); Store.set('profile', null);
    if (!st.recovering) Router.go('login', { note: keep || (!manual && was ? t('err.session') : '') }, { replace: true });
  });
  Hooks.on('profile:saved', p => { Store.set('profile', p); Router.go('account', {}, { replace: true }); });
}
