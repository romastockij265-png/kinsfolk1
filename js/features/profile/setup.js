import { t } from '../../core/i18n.js';
import { Store } from '../../core/store.js';
import { profileForm } from './form.js';
export const setupScreen = () => profileForm({ title: t('p.title'), sub: t('p.sub'), user: Store.get('user') || {}, submitLabel: t('p.go') });
