-- ============================================================
-- Schema completo — correr una sola vez en el SQL Editor de Supabase
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  display_order int not null default 0,
  icon text,
  created_at timestamptz default now()
);

-- ---------- VIDEOS ----------
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  source_url text not null,
  source_domain text not null,
  category_id uuid references categories(id) on delete set null,
  tags text[],
  clicks int not null default 0,
  views int not null default 0,
  featured boolean default false,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists videos_category_idx on videos(category_id);
create index if not exists videos_created_idx on videos(created_at desc);
create index if not exists videos_search_idx on videos using gin(
  to_tsvector('spanish', title || ' ' || coalesce(description, ''))
);

-- ---------- SITE SETTINGS (fila única, editable desde /admin) ----------
create table if not exists site_settings (
  id int primary key default 1,
  site_name text not null default 'VerYA',
  tagline text default '',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id, site_name, tagline)
  values (1, 'VerYA', '')
  on conflict (id) do nothing;

-- ---------- ADMIN EMAILS (allowlist, un solo admin desde el día uno) ----------
create table if not exists admin_emails (
  email text primary key
);
insert into admin_emails (email) values ('josephqr2007@gmail.com')
  on conflict (email) do nothing;

-- ============================================================
-- Trigger: mantener updated_at fresco
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists videos_set_updated_at on videos;
create trigger videos_set_updated_at
  before update on videos
  for each row execute function set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table categories enable row level security;
alter table videos enable row level security;
alter table site_settings enable row level security;
alter table admin_emails enable row level security;

-- Lectura pública
create policy "public read categories" on categories for select using (true);
create policy "public read published videos" on videos for select using (published = true);
create policy "public read site_settings" on site_settings for select using (true);

-- Escritura solo para el admin sembrado (por email del JWT)
create policy "admin write categories" on categories for all
  using (auth.jwt() ->> 'email' in (select email from admin_emails))
  with check (auth.jwt() ->> 'email' in (select email from admin_emails));

create policy "admin write videos" on videos for all
  using (auth.jwt() ->> 'email' in (select email from admin_emails))
  with check (auth.jwt() ->> 'email' in (select email from admin_emails));

create policy "admin manage site_settings" on site_settings for update
  using (auth.jwt() ->> 'email' in (select email from admin_emails));

-- admin_emails: nadie escribe desde el cliente, solo se gestiona a mano en el SQL editor
create policy "admin read admin_emails" on admin_emails for select
  using (auth.jwt() ->> 'email' in (select email from admin_emails));

-- ============================================================
-- Categorías iniciales de ejemplo (opcional, edítalas/bórralas desde /admin)
-- ============================================================
insert into categories (name, slug, display_order) values
  ('Música', 'musica', 1),
  ('Tutoriales', 'tutoriales', 2),
  ('Clips virales', 'clips-virales', 3),
  ('Trailers', 'trailers', 4),
  ('Gaming', 'gaming', 5)
on conflict (slug) do nothing;

-- ============================================================
-- Función para incrementar clicks de forma atómica (usada por /go/[id])
-- ============================================================
create or replace function increment_video_clicks(video_id uuid)
returns void as $$
begin
  update videos set clicks = clicks + 1 where id = video_id;
end;
$$ language plpgsql security definer;
