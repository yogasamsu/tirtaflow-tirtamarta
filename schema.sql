-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'direktur', 'umum', 'operasional', 'komersial', 'legal', 'secretary', 'spi')) not null default 'umum',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create Classification Codes table
create table classification_codes (
  code text primary key,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Classification Codes
alter table classification_codes enable row level security;

create policy "Classification codes are viewable by everyone."
  on classification_codes for select
  using ( true );

-- Create Letters table
create table letters (
  id uuid default uuid_generate_v4() primary key,
  sender text not null,
  subject text not null,
  date_received date not null,
  classification_code text references classification_codes(code), -- Linked to classification
  reference_number text, -- The generated letter number (e.g., 123/000.1.1/2025)
  summary text,
  file_url text, -- URL to Supabase Storage
  extracted_data jsonb, -- Raw JSON from AI
  status text check (status in ('new', 'dispositioned', 'archived')) default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references profiles(id)
);

-- Enable RLS for Letters
alter table letters enable row level security;

create policy "Letters are viewable by authenticated users."
  on letters for select
  to authenticated
  using ( true );

create policy "Only 'umum' and 'admin' can insert letters."
  on letters for insert
  to authenticated
  with check ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('umum', 'admin')
    )
  );

-- Create Dispositions table
create table dispositions (
  id uuid default uuid_generate_v4() primary key,
  letter_id uuid references letters(id) on delete cascade not null,
  from_user_id uuid references profiles(id) not null,
  to_user_id uuid references profiles(id) not null, -- Could be a specific user or we might need department-based routing later. For now, user-based.
  notes text,
  status text check (status in ('pending', 'completed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Dispositions
alter table dispositions enable row level security;

create policy "Dispositions are viewable by authenticated users."
  on dispositions for select
  to authenticated
  using ( true );

create policy "Authenticated users can create dispositions."
  on dispositions for insert
  to authenticated
  with check ( auth.uid() = from_user_id );

-- Storage Bucket Policy (You'll need to create a bucket named 'letters' in Supabase Storage manually or via script if possible, but usually manual)
-- This SQL just sets RLS for the objects if the bucket exists.
-- Assuming bucket name is 'letters'
-- insert into storage.buckets (id, name) values ('letters', 'letters'); 

-- Policy for storage objects (simplified for internal use)
-- create policy "Authenticated users can upload letters"
--   on storage.objects for insert
--   to authenticated
--   with check ( bucket_id = 'letters' );
  
-- create policy "Authenticated users can view letters"
--   on storage.objects for select
--   to authenticated
--   using ( bucket_id = 'letters' );
