-- =============================================================
-- SoundMatch — Monetização (Fase 3, bloco 4)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Adiciona o plano de assinatura ao perfil e a tabela de
-- sessões remuneradas (para cálculo de comissão da plataforma).
-- O PAGAMENTO em si (gateway) não faz parte deste schema — é
-- integração externa pendente.
-- =============================================================

-- Plano do usuário: 'free' (padrão) ou 'pro'.
alter table public.profiles
  add column if not exists plan text not null default 'free';

-- -------------------------------------------------------------
-- Sessões remuneradas mediadas pela plataforma.
-- Guarda o valor acordado e a comissão calculada, para histórico
-- financeiro. O fluxo de pagamento real é externo.
-- -------------------------------------------------------------
create table if not exists public.paid_sessions (
  id uuid primary key default gen_random_uuid(),
  -- Quem contratou e quem foi contratado.
  hirer_id uuid not null references public.profiles (id) on delete cascade,
  musician_id uuid not null references public.profiles (id) on delete cascade,

  description text not null default '',
  -- Valor bruto acordado (em centavos, para evitar float).
  amount_cents integer not null default 0,
  -- Comissão da plataforma (em centavos), calculada na criação.
  commission_cents integer not null default 0,
  -- Status: pending, confirmed, paid, cancelled.
  status text not null default 'pending',

  created_at timestamptz not null default now()
);

create index if not exists paid_sessions_musician_idx on public.paid_sessions (musician_id);
create index if not exists paid_sessions_hirer_idx on public.paid_sessions (hirer_id);

alter table public.paid_sessions enable row level security;

-- Participantes (contratante ou músico) podem LER a sessão.
drop policy if exists "Participantes veem a sessão" on public.paid_sessions;
create policy "Participantes veem a sessão"
  on public.paid_sessions
  for select
  to authenticated
  using (auth.uid() = hirer_id or auth.uid() = musician_id);

-- O contratante CRIA a sessão.
drop policy if exists "Contratante cria a sessão" on public.paid_sessions;
create policy "Contratante cria a sessão"
  on public.paid_sessions
  for insert
  to authenticated
  with check (auth.uid() = hirer_id and hirer_id <> musician_id);

-- Participantes podem ATUALIZAR o status.
drop policy if exists "Participantes atualizam a sessão" on public.paid_sessions;
create policy "Participantes atualizam a sessão"
  on public.paid_sessions
  for update
  to authenticated
  using (auth.uid() = hirer_id or auth.uid() = musician_id)
  with check (auth.uid() = hirer_id or auth.uid() = musician_id);

grant select, insert, update on public.paid_sessions to authenticated;
