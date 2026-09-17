create extension if not exists pgcrypto;

-- Garante a tabela do Acervo mesmo se a instalação ainda não tiver executado o v9.
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1) Campos de atualização para sincronização/edição.
alter table public.atlas_points
  add column if not exists updated_at timestamptz not null default now();

alter table public.archive_items
  add column if not exists updated_at timestamptz not null default now();

-- 2) Permissão de leitura administrativa para TODOS os pontos,
-- incluindo publicados e rejeitados, para que a equipe possa editar o histórico.
drop policy if exists "admins can read all points" on public.atlas_points;
create policy "admins can read all points"
on public.atlas_points
for select to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

-- 3) Edição e remoção de pontos somente por administradores.
drop policy if exists "admins can edit all points" on public.atlas_points;
create policy "admins can edit all points"
on public.atlas_points
for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('pending','draft','published','rejected'));

drop policy if exists "admins can delete points" on public.atlas_points;
create policy "admins can delete points"
on public.atlas_points
for delete to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

grant select, update, delete on public.atlas_points to authenticated;

-- 4) Acervo: leitura/edição administrativa e atualização pública.
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
with check ((auth.jwt()->'user_metadata'->>'role')='admin');

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

grant select, insert, update, delete on public.archive_items to authenticated;
grant select on public.archive_items to anon;

-- 5) Bucket do Acervo. Se já existir, apenas garante que é público.
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
with check (bucket_id='atlas-archive' and (auth.jwt()->'user_metadata'->>'role')='admin');

drop policy if exists "admins can update archive files" on storage.objects;
create policy "admins can update archive files"
on storage.objects
for update to authenticated
using (bucket_id='atlas-archive' and (auth.jwt()->'user_metadata'->>'role')='admin')
with check (bucket_id='atlas-archive' and (auth.jwt()->'user_metadata'->>'role')='admin');

drop policy if exists "admins can delete archive files" on storage.objects;
create policy "admins can delete archive files"
on storage.objects
for delete to authenticated
using (bucket_id='atlas-archive' and (auth.jwt()->'user_metadata'->>'role')='admin');

-- 6) Permissões administrativas para anexos antigos do Atlas.
drop policy if exists "admins can delete atlas attachments" on storage.objects;
create policy "admins can delete atlas attachments"
on storage.objects
for delete to authenticated
using (bucket_id='atlas-attachments' and (auth.jwt()->'user_metadata'->>'role')='admin');

drop policy if exists "admins can update atlas attachments" on storage.objects;
create policy "admins can update atlas attachments"
on storage.objects
for update to authenticated
using (bucket_id='atlas-attachments' and (auth.jwt()->'user_metadata'->>'role')='admin')
with check (bucket_id='atlas-attachments' and (auth.jwt()->'user_metadata'->>'role')='admin');

-- 7) Atualização automática do timestamp de edição.
create or replace function public.mcd_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mcd_atlas_points_updated_at on public.atlas_points;
create trigger mcd_atlas_points_updated_at
before update on public.atlas_points
for each row execute function public.mcd_set_updated_at();

drop trigger if exists mcd_archive_items_updated_at on public.archive_items;
create trigger mcd_archive_items_updated_at
before update on public.archive_items
for each row execute function public.mcd_set_updated_at();

-- 8) Habilita Realtime para as três áreas públicas/administrativas.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'atlas_points'
  ) then
    execute 'alter publication supabase_realtime add table public.atlas_points';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contributions'
  ) then
    execute 'alter publication supabase_realtime add table public.contributions';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'archive_items'
  ) then
    execute 'alter publication supabase_realtime add table public.archive_items';
  end if;
end $$;

notify pgrst, 'reload schema';

select 'v10 aplicado' as resultado;
