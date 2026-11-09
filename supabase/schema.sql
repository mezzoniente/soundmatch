-- =============================================================
-- SoundMatch — schema inicial (Etapa B.1)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
-- =============================================================

-- -------------------------------------------------------------
-- Tabela: profiles
-- Cada perfil pertence a um usuário do Supabase Auth (auth.users).
-- A PK é o próprio id do usuário, então 1 usuário = 1 perfil.
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Identidade
  name text not null default '',
  age integer,
  role text not null default '',
  location text not null default '',
  bio text not null default '',

  -- Atributos musicais (arrays e JSON para estruturas flexíveis)
  instruments text[] not null default '{}',
  level text not null default 'Iniciante',
  genres text[] not null default '{}',
  influences text[] not null default '{}',
  goals text[] not null default '{}',

  -- Campos estruturados do perfil expandido
  schedule jsonb not null default '{}'::jsonb,
  equipment text,
  band_experience jsonb,
  soft_skills jsonb,
  media_samples jsonb not null default '[]'::jsonb,

  -- Vibe / apresentação
  vibe_color text not null default '#1A2C8E',
  vibe_color_name text not null default 'Luxury Blue',

  -- Metadados
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Row Level Security
-- Sem policies, nenhuma linha é lida/escrita.
-- -------------------------------------------------------------
alter table public.profiles enable row level security;

-- Qualquer usuário autenticado pode LER qualquer perfil
-- (necessário para o feed de recomendações / swipe).
drop policy if exists "Perfis são públicos para usuários logados" on public.profiles;
create policy "Perfis são públicos para usuários logados"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Cada usuário só pode INSERIR o próprio perfil.
drop policy if exists "Usuário cria o próprio perfil" on public.profiles;
create policy "Usuário cria o próprio perfil"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Cada usuário só pode ATUALIZAR o próprio perfil.
drop policy if exists "Usuário edita o próprio perfil" on public.profiles;
create policy "Usuário edita o próprio perfil"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cada usuário só pode DELETAR o próprio perfil.
drop policy if exists "Usuário remove o próprio perfil" on public.profiles;
create policy "Usuário remove o próprio perfil"
  on public.profiles
  for delete
  to authenticated
  using (auth.uid() = id);

-- Garantia explícita de privilégios (safeguard; projetos hospedados já concedem).
grant select, insert, update, delete on public.profiles to authenticated;

-- -------------------------------------------------------------
-- Trigger: cria um perfil vazio automaticamente ao registrar um usuário.
-- Assim, logo após o signup já existe uma linha em profiles para editar.
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -------------------------------------------------------------
-- Trigger: mantém updated_at atualizado em cada UPDATE.
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
