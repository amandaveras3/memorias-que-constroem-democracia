-- MCD · Memórias que Constroem Democracia
-- Cole este arquivo no SQL Editor do Supabase e execute.
create extension if not exists pgcrypto;

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  ibge_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.atlas_points (
  id uuid primary key default gen_random_uuid(),
  project_id text unique,
  title text not null,
  municipality_id uuid references public.municipalities(id) on delete set null,
  municipality text not null,
  category text not null,
  record_type text not null,
  latitude double precision not null,
  longitude double precision not null,
  story text not null,
  period text,
  contributor text,
  source text,
  status text not null default 'pending' check (status in ('draft','pending','published','rejected')),
  editorial_status text,
  rating numeric(3,1) not null default 0,
  review_count integer not null default 0,
  attachment_count integer not null default 0,
  featured boolean not null default false,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  municipality_id uuid references public.municipalities(id) on delete set null,
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
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  editorial_status text,
  moderation_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.point_reviews (
  id uuid primary key default gen_random_uuid(),
  atlas_point_id uuid not null references public.atlas_points(id) on delete cascade,
  reviewer_name text not null default 'Visitante',
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  atlas_point_id uuid references public.atlas_points(id) on delete cascade,
  contribution_id uuid references public.contributions(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  public_url text,
  mime_type text,
  file_size bigint,
  caption text,
  alt_text text,
  created_at timestamptz not null default now(),
  check ((atlas_point_id is not null) or (contribution_id is not null))
);

create index if not exists idx_atlas_points_status on public.atlas_points(status);
create index if not exists idx_atlas_points_municipality on public.atlas_points(municipality);
create index if not exists idx_contributions_status on public.contributions(status);
create index if not exists idx_reviews_point on public.point_reviews(atlas_point_id);

insert into public.municipalities(name,slug,ibge_code) values
('Acopiara','acopiara','2300309'),
('Catarina','catarina','2303600'),
('Deputado Irapuan Pinheiro','deputado-irapuan-pinheiro','2304269'),
('Piquet Carneiro','piquet-carneiro','2310902')
on conflict (name) do update set slug=excluded.slug, ibge_code=excluded.ibge_code;

-- Storage público para os anexos enviados pelo Atlas.
insert into storage.buckets (id, name, public)
values ('atlas-attachments','atlas-attachments',true)
on conflict (id) do update set public=true;

-- Leitura pública apenas dos pontos publicados.
alter table public.atlas_points enable row level security;
alter table public.contributions enable row level security;
alter table public.point_reviews enable row level security;
alter table public.attachments enable row level security;
alter table public.municipalities enable row level security;

drop policy if exists "published points are public" on public.atlas_points;
create policy "published points are public" on public.atlas_points for select using (status='published');

drop policy if exists "anyone can submit points" on public.atlas_points;
create policy "anyone can submit points" on public.atlas_points for insert to anon, authenticated with check (status in ('pending','draft'));

drop policy if exists "anyone can submit contributions" on public.contributions;
create policy "anyone can submit contributions" on public.contributions for insert to anon, authenticated with check (status='pending');

drop policy if exists "published contributions are public" on public.contributions;
create policy "published contributions are public" on public.contributions for select using (status='published');

drop policy if exists "approved reviews are public" on public.point_reviews;
create policy "approved reviews are public" on public.point_reviews for select using (approved=true);

drop policy if exists "anyone can add reviews" on public.point_reviews;
create policy "anyone can add reviews" on public.point_reviews for insert to anon, authenticated with check (rating between 1 and 5);

drop policy if exists "public municipalities" on public.municipalities;
create policy "public municipalities" on public.municipalities for select using (true);

drop policy if exists "public attachments" on public.attachments;
create policy "public published attachments" on public.attachments for select using (
  (atlas_point_id is not null and exists (select 1 from public.atlas_points p where p.id = attachments.atlas_point_id and p.status = 'published'))
  or
  (contribution_id is not null and exists (select 1 from public.contributions c where c.id = attachments.contribution_id and c.status = 'published'))
);

drop policy if exists "admins can read attachments" on public.attachments;
create policy "admins can read attachments" on public.attachments for select to authenticated using ((auth.jwt()->'user_metadata'->>'role')='admin');

drop policy if exists "anyone can register attachments" on public.attachments;
create policy "anyone can register attachments" on public.attachments for insert to anon, authenticated with check (true);

-- Upload de arquivos: apenas gravação de novos objetos no bucket do Atlas.
drop policy if exists "atlas attachments upload" on storage.objects;
create policy "atlas attachments upload" on storage.objects for insert to anon, authenticated with check (bucket_id='atlas-attachments');
drop policy if exists "atlas attachments public read" on storage.objects;
create policy "atlas attachments public read" on storage.objects for select using (bucket_id='atlas-attachments');

-- Moderação: somente usuários autenticados cujo user_metadata.role = 'admin'.
drop policy if exists "admins can read pending points" on public.atlas_points;
create policy "admins can read pending points" on public.atlas_points for select to authenticated using ((auth.jwt()->'user_metadata'->>'role')='admin');
drop policy if exists "admins can moderate points" on public.atlas_points;
create policy "admins can moderate points" on public.atlas_points for update to authenticated using ((auth.jwt()->'user_metadata'->>'role')='admin') with check (status in ('pending','published','rejected','draft'));
drop policy if exists "admins can read pending contributions" on public.contributions;
create policy "admins can read pending contributions" on public.contributions for select to authenticated using ((auth.jwt()->'user_metadata'->>'role')='admin');
drop policy if exists "admins can moderate contributions" on public.contributions;
create policy "admins can moderate contributions" on public.contributions for update to authenticated using ((auth.jwt()->'user_metadata'->>'role')='admin') with check (status in ('pending','published','rejected'));

-- No painel Authentication, crie o usuário da equipe e defina nos metadados:
-- { "role": "admin" }


-- Recarrega o cache da API REST do Supabase após a criação das tabelas.
notify pgrst, 'reload schema';
