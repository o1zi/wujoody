-- ============================================================
-- شغّل هذا الملف مرة واحدة في Supabase → SQL Editor
-- يُنشئ كل الجداول/الصلاحيات الناقصة بعد schema.sql الأساسي.
-- آمن لإعادة التشغيل (idempotent).
-- ============================================================

-- ---------- 1) leads (رسائل التواصل) ----------
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
alter table public.leads add column if not exists kind text; -- 'message' | 'booking'
alter table public.leads add column if not exists note text; -- CRM note (Premium)
alter table public.leads enable row level security;
drop policy if exists leads_read_own on public.leads;
create policy leads_read_own on public.leads
  for select using (office_id = public.current_office_id() or public.is_super_admin());
drop policy if exists leads_update_own on public.leads;
create policy leads_update_own on public.leads
  for update using (office_id = public.current_office_id() or public.is_super_admin())
  with check (office_id = public.current_office_id() or public.is_super_admin());

-- ---------- 2) plans (الباقات) ----------
create table if not exists public.plans (
  code text primary key,
  name text not null,
  price numeric(10,2) not null,
  currency text not null default 'SAR',
  period text not null default 'شهرياً',
  duration_days int not null default 30,
  features jsonb not null default '[]'::jsonb,
  payment_link text,
  salla_product_id text,
  caps jsonb not null default '{"solidOnly":false,"presets":true,"presetLimit":null,"upload":true}'::jsonb,
  highlight boolean not null default false,
  sort_order int not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.plans enable row level security;
drop policy if exists plans_public_read on public.plans;
create policy plans_public_read on public.plans
  for select using (active = true or public.is_super_admin());
drop policy if exists plans_admin_write on public.plans;
create policy plans_admin_write on public.plans
  for all using (public.is_super_admin()) with check (public.is_super_admin());

insert into public.plans (code, name, price, period, duration_days, features, payment_link, salla_product_id, caps, highlight, sort_order, active)
values
  ('basic', 'الأساسية', 249, 'شهرياً', 30,
   '["موقع مكتب كامل بنطاق فرعي","خلفية أنيقة (بيضاء أو سوداء)","محرّر محتوى متكامل","صندوق رسائل العملاء + إشعار بريدي","تحسين الظهور في جوجل (SEO)","أزرار تواصل (واتساب/تيك توك/سناب)"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_BASIC', 'REPLACE_BASIC_PRODUCT_ID',
   '{"solidOnly":true,"presets":false,"presetLimit":0,"upload":false,"whatsapp":false,"booking":false,"blog":false,"projectDetails":false,"badges":false,"profilePdf":false,"customDomain":false,"crm":false,"aiContent":false,"aiMonthlyLimit":0,"monthlyReport":false}'::jsonb, false, 1, true),
  ('pro', 'الاحترافية', 499, 'شهرياً', 30,
   '["كل مزايا الأساسية","٥ خلفيات فيديو سينمائية جاهزة","خلفية تتحرك مع التمرير","خريطة موقع المكتب (جوجل)","معرض مشاريع بنقر للتكبير"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_PRO', 'REPLACE_PRO_PRODUCT_ID',
   '{"solidOnly":false,"presets":true,"presetLimit":5,"upload":false,"whatsapp":true,"booking":true,"blog":true,"projectDetails":true,"badges":true,"profilePdf":true,"customDomain":true,"crm":false,"aiContent":false,"aiMonthlyLimit":0,"monthlyReport":false}'::jsonb, true, 2, true),
  ('premium', 'بريميوم', 899, 'شهرياً', 30,
   '["كل مزايا الاحترافية","جميع خلفيات الفيديو الجاهزة","رفع فيديو/صور خلفية خاصة بك","تحويل فيديوك لحركة مع التمرير","أولوية في الدعم الفني","نطاق مخصّص (قريباً)"]'::jsonb,
   'https://salla.sa/your-store/checkout/REPLACE_PREMIUM', 'REPLACE_PREMIUM_PRODUCT_ID',
   '{"solidOnly":false,"presets":true,"presetLimit":null,"upload":true,"whatsapp":true,"booking":true,"blog":true,"projectDetails":true,"badges":true,"profilePdf":true,"customDomain":true,"crm":true,"aiContent":true,"aiMonthlyLimit":10,"monthlyReport":true}'::jsonb, false, 3, true)
on conflict (code) do update set
  name = excluded.name, price = excluded.price, period = excluded.period,
  duration_days = excluded.duration_days, features = excluded.features,
  caps = excluded.caps, highlight = excluded.highlight, sort_order = excluded.sort_order,
  active = excluded.active, updated_at = now();

-- ---------- 3) app_settings (محتوى صفحة الهبوط) ----------
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
drop policy if exists app_settings_public_read on public.app_settings;
create policy app_settings_public_read on public.app_settings
  for select using (true);

-- ---------- 3b) support_messages (الدعم الفني) ----------
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  sender text not null check (sender in ('office','admin')),
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
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

-- ---------- 3c) site_events (التحليلات) ----------
create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  office_id uuid not null references public.offices(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);
create index if not exists site_events_office_time_idx on public.site_events(office_id, created_at desc);
create index if not exists site_events_office_type_idx on public.site_events(office_id, type);
alter table public.site_events enable row level security;
drop policy if exists site_events_read on public.site_events;
create policy site_events_read on public.site_events
  for select using (office_id = public.current_office_id() or public.is_super_admin());

-- ---------- 3d) profiles.phone (ربط دفع سلة برقم الجوال) ----------
alter table public.profiles add column if not exists phone text;

-- ---------- 3e) offices: النطاق الخاص (Pro) ----------
alter table public.offices add column if not exists custom_domain text;
alter table public.offices add column if not exists domain_status text not null default 'none';
create unique index if not exists offices_custom_domain_key on public.offices(custom_domain) where custom_domain is not null;

-- إعادة إنشاء الدالة لتخزين رقم الجوال من بيانات التسجيل (آمن لإعادة التشغيل).
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

-- ---------- 3f) ai_usage (حد استخدام الذكاء الاصطناعي شهرياً) ----------
create table if not exists public.ai_usage (
  office_id uuid not null references public.offices(id) on delete cascade,
  period text not null,            -- 'YYYY-MM'
  count int not null default 0,
  primary key (office_id, period)
);
alter table public.ai_usage enable row level security;
drop policy if exists ai_usage_read_own on public.ai_usage;
create policy ai_usage_read_own on public.ai_usage
  for select using (office_id = public.current_office_id() or public.is_super_admin());

-- ---------- 4) storage: السماح للسوبر أدمن برفع وسائط أي مكتب ----------
drop policy if exists site_media_owner_write on storage.objects;
create policy site_media_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin()));
drop policy if exists site_media_owner_update on storage.objects;
create policy site_media_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin()));
drop policy if exists site_media_owner_delete on storage.objects;
create policy site_media_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin()));
