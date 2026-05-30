-- Public bucket for office site media (logos, project & team photos).
-- Run after schema.sql.

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Anyone can read (public bucket, used by the live tenant sites).
drop policy if exists site_media_public_read on storage.objects;
create policy site_media_public_read on storage.objects
  for select using (bucket_id = 'site-media');

-- Authenticated users may upload/update/delete only inside their own office folder:
--   path = "<office_id>/<filename>"
drop policy if exists site_media_owner_write on storage.objects;
create policy site_media_owner_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin())
  );

drop policy if exists site_media_owner_update on storage.objects;
create policy site_media_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin())
  );

drop policy if exists site_media_owner_delete on storage.objects;
create policy site_media_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'site-media'
    and ((storage.foldername(name))[1] = public.current_office_id()::text or public.is_super_admin())
  );
