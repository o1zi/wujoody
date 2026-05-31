-- ============================================================
-- التحليلات: أحداث الموقع (زيارات ونقرات). Run in Supabase SQL Editor
-- (also included in setup-all.sql).
-- ============================================================

create table if not exists public.site_events (
  id          bigint generated always as identity primary key,
  office_id   uuid not null references public.offices(id) on delete cascade,
  type        text not null,  -- 'view' | 'click_whatsapp' | 'click_tiktok' | 'click_snapchat' | 'click_instagram' | 'click_linkedin'
  created_at  timestamptz not null default now()
);
create index if not exists site_events_office_time_idx on public.site_events(office_id, created_at desc);
create index if not exists site_events_office_type_idx on public.site_events(office_id, type);

alter table public.site_events enable row level security;

-- Office owner / super admin can read their own analytics. Inserts come from
-- /api/track (service role), so no public insert policy.
drop policy if exists site_events_read on public.site_events;
create policy site_events_read on public.site_events
  for select using (office_id = public.current_office_id() or public.is_super_admin());
