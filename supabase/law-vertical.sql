-- ============================================================
-- Add the LAW vertical (مكاتب المحاماة) — third business kind.
-- Run AFTER vertical.sql in the Supabase SQL Editor. Idempotent.
-- ============================================================

-- ---------- Widen offices.kind to allow 'law' ----------
alter table public.offices drop constraint if exists offices_kind_check;
alter table public.offices
  add constraint offices_kind_check check (kind in ('engineering', 'clinic', 'law'));

-- ---------- Signup trigger: default name + accepted kinds ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_office_id uuid;
  v_slug text := nullif(new.raw_user_meta_data->>'office_slug', '');
  v_kind text := coalesce(nullif(new.raw_user_meta_data->>'office_kind',''), 'engineering');
  v_default_name text := case
    when v_kind = 'clinic' then 'عيادة'
    when v_kind = 'law' then 'مكتب محاماة'
    else 'مكتب هندسي'
  end;
  v_office_name text := coalesce(nullif(new.raw_user_meta_data->>'office_name',''), v_default_name);
begin
  -- Normalize unexpected values so the check constraint can't reject the insert.
  if v_kind not in ('engineering', 'clinic', 'law') then
    v_kind := 'engineering';
  end if;

  if v_slug is not null then
    insert into public.offices(owner_id, name, slug, status, kind)
    values (new.id, v_office_name, v_slug, 'pending', v_kind)
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
