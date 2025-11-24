-- Drop existing tables to avoid conflicts (WARNING: DELETES DATA)
DROP TABLE IF EXISTS public.saved_careers;
DROP TABLE IF EXISTS public.profiles;

-- Create Profiles Table (Linked to Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  gender TEXT,
  age INTEGER,
  education_level TEXT,
  specialization TEXT,
  residence_country TEXT,
  preferred_work_country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create Saved Careers Table
CREATE TABLE public.saved_careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  career_uid TEXT NOT NULL, -- The specific career ID (e.g. from the app state)
  title TEXT NOT NULL,
  match_score INTEGER,
  summary TEXT,
  salary_range TEXT,
  growth TEXT,
  tags TEXT[],
  is_pivot BOOLEAN DEFAULT false,
  pivot_analysis TEXT,
  roadmap JSONB,
  day_in_life_prompts TEXT[],
  slide_images TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, career_uid) -- Prevent duplicate saves of same career
);

-- Enable RLS
ALTER TABLE public.saved_careers ENABLE ROW LEVEL SECURITY;

-- Create Policies for Saved Careers
CREATE POLICY "Users can view own saved careers" ON public.saved_careers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved careers" ON public.saved_careers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved careers" ON public.saved_careers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved careers" ON public.saved_careers
  FOR DELETE USING (auth.uid() = user_id);
