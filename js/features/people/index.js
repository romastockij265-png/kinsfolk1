// Модуль «Контакты»: поиск людей и начало личного чата.
import './strings.js';
import { peopleScreen } from './search.js';
export function register(ctx) {
  ctx.UI.loadCss(new URL('../../../css/auth.css', import.meta.url));
  ctx.Router.addTab({ id: 'contacts', label: ctx.I18n.t('pe.tab'), icon: 'users', order: 2 });
  ctx.Router.register('contacts', () => peopleScreen(ctx));
}
