-- 1. Create the bucket 'letters' (Make it PUBLIC so getPublicUrl works for previews)
insert into storage.buckets (id, name, public) 
values ('letters', 'letters', true) 
on conflict (id) do update set public = true;

-- 2. Create Policies (Skip 'alter table' as it's likely already enabled and causes permission errors)

-- Allow uploads
drop policy if exists "Authenticated users can upload letters" on storage.objects;
create policy "Authenticated users can upload letters"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'letters' );

-- Allow viewing (although it's public, this helps if we switch to private later, 
-- plus 'public' bucket setting handles unauthenticated access usually, 
-- but we give explicit authenticated access here too)
drop policy if exists "Authenticated users can view letters" on storage.objects;
create policy "Authenticated users can view letters"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'letters' );

-- Allow deletions (Optional, good for testing)
drop policy if exists "Authenticated users can delete letters" on storage.objects;
create policy "Authenticated users can delete letters"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'letters' );
