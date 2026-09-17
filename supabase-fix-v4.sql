-- MCD Atlas v4: elimina a dependência relacional de municipalities no envio.
-- Pode ser executado no SQL Editor mesmo que a estrutura anterior já exista.

create extension if not exists pgcrypto;

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

-- O Atlas usa o nome textual do município. Removemos apenas as FKs opcionais
-- que podem deixar o PostgREST com metadados relacionais desatualizados.
alter table if exists public.atlas_points drop constraint if exists atlas_points_municipality_id_fkey;
alter table if exists public.contributions drop constraint if exists contributions_municipality_id_fkey;

-- RLS para leitura pública dos municípios, caso a tabela seja usada futuramente.
alter table public.municipalities enable row level security;
drop policy if exists "public municipalities" on public.municipalities;
create policy "public municipalities" on public.municipalities for select using (true);

notify pgrst, 'reload schema';
