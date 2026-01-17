-- FIX NEWS SCHEMA V3 (UUID & URL Support)
-- Run this in Supabase SQL Editor.

-- 1. Drop existing table to avoid conflicts with ID types
DROP TABLE IF EXISTS public.medical_news;

-- 2. Create Table with requested schema
CREATE TABLE public.medical_news (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  summary text,
  category text,
  source text,
  url text,
  image_url text, -- Keeping this as it's useful for UI even if not explicitly asked, or can omit if strict. I'll include it as nullable.
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.medical_news ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Read Policy
CREATE POLICY "Allow public read"
ON public.medical_news
FOR SELECT
USING (true);

-- 5. Insert Sample Data
INSERT INTO public.medical_news (title, summary, category, source, url)
VALUES
  (
    'New Blood Donation Guidelines 2026',
    'The Ministry has updated the eligibility criteria for blood donation.',
    'Donation',
    'Ministry of Health',
    'https://nbtc.naco.gov.in'
  ),
  (
    'Urgent Need for O- Blood in Mumbai',
    'Several hospitals facing shortage of negative blood groups.',
    'Emergency',
    'City Health Dept',
    '#'
  ),
  (
    'World Health Day: Focus on Free Checkups',
    'Government hospitals to provide free cardiac checkups this week.',
    'Health',
    'PIB India',
    '#'
  );
