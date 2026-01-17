-- 1. Ensure 'state' column exists in institutes table
-- (Safe to run even if column exists, though 'add column if not exists' is postgres 9.6+)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='state') THEN
        ALTER TABLE institutes ADD COLUMN state TEXT;
    END IF;
END
$$;

-- 2. Create Medical News Table
create table if not exists public.medical_news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  image_url text,
  source text,
  link text,
  published_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS for news (Public Read, Service Role Write)
alter table public.medical_news enable row level security;

create policy "Enable read access for all users"
  on public.medical_news for select
  using ( true );
