-- =============================================================
-- SoundMatch — Storage (Etapa B.4)
-- Rode este SQL no painel do Supabase:
--   Project > SQL Editor > New query > cole e execute.
--
-- Cria dois buckets públicos e as policies de acesso:
--   - avatars: fotos de perfil e banners
--   - media-samples: amostras de áudio e vídeo
--
-- Convenção de caminho dos arquivos: "<user_id>/<arquivo>"
-- A primeira pasta é o id do usuário, o que permite às policies
-- garantir que cada um só escreve nos próprios arquivos.
-- =============================================================

-- -------------------------------------------------------------
-- Buckets (idempotente). Públicos para leitura.
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('media-samples', 'media-samples', true)
on conflict (id) do update set public = true;

-- -------------------------------------------------------------
-- Policies
-- Leitura pública (qualquer um lê, inclusive anon), já que os
-- buckets são públicos e o feed precisa exibir as mídias.
-- Escrita/edição/remoção: apenas o dono, identificado pela
-- primeira pasta do caminho (storage.foldername(name)[1] = uid).
-- -------------------------------------------------------------

-- ===== avatars =====
drop policy if exists "avatars leitura pública" on storage.objects;
create policy "avatars leitura pública"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars upload do dono" on storage.objects;
create policy "avatars upload do dono"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "avatars update do dono" on storage.objects;
create policy "avatars update do dono"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "avatars delete do dono" on storage.objects;
create policy "avatars delete do dono"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

-- ===== media-samples =====
drop policy if exists "media leitura pública" on storage.objects;
create policy "media leitura pública"
  on storage.objects for select
  using (bucket_id = 'media-samples');

drop policy if exists "media upload do dono" on storage.objects;
create policy "media upload do dono"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media-samples'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "media update do dono" on storage.objects;
create policy "media update do dono"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media-samples'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists "media delete do dono" on storage.objects;
create policy "media delete do dono"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media-samples'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

-- -------------------------------------------------------------
-- Colunas de avatar e banner na tabela profiles.
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists cover_url text;
