-- =============================================================
-- SoundMatch — Tokens de push (Etapa 3.4d)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Guarda o Expo push token de cada dispositivo do usuário.
-- Usado futuramente para disparar push remoto (requer development
-- build + credenciais FCM/APNs). As notificações locais funcionam
-- no Expo Go sem depender desta tabela.
-- =============================================================

create table if not exists public.push_tokens (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- Expo push token (ExponentPushToken[...]).
  token text not null,
  platform text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, token)
);

-- -------------------------------------------------------------
-- Row Level Security: cada usuário só gerencia os próprios tokens.
-- -------------------------------------------------------------
alter table public.push_tokens enable row level security;

drop policy if exists "Usuário lê os próprios tokens" on public.push_tokens;
create policy "Usuário lê os próprios tokens"
  on public.push_tokens
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Usuário registra os próprios tokens" on public.push_tokens;
create policy "Usuário registra os próprios tokens"
  on public.push_tokens
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Usuário atualiza os próprios tokens" on public.push_tokens;
create policy "Usuário atualiza os próprios tokens"
  on public.push_tokens
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Usuário remove os próprios tokens" on public.push_tokens;
create policy "Usuário remove os próprios tokens"
  on public.push_tokens
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.push_tokens to authenticated;
