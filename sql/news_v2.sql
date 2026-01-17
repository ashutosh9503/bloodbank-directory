-- News System 2.0 Schema Updates

-- 1. Add new columns if they don't exist
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

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_status ON public.medical_news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON public.medical_news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.medical_news(published_at DESC);

-- 3. Update RLS Policies
-- Drop existing specific policies to avoid conflicts or confusion
DROP POLICY IF EXISTS "Public can view active news" ON public.medical_news;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.medical_news;

-- New Policy: Public can ONLY see 'published' news
CREATE POLICY "Public Read Published" 
ON public.medical_news FOR SELECT 
USING (status = 'published');

-- Policy: Admins/Service Role can see everything (Service role bypasses RLS, but for authenticated users with role 'admin' if we had them)
-- For now, we rely on Service Role (backend) for management.

-- 4. Initial Categorization (Backfill)
UPDATE public.medical_news 
SET category = 'Donation' 
WHERE title ILIKE '%blood%' OR description ILIKE '%blood%';

UPDATE public.medical_news 
SET category = 'Health' 
WHERE category = 'General' AND (title ILIKE '%health%' OR description ILIKE '%health%');
