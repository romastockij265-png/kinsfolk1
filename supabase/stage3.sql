-- ЭТАП 3. Чаты и сообщения. Можно запускать повторно (if not exists / or replace / drop policy if exists).

-- 1. Таблицы
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct','group')),
  title text,
  avatar_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.chat_members (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  last_read_message_id bigint,
  muted boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  body text,
  kind text not null default 'text' check (kind in ('text','image','file','voice','system','call')),
  reply_to bigint references public.messages(id) on delete set null,
  attachment_path text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,
  constraint messages_body_len check (body is null or char_length(body) <= 4000)
);
-- Личный чат между двумя людьми существует ровно один (уникальная пара).
create table if not exists public.direct_pairs (
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  chat_id uuid not null references public.chats(id) on delete cascade,
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create index if not exists messages_chat_id_idx on public.messages (chat_id, id desc);
create index if not exists chat_members_user_idx on public.chat_members (user_id);

-- 2. Вспомогательная функция: «я участник этого чата?» (нужна правилам доступа)
create or replace function public.is_chat_member(cid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.chat_members where chat_id = cid and user_id = (select auth.uid()));
$$;
revoke all on function public.is_chat_member(uuid) from public, anon;
grant execute on function public.is_chat_member(uuid) to authenticated;

-- 3. Создать (или найти) личный чат с человеком
create or replace function public.start_direct_chat(other uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  a uuid; b uuid; cid uuid;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if other is null or other = me then raise exception 'bad user'; end if;
  if not exists (select 1 from public.profiles where id = other) then raise exception 'no such user'; end if;
  a := least(me, other); b := greatest(me, other);
  select chat_id into cid from public.direct_pairs where user_a = a and user_b = b;
  if cid is not null then return cid; end if;
  insert into public.chats (kind, created_by) values ('direct', me) returning id into cid;
  begin
    insert into public.direct_pairs (user_a, user_b, chat_id) values (a, b, cid);
  exception when unique_violation then
    delete from public.chats where id = cid;
    select chat_id into cid from public.direct_pairs where user_a = a and user_b = b;
    return cid;
  end;
  insert into public.chat_members (chat_id, user_id, role) values (cid, me, 'member'), (cid, other, 'member');
  return cid;
end;
$$;
revoke all on function public.start_direct_chat(uuid) from public, anon;
grant execute on function public.start_direct_chat(uuid) to authenticated;

-- 4. Список моих чатов: собеседник, последнее сообщение, непрочитанные
create or replace function public.my_chats()
returns table (chat_id uuid, kind text, title text, avatar_url text,
  other_id uuid, other_name text, other_username text, other_avatar text,
  last_id bigint, last_body text, last_kind text, last_at timestamptz, last_sender uuid, unread bigint)
language sql stable security invoker set search_path = '' as $$
  select c.id, c.kind, c.title, c.avatar_url,
         o.id, o.display_name, o.username, o.avatar_url,
         m.id, m.body, m.kind, m.created_at, m.sender_id,
         (select count(*) from public.messages x
           where x.chat_id = c.id
             and x.id > coalesce(me.last_read_message_id, 0)
             and x.sender_id is distinct from (select auth.uid())
             and x.deleted_at is null)
  from public.chat_members me
  join public.chats c on c.id = me.chat_id
  left join lateral (
    select p.id, p.display_name, p.username, p.avatar_url
    from public.chat_members cm join public.profiles p on p.id = cm.user_id
    where cm.chat_id = c.id and cm.user_id <> (select auth.uid()) and c.kind = 'direct'
    limit 1) o on true
  left join lateral (
    select mm.id, mm.body, mm.kind, mm.created_at, mm.sender_id
    from public.messages mm where mm.chat_id = c.id order by mm.id desc limit 1) m on true
  where me.user_id = (select auth.uid())
  order by coalesce(m.created_at, c.created_at) desc;
$$;
revoke all on function public.my_chats() from public, anon;
grant execute on function public.my_chats() to authenticated;

-- 5. Правила доступа (RLS): видишь и пишешь только в чаты, где ты участник
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.direct_pairs enable row level security;

drop policy if exists chats_select on public.chats;
create policy chats_select on public.chats for select to authenticated using (public.is_chat_member(id));

drop policy if exists members_select on public.chat_members;
create policy members_select on public.chat_members for select to authenticated using (public.is_chat_member(chat_id));
drop policy if exists members_update_own on public.chat_members;
create policy members_update_own on public.chat_members for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated using (public.is_chat_member(chat_id));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated
  with check (public.is_chat_member(chat_id) and sender_id = (select auth.uid()) and kind = 'text');
-- direct_pairs: политик нет намеренно — доступ только через start_direct_chat().

-- 6. Права на таблицы (роль authenticated)
grant select on public.chats to authenticated;
grant select on public.chat_members to authenticated;
grant update (last_read_message_id, muted) on public.chat_members to authenticated;  -- роль менять нельзя
grant select, insert on public.messages to authenticated;
revoke all on public.direct_pairs from anon, authenticated;

-- 7. Сообщения «вживую» (Realtime)
do $$
begin
  begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.chat_members; exception when duplicate_object then null; end;
end $$;
