# Что нажать (этап 0)
1. supabase.com → Sign in → New project (бесплатный план). Запомните пароль базы, регион — ближайший.
2. Project Settings → API: скопируйте Project URL и публичный ключ (anon / publishable). Секретный ключ (service_role / secret) НЕ копировать никуда.
3. В GitHub откройте js/core/config.js → значок карандаша → вставьте URL и ключ вместо YOUR-... → Commit.
4. Supabase → Authentication → URL Configuration: Site URL = https://romastockij265-png.github.io/kinsfolk1/ ; в Redirect URLs добавьте тот же адрес.
5. Почта (понадобится на этапе 1): зарегистрируйтесь на brevo.com, подтвердите адрес отправителя. Письма «от Gmail» через Brevo могут попадать в спам — это выясним тестом; надёжнее свой домен.
Шрифты: сейчас системные. Файлы woff2 (Space Grotesk, Manrope, JetBrains Mono) положите в fonts/ — подключу на следующем этапе.
