# Шаблоны писем (вставить в Supabase)
Authentication → Emails → Templates. Для КАЖДОГО из трёх шаблонов: в поле Subject вставьте тему, в поле Message — HTML, нажмите Save.
ВАЖНО: в тексте должно остаться {{ .Token }} — это и есть код.

## Confirm sign up
Subject:
```
Kinsfolk: код подтверждения {{ .Token }}
```
Message (HTML):
```html
<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:28px;background:#10141D;color:#E8EDF7;border-radius:18px">
  <h2 style="margin:0 0 6px;font-size:22px">Kinsfolk</h2>
  <p style="margin:0 0 18px;color:#8D9AB3">Ваш код для подтверждения почты:</p>
  <div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#9DB9F5;margin:0 0 18px">{{ .Token }}</div>
  <p style="margin:0;color:#8D9AB3;font-size:13px">Код действует ограниченное время. Если вы не регистрировались — просто проигнорируйте письмо.</p>
</div>
```

## Magic Link
Subject:
```
Kinsfolk: код для входа {{ .Token }}
```
Message (HTML):
```html
<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:28px;background:#10141D;color:#E8EDF7;border-radius:18px">
  <h2 style="margin:0 0 6px;font-size:22px">Kinsfolk</h2>
  <p style="margin:0 0 18px;color:#8D9AB3">Ваш код для входа:</p>
  <div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#9DB9F5;margin:0 0 18px">{{ .Token }}</div>
  <p style="margin:0;color:#8D9AB3;font-size:13px">Никому не сообщайте код. Если это были не вы — проигнорируйте письмо.</p>
</div>
```

## Reset Password
Subject:
```
Kinsfolk: код для сброса пароля {{ .Token }}
```
Message (HTML):
```html
<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:28px;background:#10141D;color:#E8EDF7;border-radius:18px">
  <h2 style="margin:0 0 6px;font-size:22px">Kinsfolk</h2>
  <p style="margin:0 0 18px;color:#8D9AB3">Ваш код для сброса пароля:</p>
  <div style="font-size:36px;letter-spacing:10px;font-weight:700;color:#9DB9F5;margin:0 0 18px">{{ .Token }}</div>
  <p style="margin:0;color:#8D9AB3;font-size:13px">Если вы не запрашивали сброс — проигнорируйте письмо, пароль не изменится.</p>
</div>
```

