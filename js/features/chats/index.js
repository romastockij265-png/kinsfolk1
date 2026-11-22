// Модуль «Чаты»: список, поиск, непрочитанные; подписка на новые сообщения «вживую».
import './strings.js';
import { chatsScreen } from './list.js';
export function register(ctx) {
  const { Hooks, Router, Store, Api, Log, UI, I18n } = ctx;
  UI.loadCss(new URL('./chats.css', import.meta.url));
  Router.addTab({ id: 'chats', label: I18n.t('c.tab'), icon: 'chats', order: 1 });
  Router.register('chats', () => chatsScreen(ctx));
  let timer, stop = null;
  const refresh = () => { clearTimeout(timer); timer = setTimeout(async () => { try { Store.set('chats', await Api.chats.list()); } catch (e) { Log.error('chats.refresh', e); } }, 250); };
  Hooks.on('chats:refresh', refresh);
  const start = async me => {
    if (stop) stop(); stop = null;
    try { stop = await Api.chats.subscribe(me, { message: row => { Hooks.run('message:received', row); refresh(); }, members: refresh, status: s => { if (s === 'SUBSCRIBED') { Hooks.run('realtime:ready'); refresh(); } } }); }
    catch (e) { Log.error('realtime', e); }
  };
  Store.on('profile', p => { if (p) start(p.id); else { if (stop) stop(); stop = null; Store.set('chats', []); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Store.get('profile')) refresh(); });
}
