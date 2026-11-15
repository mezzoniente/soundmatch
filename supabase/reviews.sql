-- =============================================================
-- SoundMatch — Avaliações pós-colaboração (Etapa 3.1)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Uma avaliação é a nota + comentário que um usuário (reviewer)
-- dá a outro (reviewee) após uma colaboração. Alimenta a
-- reputação pública e o motor de match (fator de confiança).
-- =============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  -- Referencia profiles (não auth.users) para permitir o join do autor no PostgREST.
  -- Como todo usuário tem um profile criado no signup, a integridade é equivalente.
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,

  -- Nota de 1 a 5.
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  -- Contexto opcional da colaboração (ex: "Gravação de EP").
  context text not null default '',

  created_at timestamptz not null default now(),

  -- Não é possível se autoavaliar.
  constraint reviews_no_self check (reviewer_id <> reviewee_id),
  -- Uma avaliação por par reviewer->reviewee (atualiza em vez de duplicar).
  constraint reviews_unique_pair unique (reviewer_id, reviewee_id)
);

create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------
alter table public.reviews enable row level security;

-- Qualquer usuário logado pode LER avaliações (reputação pública).
drop policy if exists "Avaliações visíveis para usuários logados" on public.reviews;
create policy "Avaliações visíveis para usuários logados"
  on public.reviews
  for select
  to authenticated
  using (true);

-- Cada usuário só CRIA avaliações em seu próprio nome.
drop policy if exists "Usuário cria a própria avaliação" on public.reviews;
create policy "Usuário cria a própria avaliação"
  on public.reviews
  for insert
  to authenticated
  with check (auth.uid() = reviewer_id and reviewer_id <> reviewee_id);

-- Cada usuário só EDITA as avaliações que escreveu.
drop policy if exists "Usuário edita a própria avaliação" on public.reviews;
create policy "Usuário edita a própria avaliação"
  on public.reviews
  for update
  to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

-- Cada usuário só REMOVE as avaliações que escreveu.
drop policy if exists "Usuário remove a própria avaliação" on public.reviews;
create policy "Usuário remove a própria avaliação"
  on public.reviews
  for delete
  to authenticated
  using (auth.uid() = reviewer_id);

grant select, insert, update, delete on public.reviews to authenticated;

-- -------------------------------------------------------------
-- Agregados de reputação na tabela profiles.
-- Mantidos por trigger para leitura rápida (sem recalcular a cada consulta).
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists rating_avg real not null default 0,
  add column if not exists rating_count integer not null default 0;

-- Recalcula a média e a contagem de avaliações de um usuário.
create or replace function public.refresh_profile_rating(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set
    rating_avg = coalesce((select avg(rating) from public.reviews where reviewee_id = target), 0),
    rating_count = (select count(*) from public.reviews where reviewee_id = target)
  where p.id = target;
end;
$$;

-- Dispara o recálculo sempre que uma avaliação é criada/editada/removida.
create or replace function public.on_review_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'DELETE') then
    perform public.refresh_profile_rating(old.reviewee_id);
    return old;
  else
    perform public.refresh_profile_rating(new.reviewee_id);
    return new;
  end if;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.on_review_change();
