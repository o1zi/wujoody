-- ============================================================
-- App settings (key/value JSON). Used for editable landing-page content.
-- Run in Supabase SQL Editor. Safe to run anytime (app falls back to code
-- defaults if missing).
-- ============================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Public can read (landing content is public). Writes happen via the
-- service-role key in super-admin actions, so no public write policy.
drop policy if exists app_settings_public_read on public.app_settings;
create policy app_settings_public_read on public.app_settings
  for select using (true);
