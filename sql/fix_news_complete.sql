-- MASTER NEWS SCHEMA FIX
-- Run this in Supabase SQL Editor to guarantee your table is correct.

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.medical_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    source TEXT,
    url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    -- News 2.0 Columns
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'published',
    guid TEXT UNIQUE
);

-- 2. Add columns if table already existed but missing these (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_news' AND column_name='category') THEN
        ALTER TABLE public.medical_news ADD COLUMN category TEXT DEFAULT 'General';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_news' AND column_name='status') THEN
        ALTER TABLE public.medical_news ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medical_news' AND column_name='guid') THEN
        ALTER TABLE public.medical_news ADD COLUMN guid TEXT;
        ALTER TABLE public.medical_news ADD CONSTRAINT news_guid_unique UNIQUE (guid);
    END IF;
END
$$;

-- 3. Enable RLS
ALTER TABLE public.medical_news ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Drop old ones to be clean
DROP POLICY IF EXISTS "Public can view active news" ON public.medical_news;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.medical_news;
DROP POLICY IF EXISTS "Public Read Published" ON public.medical_news;

-- Create correct policy: Public can read only 'published'
CREATE POLICY "Public Read Published" 
ON public.medical_news FOR SELECT 
USING (status = 'published');

-- 5. Backfill/Cleanup Data
UPDATE public.medical_news SET status = 'published' WHERE status IS NULL;
UPDATE public.medical_news SET category = 'Donation' WHERE category = 'General' AND (title ILIKE '%blood%' OR description ILIKE '%blood%');
UPDATE public.medical_news SET category = 'Health' WHERE category = 'General' AND (title ILIKE '%health%' OR description ILIKE '%health%');

-- 6. Insert Sample Data if Empty
INSERT INTO public.medical_news (title, description, source, category, status, published_at)
SELECT 'New Blood Storage Guidelines', 'Updated protocols for 2026 ensure better safety and longevity of stored blood units.', 'Ministry of Health', 'Health', 'published', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.medical_news);
