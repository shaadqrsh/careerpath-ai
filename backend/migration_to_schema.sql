-- 1. Create the new schema
CREATE SCHEMA IF NOT EXISTS careerpath_ai;

-- 2. Move existing tables (if they exist in public)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE public.profiles SET SCHEMA careerpath_ai;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'saved_careers') THEN
        ALTER TABLE public.saved_careers SET SCHEMA careerpath_ai;
    END IF;
END $$;

-- 3. Move the function
DROP FUNCTION IF EXISTS public.check_and_increment_quota(UUID, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION careerpath_ai.check_and_increment_quota(
    p_user_id UUID,
    p_count_field TEXT,
    p_date_field TEXT,
    p_limit INT
)
RETURNS BOOLEAN AS $$
DECLARE
    current_val INT;
    last_date TIMESTAMPTZ;
    new_val INT;
BEGIN
    -- Dynamic query with schema 'careerpath_ai'
    EXECUTE format('SELECT %I, %I FROM careerpath_ai.profiles WHERE id = $1 FOR UPDATE', p_count_field, p_date_field)
    INTO current_val, last_date
    USING p_user_id;

    IF date(now() AT TIME ZONE 'utc') > date(last_date AT TIME ZONE 'utc') THEN
        current_val := 0;
    END IF;

    IF current_val >= p_limit THEN
        RETURN FALSE;
    END IF;

    new_val := current_val + 1;
    EXECUTE format('UPDATE careerpath_ai.profiles SET %I = $1, %I = $2 WHERE id = $3', p_count_field, p_date_field)
    USING new_val, now(), p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant usage on the new schema
GRANT USAGE ON SCHEMA careerpath_ai TO authenticated;
GRANT USAGE ON SCHEMA careerpath_ai TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA careerpath_ai TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA careerpath_ai TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA careerpath_ai TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA careerpath_ai TO service_role;

-- 5. Storage Migration & Security Hardening
-- Bucket: careerpath_ai_slideshows
INSERT INTO storage.buckets (id, name, public) 
VALUES ('careerpath_ai_slideshows', 'careerpath_ai_slideshows', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Strict Security Policies
-- SELECT: Public access allowed (images are public in the app)
CREATE POLICY "Public can view slideshow images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'careerpath_ai_slideshows');

-- INSERT: Authenticated users only, must own the folder, AND match a profile in careerpath_ai
CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'careerpath_ai_slideshows' 
    AND (storage.foldername(name))[1] = auth.uid()::text 
    AND (EXISTS (SELECT 1 FROM careerpath_ai.profiles WHERE id = auth.uid()))
);

-- UPDATE: Authenticated users only, own folder
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE TO authenticated 
USING (
    bucket_id = 'careerpath_ai_slideshows' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Authenticated users only, own folder
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE TO authenticated 
USING (
    bucket_id = 'careerpath_ai_slideshows' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
