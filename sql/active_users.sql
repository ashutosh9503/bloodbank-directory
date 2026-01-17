-- 1. Active Users Table (for anonymous live tracking)
create table if not exists public.active_users (
    id uuid primary key, -- Generated client-side (random UUID)
    last_seen timestamp with time zone default now()
);

-- Enable RLS
alter table public.active_users enable row level security;

-- Policy: Allow anyone (anon) to insert/update their own record (by ID technically, but for anon we allow insert)
-- Actually, for anon tracking, we might just allow public insert/update.
create policy "Allow public insert/update for active_users"
on public.active_users
for all
using (true)
with check (true);

-- 2. Institutes Policy (Read-only for public)
-- Ensure institutes RLS is enabled if not already
alter table institutes enable row level security;

create policy "Enable read access for all users"
on institutes for select
using (true);

-- 3. Profiles Policy (for counting)
-- We already have profiles policies, but we need ensure we can count them via service role function.

-- 4. Function to clean up old active users (optional, can be cron or just filter on select)
