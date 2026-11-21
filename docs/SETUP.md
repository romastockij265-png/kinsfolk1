# Что нажать (этап 1) — по порядку
## A. База данных (Supabase)
1. Supabase → слева **SQL Editor** → **New query**.
2. Откройте в GitHub файл supabase/stage1_all.sql → кнопка Copy raw file → вставьте в Supabase.
3. Нажмите **Run**. Должно быть «Success». Запускать повторно можно.
## B. Настройки входа (пароли не нужны)
1. Authentication → **Sign In / Providers** → **Email**: провайдер включён; разрешена регистрация новых пользователей (Allow new users to sign up).
2. Там же: длина кода (Email OTP Length) — 6; срок кода (Email OTP Expiration) — 600 секунд. Если какого-то поля нет — пропустите.
3. Authentication → **URL Configuration**: Site URL и Redirect URLs уже заданы на этапе 0.
## C. Шаблоны писем
Authentication → **Emails** → **Templates**. Откройте docs/email-templates.md и вставьте шаблоны Confirm sign up (его получают НОВЫЕ пользователи) и Magic Link (его получают существующие). Reset Password не используется. Без этого придёт ссылка вместо кода.
## D. Отправка писем (свой SMTP, иначе — 2 письма в час и только вам)
1. brevo.com → вход → **Senders, domains** → добавьте и подтвердите свой Gmail как отправителя.
2. Brevo → **SMTP & API** → вкладка **SMTP**: запишите **Login**; нажмите **Generate a new SMTP key** и скопируйте ключ (показывается один раз).
3. Supabase → Authentication → **Emails** → **SMTP Settings** → включите Custom SMTP. Sender email — подтверждённый Gmail; Sender name — Kinsfolk; Host — smtp-relay.brevo.com; Port — 587; Username — Login из Brevo; Password — SMTP-ключ. **Save**.
4. Тест: зарегистрируйтесь на второй свой почте. Если письмо в «Спаме» — это обычная беда отправки «от Gmail» без своего домена; решение — свой домен (~1000 ₽/год).
## E. Загрузка
Распакуйте kinsfolk-stage1.zip в корень репозитория. Ваш js/core/config.js НЕ входит в архив — ключи не затрутся.
## Капча (Turnstile)
В этот этап не включена: пока вход проверен только лимитами писем. Если появятся левые регистрации — включим (Authentication → Attack Protection).
