-- ============================================================
-- Subscription plans (source of truth, editable by super admin).
-- Run in Supabase SQL Editor. The app falls back to code defaults
-- if this table is missing/empty, so it's safe to run anytime.
-- caps.presetLimit: null = unlimited.
-- ============================================================

create table if not exists public.plans (
  code             text primary key,
  name             text not null,
  price            numeric(10,2) not null,
  currency         text not null default 'SAR',
  period           text not null default 'شهرياً',
  duration_days    int  not null default 30,
  features         jsonb not null default '[]'::jsonb,
  payment_link     text,
  salla_product_id text,
  caps             jsonb not null default '{"solidOnly":false,"presets":true,"presetLimit":null,"upload":true}'::jsonb,
  highlight        boolean not null default false,
  sort_order       int not null default 0,
  active           boolean not null default true,
  updated_at       timestamptz not null default now()
);

alter table public.plans enable row level security;

drop policy if exists plans_public_read on public.plans;
create policy plans_public_read on public.plans
  for select using (active = true or public.is_super_admin());

drop policy if exists plans_admin_write on public.plans;
create policy plans_admin_write on public.plans
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- Seed / update the three tiers.
insert into public.plans (code, name, price, period, duration_days, features, payment_link, salla_product_id, caps, highlight, sort_order, active)
values
  ('basic', 'الأساسية', 249, 'شهرياً', 30,
   '["موقع مكتب كامل بنطاق فرعي","خلفية أنيقة (بيضاء أو سوداء)","محرّر محتوى متكامل","صندوق رسائل العملاء + إشعار بريدي","تحسين الظهور في جوجل (SEO)","أزرار تواصل (واتساب/تيك توك/سناب)"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_BASIC', 'REPLACE_BASIC_PRODUCT_ID',
   '{"solidOnly":true,"presets":false,"presetLimit":0,"upload":false}'::jsonb, false, 1, true),

  ('pro', 'الاحترافية', 499, 'شهرياً', 30,
   '["كل مزايا الأساسية","٥ خلفيات فيديو سينمائية جاهزة","خلفية تتحرك مع التمرير","خريطة موقع المكتب (جوجل)","معرض مشاريع بنقر للتكبير"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_PRO', 'REPLACE_PRO_PRODUCT_ID',
   '{"solidOnly":false,"presets":true,"presetLimit":5,"upload":false}'::jsonb, true, 2, true),

  ('premium', 'بريميوم', 899, 'شهرياً', 30,
   '["كل مزايا الاحترافية","جميع خلفيات الفيديو الجاهزة","رفع فيديو/صور خلفية خاصة بك","تحويل فيديوك لحركة مع التمرير","أولوية في الدعم الفني","نطاق مخصّص (قريباً)"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_PREMIUM', 'REPLACE_PREMIUM_PRODUCT_ID',
   '{"solidOnly":false,"presets":true,"presetLimit":null,"upload":true}'::jsonb, false, 3, true)
on conflict (code) do update set
  name = excluded.name, price = excluded.price, period = excluded.period,
  duration_days = excluded.duration_days, features = excluded.features,
  caps = excluded.caps, highlight = excluded.highlight, sort_order = excluded.sort_order,
  active = excluded.active, updated_at = now();
