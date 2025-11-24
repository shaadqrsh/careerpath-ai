# CareerPath AI - Supabase & Gemini Setup Guide

## 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to `Project Settings` -> `API`.
3. Copy the `URL` and `anon public` key. You will need these for the app login screen.

## 2. Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a new API Key.
3. You will enter this key in the app setup screen alongside your Supabase keys.

## 3. SQL Database Setup

Go to the **SQL Editor** in your Supabase dashboard and run the following scripts.

### Step 1: Create Profiles Table

```sql
create table public.profiles (
  user_id uuid references auth.users not null primary key,
  full_name text,
  gender text,
  age integer,
  education_level text,
  specialization text,
  residence_country text,
  preferred_work_country text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = user_id);
```

### Step 2: Reset & Create Saved Careers Table (Run this to fix Save/Delete issues)

This script drops the old table (if it exists) and creates a new one using `career_uid` to strictly identify career paths.

```sql
-- Drop old table if exists
drop table if exists public.saved_careers;

-- Create new table with correct schema
create table public.saved_careers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  career_uid text not null, -- This is the string ID (e.g., 'career-123')
  title text not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Constraint: One entry per career per user
  unique(user_id, career_uid)
);

alter table public.saved_careers enable row level security;

-- Policies
create policy "Users can view own saved careers." on public.saved_careers
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved careers." on public.saved_careers
  for insert with check (auth.uid() = user_id);

create policy "Users can update own saved careers." on public.saved_careers
  for update using (auth.uid() = user_id);

create policy "Users can delete own saved careers." on public.saved_careers
  for delete using (auth.uid() = user_id);
```

## 4. Storage Setup

1. Go to **Storage** in Supabase sidebar.
2. Create a new bucket named `career_slideshows`.
3. Set it to **Public**.
4. Run the following Storage Policies in the SQL Editor (or configure in UI):

```sql
-- Allow authenticated users to upload images to their own folder
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'career_slideshows' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update/delete their own images
create policy "Allow authenticated delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'career_slideshows' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (so you can see images in the app)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'career_slideshows' );
```

## 5. Deployment & Security

### Disabling Local Key Storage (Production)

By default, the app looks for keys in `localStorage` to make development easy. **For production, you must disable this.**

1. Open `services/supabaseService.ts`.
2. Remove the lines that read from `localStorage`.
3. Ensure `getSupabaseConfig` ONLY returns `process.env.SUPABASE_URL` and `process.env.SUPABASE_KEY`.

**Example Secure Configuration:**
```typescript
const getSupabaseConfig = () => {
  return {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  };
};
```
Repeat this for `services/geminiService.ts` for the API Key.
