-- Create medical_news table (or update if exists)
CREATE TABLE IF NOT EXISTS public.medical_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT,
    url TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.medical_news ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active news
CREATE POLICY "Public can view active news" 
ON public.medical_news FOR SELECT 
USING (is_active = true);

-- Policy: Service role (backend) can full access (implicit, but good to clarify if needed, though service role bypasses RLS)

-- Insert some dummy data if empty
INSERT INTO public.medical_news (title, description, source, url, published_at)
SELECT 
    'New Blood Storage Guidelines Released', 
    'The Ministry of Health has released updated guidelines for blood storage and transportation to ensure maximum safety.', 
    'Health Ministry', 
    '#',
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.medical_news LIMIT 1);

INSERT INTO public.medical_news (title, description, source, url, published_at)
SELECT 
    'World Blood Donor Day Approaches', 
    'Join us in celebrating voluntary blood donors who save lives every day. Events scheduled across the nation.', 
    'Red Cross', 
    '#',
    NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM public.medical_news LIMIT 1);
