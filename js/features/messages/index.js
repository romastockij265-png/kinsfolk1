// Модуль «Сообщения»: экран чата (отправка, история по 50, приём «вживую»).
import './strings.js';
import { chatScreen } from './screen.js';
export function register(ctx) {
  ctx.UI.loadCss(new URL('./chat.css', import.meta.url));
  ctx.Router.register('chat', p => chatScreen(ctx, p));
}
