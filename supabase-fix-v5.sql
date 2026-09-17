-- =========================================================
-- MEMÓRIAS QUE CONSTROEM DEMOCRACIA — CORREÇÃO DEFINITIVA v5
-- Corrige a fila de moderação dos novos pins e das memórias.
-- Execute TODO este arquivo no SQL Editor do Supabase.
-- =========================================================

create extension if not exists pgcrypto;

-- 1) Garante que as tabelas usadas pelo site existam.
create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  ibge_code text unique,
  created_at timestamptz not null default now()
);

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
  editorial_status text,
  moderation_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- 2) A causa do erro mostrado no navegador:
-- o banco tinha um CHECK antigo que não aceitava status='pending'.
-- O código atual usa 'pending' para colocar o pin na fila.
alter table if exists public.atlas_points
  drop constraint if exists atlas_points_status_check;

-- Normaliza somente valores que não pertencem ao fluxo do Atlas.
update public.atlas_points
set status = 'pending'
where status is null
   or status not in ('draft','pending','published','rejected');

alter table if exists public.atlas_points
  alter column status set default 'pending';

alter table if exists public.atlas_points
  add constraint atlas_points_status_check
  check (status in ('draft','pending','published','rejected'));

-- 3) Garante o CHECK correto para as memórias enviadas em /participe.
alter table if exists public.contributions
  drop constraint if exists contributions_status_check;

update public.contributions
set status = 'pending'
where status is null
   or status not in ('pending','published','rejected');

alter table if exists public.contributions
  alter column status set default 'pending';

alter table if exists public.contributions
  add constraint contributions_status_check
  check (status in ('pending','published','rejected'));

-- 4) Municípios do Atlas.
insert into public.municipalities(name,slug,ibge_code) values
('Acopiara','acopiara','2300309'),
('Catarina','catarina','2303600'),
('Deputado Irapuan Pinheiro','deputado-irapuan-pinheiro','2304269'),
('Piquet Carneiro','piquet-carneiro','2310902')
on conflict (name) do update
set slug=excluded.slug, ibge_code=excluded.ibge_code;

-- 5) RLS para o fluxo público -> moderação -> publicação.
alter table public.atlas_points enable row level security;
alter table public.contributions enable row level security;

-- Pontos publicados são públicos; administradores também conseguem consultar a fila.
drop policy if exists "published points are public" on public.atlas_points;
create policy "published points are public"
on public.atlas_points
for select
using (status='published' or (auth.jwt()->'user_metadata'->>'role')='admin');

-- Qualquer visitante pode enviar um pin, mas somente como pendente/draft.
drop policy if exists "anyone can submit points" on public.atlas_points;
create policy "anyone can submit points"
on public.atlas_points
for insert to anon, authenticated
with check (status in ('pending','draft'));

-- Administradores podem publicar ou rejeitar pins.
drop policy if exists "admins can moderate points" on public.atlas_points;
create policy "admins can moderate points"
on public.atlas_points
for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('pending','published','rejected','draft'));

-- Memórias publicadas são públicas; administradores conseguem consultar a fila.
drop policy if exists "published contributions are public" on public.contributions;
create policy "published contributions are public"
on public.contributions
for select
using (status='published' or (auth.jwt()->'user_metadata'->>'role')='admin');

-- Qualquer visitante pode enviar uma memória pendente.
drop policy if exists "anyone can submit contributions" on public.contributions;
create policy "anyone can submit contributions"
on public.contributions
for insert to anon, authenticated
with check (status='pending');

-- Administradores podem publicar ou rejeitar memórias.
drop policy if exists "admins can moderate contributions" on public.contributions;
create policy "admins can moderate contributions"
on public.contributions
for update to authenticated
using ((auth.jwt()->'user_metadata'->>'role')='admin')
with check (status in ('pending','published','rejected'));

-- 6) Permissões de tabela necessárias ao cliente Supabase.
grant usage on schema public to anon, authenticated;
grant select, insert on public.atlas_points to anon, authenticated;
grant update on public.atlas_points to authenticated;
grant select, insert on public.contributions to anon, authenticated;
grant update on public.contributions to authenticated;

-- 7) As quatro contas da equipe recebem role=admin.
-- Elas precisam existir em Authentication > Users.
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where lower(email) in (
  'amanda@memorias.ce',
  'breno@memorias.ce',
  'joyce@memorias.ce',
  'renato@memorias.ce'
);

-- 8) Se houver registros antigos pendentes, eles continuam na fila.
-- O painel /admin aceita tanto 'pending' quanto 'draft'.

-- 9) Atualiza o cache da API REST.
notify pgrst, 'reload schema';

-- =========================================================
-- VERIFICAÇÃO
-- Depois de executar, estas consultas devem mostrar as filas.
-- =========================================================
select status, count(*) as total
from public.atlas_points
group by status
order by status;

select status, count(*) as total
from public.contributions
group by status
order by status;

select id, project_id, title, municipality, status, created_at
from public.atlas_points
where status in ('pending','draft')
order by created_at desc;

select id, title, municipality, status, created_at
from public.contributions
where status='pending'
order by created_at desc;
