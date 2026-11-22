// Модуль «Настройки»: вкладки «Настройки» и «Профиль», экраны «О программе» и «Журнал».
import './strings.js';
import { aboutScreen } from './about.js';
import { logScreen } from './logView.js';
import { accountScreen } from './account.js';
import { settingsScreen } from './settingsScreen.js';
import { applyTheme, toggleTheme } from './theme.js';
export function register(ctx) {
  ctx.UI.loadCss(new URL('./settings.css', import.meta.url));
  applyTheme();
  ctx.Hooks.on('theme:toggle', () => toggleTheme());
  ctx.Router.addTab({ id: 'settings', label: ctx.I18n.t('s.tab'), icon: 'gear', order: 3 });
  ctx.Router.addTab({ id: 'account', label: ctx.I18n.t('ac.tab'), icon: 'user', order: 4 });
  ctx.Router.register('settings', () => settingsScreen(ctx));
  ctx.Router.register('account', () => accountScreen(ctx));
  ctx.Router.register('about', () => aboutScreen(ctx));
  ctx.Router.register('log', () => logScreen(ctx));
}
