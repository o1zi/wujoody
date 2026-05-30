-- ============================================================
-- Leads (contact-form submissions). Run in Supabase SQL Editor.
-- ============================================================

create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices(id) on delete cascade,
  name        text,
  contact     text,
  message     text,
  status      text not null default 'new',   -- new | read | archived
  created_at  timestamptz not null default now()
);
create index if not exists leads_office_idx on public.leads(office_id, created_at desc);

alter table public.leads enable row level security;

-- Office owner / super admin can read & update their own leads.
drop policy if exists leads_read_own on public.leads;
create policy leads_read_own on public.leads
  for select using (office_id = public.current_office_id() or public.is_super_admin());

drop policy if exists leads_update_own on public.leads;
create policy leads_update_own on public.leads
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());

-- Inserts come from the public site via the /api/leads route (service role),
-- which bypasses RLS — so no public insert policy is needed.
