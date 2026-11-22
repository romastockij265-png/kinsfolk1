# Где что лежит
| Что | Файл | Функция |
|---|---|---|
| Версия, ключи Supabase | js/core/config.js | APP_VERSION, SUPABASE_URL, SUPABASE_ANON_KEY |
| Журнал ошибок | js/core/log.js | Log.error/info/list/text/clear |
| События | js/core/hooks.js | Hooks.on/off/run |
| Состояние | js/core/store.js | Store.get/set/on |
| Экраны, «назад» | js/core/router.js | Router.register/go/back |
| Тост, шторка, диалог, ripple | js/core/ui.js | toast, sheet, dialog, initRipple, el |
| Строки | js/core/i18n.js | t, i18nAdd |
| Проверки, лимиты | js/core/guard.js | esc, checkFile, LIMITS |
| Supabase | js/core/api.js | sb, call, errKey, Api.session/onAuth |
| Запуск | js/main.js | список MODULES |
| О программе, Журнал | js/features/settings/ | about.js, logView.js |
| Версия | js/core/version.js | APP_VERSION |
| Вызовы входа и профиля | js/core/api.js | Api.auth.*, Api.profiles.* |
| Маршрутизация по сессии | js/features/auth/index.js | enter(), хуки auth:* |
| Экран входа (почта) | js/features/auth/screens.js | loginScreen |
| Экран кода | js/features/auth/codeScreen.js | codeScreen |
| 6 ячеек кода | js/features/auth/otpInput.js | createOtp |
| Общие поля форм | js/features/auth/forms.js | emailField, msg, button |
| Создание профиля | js/features/profile/setup.js | setupScreen |
| Аккаунт (выход, удаление) | js/features/settings/account.js | accountScreen |
| SQL этапа 1 | supabase/schema.sql, policies.sql, storage.sql, stage1_all.sql | |
| Сборка APK | docs/build-apk.yml.txt → .github/workflows/build-apk.yml | workflow «Build APK» |
| Значки и ключ подписи APK | assets/ | android/res, debug.keystore |
| Форма профиля (создание/правка) | js/features/profile/form.js | profileForm |
| Поиск людей | js/features/people/search.js | peopleScreen |
| Поиск в API | js/core/api.js | Api.profiles.search, removeAvatarFile |
| Вкладки (панель снизу) | js/core/router.js, js/core/ui.js | Router.addTab, UI.tabbed |
| Список чатов | js/features/chats/list.js | chatsScreen |
| Подписка на сообщения «вживую» | js/features/chats/index.js, js/core/api.js | Api.chats.subscribe |
| Экран чата | js/features/messages/screen.js | chatScreen |
| Чаты и сообщения в API | js/core/api.js | Api.chats.list/start/messages/send/markRead |
| Тема и размер текста | js/features/settings/theme.js | setTheme, setSize |
| Вкладки Контакты / Настройки / Профиль | people/search.js, settings/settingsScreen.js, settings/account.js | |
| SQL этапа 3 | supabase/stage3.sql | таблицы, RLS, my_chats, start_direct_chat |
