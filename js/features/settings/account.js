// Экран «Аккаунт»: профиль, смена пароля, выход, выход везде, удаление аккаунта.
import { t } from '../../core/i18n.js';
export function accountScreen({ UI, Router, Store, Api, Guard, config }) {
  const { el, icon, dialog, toast } = UI, p = Store.get('profile') || {}, u = Store.get('user') || {};
  const url = Guard.safeUrl(p.avatar_url || '');
  const ava = el('div', { class: 'ava solid' }, url ? el('img', { alt: '', src: url }) : el('span', { text: (p.display_name || '?').slice(0, 1).toUpperCase() }));
  const out = async scope => { Store.set('manualOut', true); try { await Api.auth.signOut(scope); } catch { toast(t('err.generic')); } };
  const row = (ic, label, fn, cls = '') => el('button', { class: 'btn ghost rip ' + cls, type: 'button', onclick: fn }, icon(ic), label);
  return el('section', { class: 'auth home' },
    ava, el('h1', { text: p.display_name || '' }), el('p', { class: 'sub mono', text: '@' + (p.username || '') }), el('p', { class: 'sub mono', text: u.email || '' }),
    row('logout', t('ac.out'), () => out('local')),
    row('logout', t('ac.outAll'), async () => { if (await dialog({ title: t('ac.outAllQ'), text: t('ac.outAllT'), ok: t('ac.outAll') })) out('global'); }),
    row('info', t('ac.about'), () => Router.go('about')),
    row('trash', t('ac.del'), async () => {
      if (!(await dialog({ title: t('ac.delQ'), text: t('ac.delT'), ok: t('ac.delOk'), danger: true }))) return;
      try { await Api.auth.deleteAccount(); } catch (x) { return toast(t(x.key || 'err.generic')); }
      Store.set('manualOut', true); Store.set('loginNote', t('ac.deleted'));
      await Api.auth.signOut('local').catch(() => {});
      setTimeout(() => { if (Router.current() === 'account') Router.go('login', { note: t('ac.deleted') }, { replace: true }); }, 400);
    }, 'dt'),
    el('p', { class: 'sub mono', text: 'v' + config.APP_VERSION }));
}
