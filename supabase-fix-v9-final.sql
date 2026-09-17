-- =========================================================
-- MEMÓRIAS QUE CONSTROEM DEMOCRACIA — FIX v9
-- Acervo Digital + Storage e compatibilidade de publicação.
-- Execute este arquivo no SQL Editor do Supabase.
-- É idempotente: pode ser executado mais de uma vez.
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1) TABELA DO ACERVO
-- ---------------------------------------------------------
create table if not exists public.archive_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('Entrevista','Mapa','Fotografia','Documento','Áudio','Vídeo','Outro')),
  description text,
  file_name text not null,
  file_path text not null unique,
  public_url text,
  mime_type text,
  file_size bigint not null default 0,
  status text not null default 'published' check (status in ('draft','published','rejected')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_archive_items_status_created
on public.archive_items(status, created_at desc);

alter table public.archive_items enable row level security;

drop policy if exists "public archive is readable" on public.archive_items;
create policy "public archive is readable"
on public.archive_items
for select
using (status='published');

drop policy if exists "admins can read archive" on public.archive_items;
create policy "admins can read archive"
on public.archive_items
for select to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

drop policy if exists "admins can insert archive" on public.archive_items;
create policy "admins can insert archive"
on public.archive_items
for insert to authenticated
with check (
  (auth.jwt()->'user_metadata'->>'role')='admin'
  and status='published'
);

drop policy if exists "admins can update archive" on public.archive_items;
create policy "admins can update archive"
on public.archive_items
for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('draft','published','rejected'));

drop policy if exists "admins can delete archive" on public.archive_items;
create policy "admins can delete archive"
on public.archive_items
for delete to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

grant select on public.archive_items to anon, authenticated;
grant insert, update, delete on public.archive_items to authenticated;

-- ---------------------------------------------------------
-- 2) BUCKET EXCLUSIVO DO ACERVO
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('atlas-archive','atlas-archive',true)
on conflict (id) do update set public=true;

drop policy if exists "public archive files are readable" on storage.objects;
create policy "public archive files are readable"
on storage.objects
for select
using (bucket_id='atlas-archive');

drop policy if exists "admins can upload archive files" on storage.objects;
create policy "admins can upload archive files"
on storage.objects
for insert to authenticated
with check (
  bucket_id='atlas-archive'
  and (auth.jwt()->'user_metadata'->>'role')='admin'
);

drop policy if exists "admins can update archive files" on storage.objects;
create policy "admins can update archive files"
on storage.objects
for update to authenticated
using (
  bucket_id='atlas-archive'
  and (auth.jwt()->'user_metadata'->>'role')='admin'
)
with check (
  bucket_id='atlas-archive'
  and (auth.jwt()->'user_metadata'->>'role')='admin'
);

drop policy if exists "admins can delete archive files" on storage.objects;
create policy "admins can delete archive files"
on storage.objects
for delete to authenticated
using (
  bucket_id='atlas-archive'
  and (auth.jwt()->'user_metadata'->>'role')='admin'
);

grant usage on schema public to anon, authenticated;

notify pgrst, 'reload schema';

-- Conferência final
select id,title,type,status,file_path,created_at
from public.archive_items
order by created_at desc
limit 20;
