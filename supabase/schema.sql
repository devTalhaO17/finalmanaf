-- schema.sql — tables, Row Level Security, storage, seed, grants

create extension if not exists "pgcrypto";

-- TABLES

-- users.id is the Supabase auth user id for self-registered members, or an
-- app-generated id for admin-created users.
create table if not exists public.users (
  id            text primary key,
  auth_uid      uuid unique,
  full_name     text not null,
  email         text not null unique,
  username      text,
  mobile        text,
  address       text,
  role          text not null default 'MEMBER',
  member_id     text,
  status        text not null default 'active',
  avatar_url    text,
  must_change_password boolean default false,
  is_email_verified    boolean default false,
  two_factor_enabled   boolean default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.books (
  id               text primary key,
  title            text not null,
  title_en         text,
  author           text not null,
  author_en        text,
  publisher        text,
  category         text,
  publication_year int,
  edition          text,
  language         text,
  cover_url        text,
  cover_image      text,
  quantity         int not null default 1,
  available_copies int not null default 1,
  shelf_number     text,
  isbn             text,
  barcode          text,
  description      text,
  featured         boolean default false,
  popular          boolean default false,
  new_arrival      boolean default false,
  file             text,
  status           text,
  created_at       timestamptz not null default now()
);

create table if not exists public.digital_books (
  id             text primary key,
  title          text not null,
  title_en       text,
  author         text,
  category       text,
  cover_url      text,
  file_size      text,
  page_count     int,
  pdf_url        text,
  file_url       text,
  file_format    text,
  description    text,
  download_count int default 0,
  read_count     int default 0,
  views_count    int default 0,
  added_date     timestamptz,
  sample_content_text text,
  created_at     timestamptz not null default now()
);

create table if not exists public.notices (
  id            text primary key,
  title         text not null,
  title_en      text,
  content       text,
  content_en    text,
  date          text,
  category      text default 'General',
  pinned        boolean default false,
  is_urgent     boolean default false,
  published_by  text,
  attachment_url text,
  created_at    timestamptz not null default now()
);

create table if not exists public.events (
  id            text primary key,
  title         text not null,
  title_en      text,
  description   text,
  description_en text,
  date          text,
  time          text,
  location      text,
  image_url     text,
  organizer     text,
  featured      boolean default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.gallery (
  id        text primary key,
  title     text not null,
  title_en  text,
  category  text,
  image_url text,
  date      text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.donors (
  id            text primary key,
  name          text not null,
  designation   text,
  donor_category text,
  contribution  text,
  photo_url     text,
  join_date     text,
  created_at    timestamptz not null default now()
);

create table if not exists public.borrow_records (
  id            text primary key,
  book_id       text,
  book_title    text,
  user_id       text,
  user_name     text,
  user_email    text,
  user_member_id text,
  issue_date    text,
  due_date      text,
  return_date   text,
  status        text default 'issued',
  fine_amount   numeric default 0,
  fine_paid     boolean default false,
  issued_by     text,
  created_at    timestamptz not null default now()
);

create table if not exists public.reservations (
  id               text primary key,
  book_id          text,
  book_title       text,
  book_cover       text,
  user_id          text,
  user_name        text,
  user_email       text,
  user_member_id   text,
  reservation_date text,
  status           text default 'pending',
  expiry_date      text,
  notes            text,
  created_at       timestamptz not null default now()
);

create table if not exists public.fines (
  id         text primary key,
  user_id    text,
  user_name  text,
  user_email text,
  borrow_id  text,
  book_title text,
  amount     numeric default 0,
  reason     text,
  date       text,
  status     text default 'unpaid',
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  book_id    text not null,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create table if not exists public.milestones (
  id      text primary key,
  year    text,
  title   text,
  "desc" text,
  created_at timestamptz not null default now()
);

-- Central image library (IDs resolved via storage.resolveImageUrl)
create table if not exists public.media_library (
  id             text primary key,
  title          text,
  category       text,
  url            text not null,
  thumbnail_url  text,
  dimensions     text,
  file_size_kb   numeric,
  tags           text[],
  reference_count int default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.system_logs (
  id        text primary key,
  action    text not null,
  category  text,
  severity  text default 'INFO',
  actor     jsonb,
  details   text,
  target    text,
  metadata  jsonb,
  created_at timestamptz not null default now()
);

-- Singleton site info row (id = 'main')
create table if not exists public.site_info (
  id           text primary key default 'main',
  library_name text,
  founding_date text,
  address      text,
  email        text,
  phone        text,
  hours        text,
  about_intro  text,
  mission      text,
  vision       text,
  facilities   text[],
  map_info     text,
  founder      jsonb,
  hero_title            text,
  hero_sub_title        text,
  hero_banner_image     text,
  library_exterior_image text,
  motto_text            text,
  about_header_image    text,
  library_logo_url      text,
  updated_at    timestamptz not null default now()
);

-- ROLE HELPERS

-- Logged-in user has an admin role.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where email = auth.jwt() ->> 'email'
      and role in ('ADMIN', 'SUPER_ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN')
      and status = 'active'
  );
$$;

-- Logged-in user is the site owner.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where email = auth.jwt() ->> 'email'
      and role = 'SUPER_ADMIN'
      and status = 'active'
  );
$$;

-- Logged-in user is this exact app user, by email or id.
create or replace function public.is_self(email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (auth.jwt() ->> 'email' = email)
      or (auth.uid()::text = email)
      or exists (
           select 1 from public.users
           where email = auth.jwt() ->> 'email'
             and (id = email or auth_uid::text = email)
         );
$$;

-- Row belongs to the logged-in session (own auth_uid or linked app user id).
create or replace function public.is_app_user(app_user_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select app_user_id = auth.uid()::text
      or exists (
           select 1 from public.users
           where auth_uid = auth.uid()
             and id = app_user_id
         );
$$;

-- ENABLE RLS
alter table public.users          enable row level security;
alter table public.books          enable row level security;
alter table public.digital_books  enable row level security;
alter table public.notices        enable row level security;
alter table public.events         enable row level security;
alter table public.gallery        enable row level security;
alter table public.donors         enable row level security;
alter table public.borrow_records enable row level security;
alter table public.reservations   enable row level security;
alter table public.fines          enable row level security;
alter table public.favorites      enable row level security;
alter table public.milestones     enable row level security;
alter table public.media_library  enable row level security;
alter table public.system_logs    enable row level security;
alter table public.site_info      enable row level security;

-- POLICIES (guarded drops allow re-runs)

-- Public catalog data: anyone can read
drop policy if exists "public read books" on public.books;
create policy "public read books" on public.books for select using (true);
drop policy if exists "public read digital_books" on public.digital_books;
create policy "public read digital_books" on public.digital_books for select using (true);
drop policy if exists "public read notices" on public.notices;
create policy "public read notices" on public.notices for select using (true);
drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select using (true);
drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery for select using (true);
drop policy if exists "public read donors" on public.donors;
create policy "public read donors" on public.donors for select using (true);
drop policy if exists "public read milestones" on public.milestones;
create policy "public read milestones" on public.milestones for select using (true);
drop policy if exists "public read media_library" on public.media_library;
create policy "public read media_library" on public.media_library for select using (true);
drop policy if exists "public read site_info" on public.site_info;
create policy "public read site_info" on public.site_info for select using (true);

-- Content management: only admins write
drop policy if exists "admin manage books" on public.books;
create policy "admin manage books"         on public.books         for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage digital_books" on public.digital_books;
create policy "admin manage digital_books"  on public.digital_books for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage notices" on public.notices;
create policy "admin manage notices"        on public.notices       for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage events" on public.events;
create policy "admin manage events"         on public.events        for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage gallery" on public.gallery;
create policy "admin manage gallery"        on public.gallery       for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage donors" on public.donors;
create policy "admin manage donors"         on public.donors        for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage milestones" on public.milestones;
create policy "admin manage milestones"     on public.milestones    for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage media_library" on public.media_library;
create policy "admin manage media_library"  on public.media_library for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin manage site_info" on public.site_info;
create policy "admin manage site_info"      on public.site_info     for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin read system_logs" on public.system_logs;
create policy "admin read system_logs" on public.system_logs for select using (public.is_admin());

-- System logs: any authenticated user may write (activity auditing)
drop policy if exists "authenticated write system_logs" on public.system_logs;
create policy "authenticated write system_logs" on public.system_logs
  for insert with check (auth.role() = 'authenticated');
-- Users: only self or admins can read profiles (PII); admins manage all
drop policy if exists "self or admin read users" on public.users;
create policy "self or admin read users" on public.users
  for select using ((auth.uid()::text = id) or public.is_self(email) or public.is_admin());
drop policy if exists "self update users" on public.users;
create policy "self update users" on public.users
  for update using ((auth.uid()::text = id) or public.is_self(email))
  with check ((auth.uid()::text = id) or public.is_self(email));
drop policy if exists "self insert users" on public.users;
create policy "self insert users" on public.users
  for insert with check ((auth.uid()::text = id) or public.is_super_admin());
drop policy if exists "admin manage users" on public.users;
create policy "admin manage users" on public.users
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- The SUPER_ADMIN (or DB owner) may change role/status/auth_uid; everyone else
-- is forced to role MEMBER on insert and locked against escalation.
create or replace function public.guard_user_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'postgres' or public.is_super_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.role := 'MEMBER';
    return new;
  end if;
  if new.role is distinct from old.role then
    raise exception 'Unauthorized: role cannot be changed';
  end if;
  if new.status is distinct from old.status then
    raise exception 'Unauthorized: status cannot be changed';
  end if;
  if new.auth_uid is distinct from old.auth_uid and old.auth_uid is not null then
    raise exception 'Unauthorized: auth_uid cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists users_change_guard on public.users;
create trigger users_change_guard
  before insert or update on public.users
  for each row execute function public.guard_user_changes();

-- Borrow records: member reads own; admins read/manage all
drop policy if exists "self read borrow_records" on public.borrow_records;
create policy "self read borrow_records" on public.borrow_records
  for select using (public.is_app_user(user_id) or public.is_self(user_email));
drop policy if exists "member create borrow_records" on public.borrow_records;
create policy "member create borrow_records" on public.borrow_records
  for insert with check (auth.role() = 'authenticated');
drop policy if exists "admin manage borrow_records" on public.borrow_records;
create policy "admin manage borrow_records" on public.borrow_records
  for all using (public.is_admin()) with check (public.is_admin());

-- Reservations: self service
drop policy if exists "self read reservations" on public.reservations;
create policy "self read reservations" on public.reservations
  for select using (public.is_app_user(user_id) or public.is_self(user_email));
drop policy if exists "self create reservations" on public.reservations;
create policy "self create reservations" on public.reservations
  for insert with check (auth.role() = 'authenticated');
drop policy if exists "admin manage reservations" on public.reservations;
create policy "admin manage reservations" on public.reservations
  for all using (public.is_admin()) with check (public.is_admin());

-- Fines: member reads own; admin all
drop policy if exists "self read fines" on public.fines;
create policy "self read fines" on public.fines
  for select using (public.is_app_user(user_id) or public.is_self(user_email));
drop policy if exists "admin manage fines" on public.fines;
create policy "admin manage fines" on public.fines
  for all using (public.is_admin()) with check (public.is_admin());

-- Favorites: per-user
drop policy if exists "self read favorites" on public.favorites;
create policy "self read favorites" on public.favorites
  for select using (public.is_app_user(user_id));
drop policy if exists "self write favorites" on public.favorites;
create policy "self write favorites" on public.favorites
  for all using (public.is_app_user(user_id)) with check (public.is_app_user(user_id));

-- STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('sajks', 'sajks', true)
on conflict (id) do nothing;

drop policy if exists "public read sajks media" on storage.objects;
create policy "public read sajks media" on storage.objects
  for select using (bucket_id = 'sajks');

drop policy if exists "authenticated upload sajks media" on storage.objects;
create policy "authenticated upload sajks media" on storage.objects
  for insert with check (bucket_id = 'sajks' and auth.role() = 'authenticated');

drop policy if exists "admin overwrite sajks media" on storage.objects;
create policy "admin overwrite sajks media" on storage.objects
  for update using (bucket_id = 'sajks' and public.is_admin())
  with check (bucket_id = 'sajks' and public.is_admin());

drop policy if exists "admin delete sajks media" on storage.objects;
create policy "admin delete sajks media" on storage.objects
  for delete using (bucket_id = 'sajks' and public.is_admin());

insert into public.site_info (id)
values ('main')
on conflict (id) do nothing;

-- Grants: PostgREST needs table/function grants for anon/authenticated;
-- RLS policies decide which rows each role may read or change.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
-- Cover tables/functions created later by this project's postgres role.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;