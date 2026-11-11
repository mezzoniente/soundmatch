-- =============================================================
-- SoundMatch — Vagas / Openings (Etapa 2.5)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Uma "vaga" é um anúncio aberto postado por um usuário
-- ("procuramos baterista para indie rock"). Qualquer usuário
-- logado pode ver as vagas; só o autor edita/remove as suas.
-- =============================================================

create table if not exists public.openings (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,

  -- Conteúdo da vaga
  title text not null default '',
  description text not null default '',
  -- Instrumentos procurados (ex: ['Baterista'])
  instruments text[] not null default '{}',
  -- Gêneros do projeto
  genres text[] not null default '{}',
  -- Nível desejado (vazio = qualquer)
  level text,
  -- Objetivo da colaboração (banda fixa, pontual, etc.)
  goal text not null default '',

  -- Localização do projeto
  location text not null default '',
  lat double precision,
  lng double precision,

  -- Metadados
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índice para listar as vagas mais recentes rapidamente.
create index if not exists openings_created_at_idx on public.openings (created_at desc);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.openings enable row level security;

-- Qualquer usuário logado pode LER as vagas abertas (feed de vagas).
drop policy if exists "Vagas visíveis para usuários logados" on public.openings;
create policy "Vagas visíveis para usuários logados"
  on public.openings
  for select
  to authenticated
  using (true);

-- Cada usuário só CRIA vagas em seu próprio nome.
drop policy if exists "Usuário cria a própria vaga" on public.openings;
create policy "Usuário cria a própria vaga"
  on public.openings
  for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Cada usuário só EDITA as próprias vagas.
drop policy if exists "Usuário edita a própria vaga" on public.openings;
create policy "Usuário edita a própria vaga"
  on public.openings
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Cada usuário só REMOVE as próprias vagas.
drop policy if exists "Usuário remove a própria vaga" on public.openings;
create policy "Usuário remove a própria vaga"
  on public.openings
  for delete
  to authenticated
  using (auth.uid() = author_id);

grant select, insert, update, delete on public.openings to authenticated;

-- -------------------------------------------------------------
-- Trigger para manter updated_at (reusa a função já criada no schema.sql).
-- -------------------------------------------------------------
drop trigger if exists openings_set_updated_at on public.openings;
create trigger openings_set_updated_at
  before update on public.openings
  for each row
  execute function public.set_updated_at();
