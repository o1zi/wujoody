-- ============================================================
-- الدعم الفني: محادثة لكل مكتب بين المكتب والسوبر أدمن.
-- Run in Supabase SQL Editor (also included in setup-all.sql).
-- ============================================================

create table if not exists public.support_messages (
  id          uuid primary key default gen_random_uuid(),
  office_id   uuid not null references public.offices(id) on delete cascade,
  sender      text not null check (sender in ('office', 'admin')),
  body        text not null,
  read        boolean not null default false,  -- read by the recipient
  created_at  timestamptz not null default now()
);
create index if not exists support_office_idx on public.support_messages(office_id, created_at);

alter table public.support_messages enable row level security;

drop policy if exists support_read on public.support_messages;
create policy support_read on public.support_messages
  for select using (office_id = public.current_office_id() or public.is_super_admin());

drop policy if exists support_insert on public.support_messages;
create policy support_insert on public.support_messages
  for insert with check (office_id = public.current_office_id() or public.is_super_admin());

drop policy if exists support_update on public.support_messages;
create policy support_update on public.support_messages
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());
