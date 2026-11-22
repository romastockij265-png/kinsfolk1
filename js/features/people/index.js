// Модуль «Люди»: поиск по @username и имени.
import './strings.js';
import { peopleScreen } from './search.js';
export function register(ctx) {
  ctx.UI.loadCss(new URL('../../../css/auth.css', import.meta.url));
  ctx.Router.register('people', () => peopleScreen(ctx));
}
