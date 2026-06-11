-- ============================================================
-- Clinic booking engine — services, doctors, working hours, appointments.
-- Run AFTER schema.sql + vertical.sql in the Supabase SQL Editor.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- Services (treatments / consultations) ----------
create table if not exists public.clinic_services (
  id           uuid primary key default gen_random_uuid(),
  office_id    uuid not null references public.offices(id) on delete cascade,
  name         text not null,
  price        numeric(10,2),
  duration_min int  not null default 30,
  active       boolean not null default true,
  sort         int  not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists clinic_services_office_idx on public.clinic_services(office_id, sort);

-- ---------- Doctors ----------
create table if not exists public.clinic_doctors (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices(id) on delete cascade,
  name        text not null,
  specialty   text,
  image       text,
  active      boolean not null default true,
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists clinic_doctors_office_idx on public.clinic_doctors(office_id, sort);

-- ---------- Weekly working hours (one row per weekday per office) ----------
-- weekday: 0=Sunday … 6=Saturday. Times are minutes-from-midnight in the
-- clinic's local time (Asia/Riyadh, UTC+3). When an office has NO rows, the
-- booking engine falls back to sensible defaults (09:00–22:00, 30-min slots).
create table if not exists public.clinic_hours (
  office_id  uuid not null references public.offices(id) on delete cascade,
  weekday    int  not null check (weekday between 0 and 6),
  is_open    boolean not null default true,
  start_min  int  not null default 540,
  end_min    int  not null default 1320,
  slot_min   int  not null default 30,
  primary key (office_id, weekday)
);

-- ---------- Appointments ----------
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  office_id     uuid not null references public.offices(id) on delete cascade,
  service_id    uuid references public.clinic_services(id) on delete set null,
  doctor_id     uuid references public.clinic_doctors(id) on delete set null,
  service_name  text,
  patient_name  text not null,
  patient_phone text not null,
  starts_at     timestamptz not null,
  duration_min  int  not null default 30,
  status        text not null default 'booked', -- booked | confirmed | done | cancelled | noshow
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists appointments_office_time_idx on public.appointments(office_id, starts_at);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.clinic_services enable row level security;
alter table public.clinic_doctors  enable row level security;
alter table public.clinic_hours    enable row level security;
alter table public.appointments    enable row level security;

-- Services / doctors / hours: public can read rows of an ACTIVE office (needed
-- to render the public booking widget); the owning office admin manages them.
do $$
declare t text;
begin
  foreach t in array array['clinic_services','clinic_doctors','clinic_hours'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format($f$
      create policy %1$s_public_read on public.%1$s for select using (
        public.is_super_admin()
        or office_id = public.current_office_id()
        or exists (select 1 from public.offices o where o.id = office_id and o.status = 'active')
      )$f$, t);

    execute format('drop policy if exists %1$s_owner_write on public.%1$s', t);
    execute format($f$
      create policy %1$s_owner_write on public.%1$s for all using (
        office_id = public.current_office_id() or public.is_super_admin()
      ) with check (
        office_id = public.current_office_id() or public.is_super_admin()
      )$f$, t);
  end loop;
end $$;

-- Appointments: only the owning office admin (or super admin) can read/update.
-- Inserts happen through the booking API with the service-role key (bypasses RLS).
drop policy if exists appointments_read_own on public.appointments;
create policy appointments_read_own on public.appointments
  for select using (office_id = public.current_office_id() or public.is_super_admin());

drop policy if exists appointments_update_own on public.appointments;
create policy appointments_update_own on public.appointments
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());
