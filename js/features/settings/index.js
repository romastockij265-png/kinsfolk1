// Модуль «Настройки»: на этапе 0 — только «О программе» и «Журнал».
import { aboutScreen } from './about.js';
import { logScreen } from './logView.js';
export function register(ctx) {
  ctx.UI.loadCss(new URL('./settings.css', import.meta.url));
  ctx.Router.register('about', () => aboutScreen(ctx));
  ctx.Router.register('log', () => logScreen(ctx));
}
