-- Create a table for public profiles
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  blood_group text,
  created_at timestamp with time zone default now(),

  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies

-- 1. Allow authenticated users to view their own profile (and potentially others if this is a directory, 
--    but the requirement specifically said "auth.uid() = id" for select, so we start with strict privacy)
create policy "Public profiles are viewable by owner"
  on public.profiles for select
  to authenticated
  using ( auth.uid() = id );

-- 2. Allow authenticated users to insert their own profile
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ( auth.uid() = id );

-- 3. Allow authenticated users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ( auth.uid() = id );
