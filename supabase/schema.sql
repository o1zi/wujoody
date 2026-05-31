-- ============================================================
-- منصة مكاتب هندسية — Supabase schema
-- Run this in Supabase SQL Editor (or via the CLI).
-- ============================================================

-- ---------- Enums ----------
do $$ begin
  create type public.user_role as enum ('super_admin', 'office_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.office_status as enum ('pending', 'active', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('pending', 'active', 'expired', 'cancelled');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------
create table if not exists public.offices (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  status      public.office_status not null default 'pending',
  custom_domain  text unique,
  domain_status  text not null default 'none', -- none | pending | verified
  created_at  timestamptz not null default now()
);
create index if not exists offices_owner_idx on public.offices(owner_id);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  phone       text,
  full_name   text,
  role        public.user_role not null default 'office_admin',
  office_id   uuid references public.offices(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  office_id      uuid not null references public.offices(id) on delete cascade,
  plan           text not null,
  status         public.subscription_status not null default 'pending',
  salla_order_id text,
  amount         numeric(10,2),
  currency       text not null default 'SAR',
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists subscriptions_office_idx on public.subscriptions(office_id);
-- Full unique index (NULLs are distinct in Postgres, so multiple null orders are allowed).
-- Non-partial so it can be used as an ON CONFLICT target by upsert.
create unique index if not exists subscriptions_salla_order_idx
  on public.subscriptions(salla_order_id);

create table if not exists public.site_content (
  office_id   uuid primary key references public.offices(id) on delete cascade,
  content     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices(id) on delete cascade,
  name        text,
  contact     text,
  message     text,
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists leads_office_idx on public.leads(office_id, created_at desc);

create table if not exists public.salla_events (
  id          bigint generated always as identity primary key,
  event       text,
  event_id    text,
  payload     jsonb,
  created_at  timestamptz not null default now()
);
create unique index if not exists salla_events_event_id_idx
  on public.salla_events(event_id) where event_id is not null;

-- ---------- Helper functions (SECURITY DEFINER, avoid RLS recursion) ----------
create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.current_office_id()
returns uuid language sql stable security definer set search_path = public as $$
  select office_id from public.profiles where id = auth.uid();
$$;

-- ---------- Public RPC: is a subdomain slug available? ----------
create or replace function public.slug_available(s text)
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.offices where slug = lower(s));
$$;
grant execute on function public.slug_available(text) to anon, authenticated;

-- ---------- New-user trigger: create office + profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_office_id uuid;
  v_slug text := nullif(new.raw_user_meta_data->>'office_slug', '');
  v_office_name text := coalesce(nullif(new.raw_user_meta_data->>'office_name',''), 'مكتب هندسي');
begin
  if v_slug is not null then
    insert into public.offices(owner_id, name, slug, status)
    values (new.id, v_office_name, v_slug, 'pending')
    returning id into v_office_id;

    insert into public.site_content(office_id, content)
    values (v_office_id, '{}'::jsonb);
  end if;

  insert into public.profiles(id, email, phone, full_name, role, office_id)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'full_name',''),
    'office_admin',
    v_office_id
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at trigger for site_content ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.offices       enable row level security;
alter table public.profiles      enable row level security;
alter table public.subscriptions enable row level security;
alter table public.site_content  enable row level security;
alter table public.salla_events  enable row level security;
alter table public.leads         enable row level security;

drop policy if exists leads_read_own on public.leads;
create policy leads_read_own on public.leads
  for select using (office_id = public.current_office_id() or public.is_super_admin());
drop policy if exists leads_update_own on public.leads;
create policy leads_update_own on public.leads
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());

-- ----- profiles -----
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_super_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ----- offices -----
-- Public can read ACTIVE offices (needed to render the tenant site by slug).
drop policy if exists offices_public_active on public.offices;
create policy offices_public_active on public.offices
  for select using (status = 'active' or owner_id = auth.uid() or public.is_super_admin());

drop policy if exists offices_update_own on public.offices;
create policy offices_update_own on public.offices
  for update using (owner_id = auth.uid() or public.is_super_admin())
  with check (owner_id = auth.uid() or public.is_super_admin());

-- ----- site_content -----
drop policy if exists site_content_public_read on public.site_content;
create policy site_content_public_read on public.site_content
  for select using (
    public.is_super_admin()
    or office_id = public.current_office_id()
    or exists (select 1 from public.offices o where o.id = office_id and o.status = 'active')
  );

drop policy if exists site_content_owner_write on public.site_content;
create policy site_content_owner_write on public.site_content
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());

-- Allow owners to create their content row (needed for upsert / offices missing a row).
drop policy if exists site_content_owner_insert on public.site_content;
create policy site_content_owner_insert on public.site_content
  for insert with check (office_id = public.current_office_id() or public.is_super_admin());

-- ----- subscriptions -----
drop policy if exists subscriptions_read_own on public.subscriptions;
create policy subscriptions_read_own on public.subscriptions
  for select using (office_id = public.current_office_id() or public.is_super_admin());
-- writes happen via the service-role key (webhook / admin) which bypasses RLS.

-- ----- salla_events: service-role only (no policies = no anon/auth access) -----

-- ============================================================
-- Promote a user to super_admin (run manually after they sign up):
--   update public.profiles set role = 'super_admin' where email = 'you@example.com';
-- ============================================================
