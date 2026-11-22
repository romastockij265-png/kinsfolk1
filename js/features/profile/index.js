import './strings.js';
import { setupScreen } from './setup.js';
import { profileForm } from './form.js';
export function register({ Router, Store, UI, I18n }) {
  UI.loadCss(new URL('../../../css/auth.css', import.meta.url));
  Router.register('setup', () => setupScreen());
  Router.register('editProfile', () => profileForm({ title: I18n.t('p.edit'), user: Store.get('user') || {}, profile: Store.get('profile'), submitLabel: I18n.t('p.save'), withBio: true, onCancel: () => Router.back() }));
}
