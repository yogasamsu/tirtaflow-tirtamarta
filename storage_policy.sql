-- Create the bucket if it doesn't exist (Public for easier viewing)
insert into storage.buckets (id, name, public) 
values ('letters', 'letters', true) 
on conflict (id) do update set public = true;

-- Enable RLS on objects
alter table storage.objects enable row level security;

-- Policy: Allow authenticated users to upload files to 'letters' bucket
create policy "Authenticated users can upload letters"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'letters' );

-- Policy: Allow authenticated users to view files in 'letters' bucket
create policy "Authenticated users can view letters"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'letters' );
