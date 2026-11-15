-- =============================================================
-- SoundMatch — Eventos / demandas de contratantes (Etapa 3.5a)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Um "evento" é uma demanda com data marcada postada por um
-- contratante ("preciso de banda cover para casamento dia X").
-- Difere de uma vaga (openings), que é sobre entrar num projeto.
-- =============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,

  title text not null default '',
  description text not null default '',
  -- Tipo do evento: casamento, festa, bar, corporativo, etc.
  event_type text not null default '',
  -- Instrumentos/formação procurados.
  instruments text[] not null default '{}',
  -- Gêneros desejados para o evento.
  genres text[] not null default '{}',

  -- Data e hora do evento.
  event_date date,
  -- Cachê oferecido (texto livre: "R$ 1500", "a combinar").
  budget text not null default '',

  location text not null default '',
  lat double precision,
  lng double precision,

  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_date_idx on public.events (event_date);
create index if not exists events_created_at_idx on public.events (created_at desc);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.events enable row level security;

drop policy if exists "Eventos visíveis para usuários logados" on public.events;
create policy "Eventos visíveis para usuários logados"
  on public.events
  for select
  to authenticated
  using (true);

drop policy if exists "Usuário cria o próprio evento" on public.events;
create policy "Usuário cria o próprio evento"
  on public.events
  for insert
  to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "Usuário edita o próprio evento" on public.events;
create policy "Usuário edita o próprio evento"
  on public.events
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Usuário remove o próprio evento" on public.events;
create policy "Usuário remove o próprio evento"
  on public.events
  for delete
  to authenticated
  using (auth.uid() = author_id);

grant select, insert, update, delete on public.events to authenticated;

-- -------------------------------------------------------------
-- Trigger para manter updated_at (reusa a função set_updated_at do schema.sql).
-- -------------------------------------------------------------
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();
