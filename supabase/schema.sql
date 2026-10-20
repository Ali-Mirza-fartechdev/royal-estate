-- ROYAL CMS schema. Paste into Supabase → SQL Editor → Run. Safe to re-run.

create table if not exists properties    (id text primary key, slug text unique not null, published boolean not null default false, sort int not null default 0, data jsonb not null default '{}', updated_at timestamptz not null default now());
create table if not exists neighborhoods (like properties including all);
create table if not exists articles      (like properties including all);
create table if not exists team          (like properties including all);
create index if not exists properties_pub_sort    on properties    (published, sort);
create index if not exists neighborhoods_pub_sort on neighborhoods (published, sort);
create index if not exists articles_pub_sort      on articles      (published, sort);
create index if not exists team_pub_sort          on team          (published, sort);

create table if not exists settings (key text primary key, data jsonb not null default '{}');

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  read boolean not null default false,
  subject text not null default '',
  name text not null default '',
  email text not null default '',
  data jsonb not null default '{}'
);

-- Row level security -------------------------------------------------------
do $$ declare t text; begin
  foreach t in array array['properties','neighborhoods','articles','team'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read published" on %I', t);
    execute format('drop policy if exists "admin all" on %I', t);
    execute format('create policy "public read published" on %I for select to anon using (published)', t);
    execute format('create policy "admin all" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

alter table settings enable row level security;
drop policy if exists "public read settings" on settings;
drop policy if exists "admin all" on settings;
create policy "public read settings" on settings for select to anon, authenticated using (true);
create policy "admin all" on settings for all to authenticated using (true) with check (true);

alter table inquiries enable row level security;
drop policy if exists "anyone can send" on inquiries;
drop policy if exists "admin all" on inquiries;
create policy "anyone can send" on inquiries for insert to anon, authenticated with check (true);
create policy "admin all" on inquiries for all to authenticated using (true) with check (true);

-- Photo storage ------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists "media public read" on storage.objects;
drop policy if exists "media admin write" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin write" on storage.objects for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');
