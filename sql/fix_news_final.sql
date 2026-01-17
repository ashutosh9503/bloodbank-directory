-- FINAL FIX for Medical News Table
-- This script will DROP and RECREATE the table to ensure a clean slate and fix "schema cache" errors.

DROP TABLE IF EXISTS public.medical_news;

CREATE TABLE public.medical_news (
  id bigint generated always as identity primary key,
  title text not null,
  summary text,
  content text,
  category text default 'General',
  source text,
  image_url text, -- Added for UI
  url text, -- Added for external link
  status text default 'published', -- Added for filtering
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.medical_news ENABLE ROW LEVEL SECURITY;

-- create policy "Public read news"
CREATE POLICY "Public read news"
ON public.medical_news
FOR SELECT
USING (true);

-- Insert Sample Data
INSERT INTO public.medical_news (title, summary, category, source, published_at, url)
VALUES
('New Blood Storage Guidelines 2026', 'The Ministry of Health has released updated guidelines for blood storage safety.', 'Health', 'Ministry of Health', NOW(), '#'),
('World Blood Donor Day Campaign', 'Join the nationwide campaign to celebrate voluntary blood donors.', 'Donation', 'Red Cross India', NOW() - INTERVAL '1 day', '#'),
('Emergency Blood Shortage in Metro Areas', 'Urgent call for O-negative donors in major metro hospitals.', 'Emergency', 'City Hospital', NOW() - INTERVAL '2 days', '#'),
('Government Launches Anaemia Free Initiative', 'New scheme targets anaemia reduction among rural populations.', 'Government', 'PIB', NOW() - INTERVAL '3 days', '#'),
('Tech in Healthcare: AI for Blood Matching', 'How AI is revolutionizing the speed of blood matching in emergencies.', 'Health', 'TechHealth Daily', NOW() - INTERVAL '5 days', '#');
