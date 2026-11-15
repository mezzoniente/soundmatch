-- =============================================================
-- SoundMatch — Mensagens de chat (Etapa 3.4c)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Mensagens pertencem a uma conversa (conversation_id) e são
-- entregues em tempo real via Supabase Realtime.
-- =============================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  -- id lógico da conversa (ex: o id da DM/Jam). Texto livre por enquanto.
  conversation_id text not null,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  text text not null default '',
  -- Anexo de áudio opcional: { "uri": "...", "title": "..." }
  audio jsonb,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx
  on public.messages (conversation_id, created_at);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.messages enable row level security;

-- Qualquer usuário logado pode LER mensagens.
-- (Numa evolução, restringir aos participantes da conversa.)
drop policy if exists "Mensagens visíveis para usuários logados" on public.messages;
create policy "Mensagens visíveis para usuários logados"
  on public.messages
  for select
  to authenticated
  using (true);

-- Cada usuário só ENVIA mensagens em seu próprio nome.
drop policy if exists "Usuário envia a própria mensagem" on public.messages;
create policy "Usuário envia a própria mensagem"
  on public.messages
  for insert
  to authenticated
  with check (auth.uid() = sender_id);

grant select, insert on public.messages to authenticated;

-- -------------------------------------------------------------
-- Realtime: adiciona a tabela à publicação para receber eventos.
-- Sem isso, as subscriptions postgres_changes não disparam.
-- -------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
