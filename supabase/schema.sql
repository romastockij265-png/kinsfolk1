-- ЭТАП 1. Таблица профилей. Можно запускать повторно (if not exists).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null,
  avatar_url text,
  bio text,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$'),
  constraint profiles_name_len check (char_length(display_name) between 1 and 50),
  constraint profiles_bio_len check (bio is null or char_length(bio) <= 200)
);
create unique index if not exists profiles_username_key on public.profiles (username);

-- Удаление своего аккаунта (вызывается кнопкой «Удалить аккаунт»). Удаляет только вызвавшего.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
