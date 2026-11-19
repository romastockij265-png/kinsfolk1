# Архитектура
Ядро (js/core) маленькое и стабильное. Всё остальное — модули в js/features/<имя>/ с функцией register(ctx).
ctx = { config, Hooks, Store, Router, UI, Api, I18n, Log, Guard }.
## Правила
- Модуль общается с другими только через Hooks и Store, в чужие файлы не лезет.
- Весь доступ к Supabase — только core/api.js (call(), Api.*).
- Пользовательский текст в DOM — только через UI.el() (textContent) или Guard.esc().
- Файл больше ~400 строк режем. Модуль включается строкой в MODULES в js/main.js; удалили строку — остальное работает.
- Сломанный модуль пишет ошибку в журнал и не роняет приложение (main.js, hooks.js).
## События (Hooks)
app:ready · route:changed · ui:rendered · auth:state · auth:signed-in · auth:signed-out
Позже: chat:opened, message:received, call:started, settings:rendered.
## Ядро
config (версия, ключи) · log (50 записей) · hooks · store (user, profile, chats, route, modules) · router (экраны + «назад») · ui (el, icon, toast, sheet, dialog, ripple) · i18n (t, i18nAdd) · guard (esc, лимиты, проверка файлов) · api (sb, call с повторами только при сети/5xx).
