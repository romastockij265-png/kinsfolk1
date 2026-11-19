// Запуск: ядро → модули → старт. Сломанный модуль не роняет приложение.
import * as config from './core/config.js';
import { Log } from './core/log.js';
import { Hooks } from './core/hooks.js';
import { Store } from './core/store.js';
import { Router } from './core/router.js';
import { UI } from './core/ui.js';
import { Api } from './core/api.js';
import { I18n } from './core/i18n.js';
import { Guard } from './core/guard.js';

Log.install(); UI.initRipple(); I18n.setLang('ru');
const ctx = { config, Hooks, Store, Router, UI, Api, I18n, Log, Guard };
window.Kinsfolk = { version: config.APP_VERSION }; // для отладки

// Чтобы убрать модуль — удалите его строку. Остальное продолжит работать.
const MODULES = ['settings'];
const loaded = [];
for (const name of MODULES) {
  try { (await import(`./features/${name}/index.js`)).register(ctx); loaded.push(name); }
  catch (e) { Log.error('module:' + name, e); }
}
Store.set('modules', loaded);

// Мост: события входа Supabase → Hooks (активируется, когда ключи вписаны)
if (config.isConfigured() || window.__SB__) {
  Api.onAuth((event, session) => {
    Store.set('user', session?.user || null);
    Hooks.run('auth:state', { event, session });
    if (event === 'SIGNED_IN') Hooks.run('auth:signed-in', session);
    if (event === 'SIGNED_OUT') Hooks.run('auth:signed-out');
  }).catch(e => Log.error('auth-bridge', e));
}
await Hooks.run('app:ready');
if (!Router.current()) Router.go(Router.home, {}, { replace: true });
