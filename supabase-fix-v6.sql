-- =========================================================
-- MEMÓRIAS QUE CONSTROEM DEMOCRACIA — CORREÇÃO DEFINITIVA v6
-- Fluxo: clique no mapa -> formulário -> INSERT -> fila do Admin.
-- Execute este arquivo inteiro no SQL Editor do Supabase.
-- =========================================================

create extension if not exists pgcrypto;

-- 1. Garante as colunas necessárias sem recriar tabelas existentes.
alter table if exists public.atlas_points
  add column if not exists project_id text;
alter table if exists public.atlas_points
  add column if not exists title text;
alter table if exists public.atlas_points
  add column if not exists municipality text;
alter table if exists public.atlas_points
  add column if not exists category text;
alter table if exists public.atlas_points
  add column if not exists record_type text;
alter table if exists public.atlas_points
  add column if not exists latitude double precision;
alter table if exists public.atlas_points
  add column if not exists longitude double precision;
alter table if exists public.atlas_points
  add column if not exists story text;
alter table if exists public.atlas_points
  add column if not exists period text;
alter table if exists public.atlas_points
  add column if not exists contributor text;
alter table if exists public.atlas_points
  add column if not exists source text;
alter table if exists public.atlas_points
  add column if not exists status text;
alter table if exists public.atlas_points
  add column if not exists rating numeric(3,1);
alter table if exists public.atlas_points
  add column if not exists review_count integer;
alter table if exists public.atlas_points
  add column if not exists attachment_count integer;
alter table if exists public.atlas_points
  add column if not exists approved_at timestamptz;
alter table if exists public.atlas_points
  add column if not exists created_at timestamptz;
alter table if exists public.atlas_points
  add column if not exists updated_at timestamptz;

-- 2. Remove qualquer CHECK de status da tabela de pins, inclusive o
-- constraint antigo que estava causando o erro no navegador.
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid='public.atlas_points'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.atlas_points drop constraint if exists %I', r.conname);
  end loop;
end $$;

-- 3. Normaliza registros antigos e cria o CHECK definitivo.
update public.atlas_points
set status='draft'
where status is null
   or status not in ('draft','pending','published','rejected');

alter table public.atlas_points alter column status set default 'pending';
alter table public.atlas_points add constraint atlas_points_status_check
  check (status in ('draft','pending','published','rejected'));

alter table public.atlas_points alter column rating set default 0;
alter table public.atlas_points alter column review_count set default 0;
alter table public.atlas_points alter column attachment_count set default 0;

-- 4. Contribuições da página Participe.
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  municipality text not null,
  locality text,
  story text not null,
  category text,
  record_type text,
  period text,
  contributor_name text,
  contributor_email text,
  contributor_phone text,
  source text,
  latitude double precision,
  longitude double precision,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Corrige eventual CHECK antigo das contribuições.
do $$
declare r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid='public.contributions'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.contributions drop constraint if exists %I', r.conname);
  end loop;
end $$;

alter table public.contributions alter column status set default 'pending';
alter table public.contributions add constraint contributions_status_check
  check (status in ('pending','published','rejected'));

-- 5. Municípios usados pelos quatro filtros.
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  ibge_code text unique,
  created_at timestamptz not null default now()
);

insert into public.municipalities(name,slug,ibge_code) values
('Acopiara','acopiara','2300309'),
('Catarina','catarina','2303600'),
('Deputado Irapuan Pinheiro','deputado-irapuan-pinheiro','2304269'),
('Piquet Carneiro','piquet-carneiro','2310902')
on conflict (name) do update set slug=excluded.slug, ibge_code=excluded.ibge_code;

-- 6. RLS: visitante pode criar, público só lê publicados,
-- administrador autenticado lê a fila e pode publicar/rejeitar.
alter table public.atlas_points enable row level security;
alter table public.contributions enable row level security;
alter table public.municipalities enable row level security;

drop policy if exists "published points are public" on public.atlas_points;
drop policy if exists "admins can read pending points" on public.atlas_points;
drop policy if exists "anyone can submit points" on public.atlas_points;
drop policy if exists "admins can moderate points" on public.atlas_points;

create policy "published points are public"
on public.atlas_points for select
using (status='published');

create policy "admins can read pending points"
on public.atlas_points for select to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

create policy "anyone can submit points"
on public.atlas_points for insert to anon, authenticated
with check (status in ('pending','draft'));

create policy "admins can moderate points"
on public.atlas_points for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('pending','draft','published','rejected'));

drop policy if exists "published contributions are public" on public.contributions;
drop policy if exists "admins can read pending contributions" on public.contributions;
drop policy if exists "anyone can submit contributions" on public.contributions;
drop policy if exists "admins can moderate contributions" on public.contributions;

create policy "published contributions are public"
on public.contributions for select
using (status='published');

create policy "admins can read pending contributions"
on public.contributions for select to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin');

create policy "anyone can submit contributions"
on public.contributions for insert to anon, authenticated
with check (status='pending');

create policy "admins can moderate contributions"
on public.contributions for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('pending','published','rejected'));

create policy "public municipalities"
on public.municipalities for select using (true);

grant usage on schema public to anon, authenticated;
grant select, insert on public.atlas_points to anon, authenticated;
grant update on public.atlas_points to authenticated;
grant select, insert on public.contributions to anon, authenticated;
grant update on public.contributions to authenticated;
grant select on public.municipalities to anon, authenticated;

-- 7. Garante que as quatro contas da equipe tenham role admin.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) in (
  'amanda@memorias.ce',
  'breno@memorias.ce',
  'joyce@memorias.ce',
  'renato@memorias.ce'
);

-- 8. Recarrega imediatamente o schema usado pela API REST.
notify pgrst, 'reload schema';

-- 9. TESTE FINAL — depois de executar, estas consultas devem funcionar.
select id,title,municipality,status,latitude,longitude,created_at
from public.atlas_points
order by created_at desc nulls last
limit 10;

select id,title,municipality,status,created_at
from public.contributions
order by created_at desc
limit 10;
