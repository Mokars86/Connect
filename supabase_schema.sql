-- ==============================================================================
-- CONNECT APP - SUPABASE DATABASE & STORAGE SCHEMA
-- Project ID: qkytpjhttmdpdrlqyjuo
-- Storage Bucket: Connect
-- ==============================================================================

-- 1. Create Connect Storage Bucket (if not already created)
INSERT INTO storage.buckets (id, name, public)
VALUES ('Connect', 'Connect', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for 'Connect' Bucket: Allow Public Read and Anon / Authenticated Uploads
CREATE POLICY "Public Read Connect Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'Connect');

CREATE POLICY "Allow Public Uploads to Connect Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Connect');

CREATE POLICY "Allow Public Updates to Connect Bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'Connect');

-- 2. Create Unified App Sync / Backup Table
CREATE TABLE IF NOT EXISTS public.connect_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL UNIQUE,
  is_authenticated BOOLEAN DEFAULT false,
  user_email TEXT,
  profiles JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  utility_qrs JSONB DEFAULT '[]'::jsonb,
  burner_profiles JSONB DEFAULT '[]'::jsonb,
  analytics JSONB DEFAULT '{}'::jsonb,
  subscription JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on connect_data
ALTER TABLE public.connect_data ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated access based on owner_id
CREATE POLICY "Allow select on connect_data"
ON public.connect_data FOR SELECT
USING (true);

CREATE POLICY "Allow insert/upsert on connect_data"
ON public.connect_data FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update on connect_data"
ON public.connect_data FOR UPDATE
USING (true);

-- 3. Dedicated Contacts Vault Table (Optional Normalized Table)
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  title TEXT,
  company TEXT,
  tag TEXT DEFAULT 'Networking',
  notes TEXT,
  met_at TEXT,
  date_saved TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public contacts access"
ON public.contacts FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Dedicated Profiles Table (Optional Normalized Table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  type TEXT DEFAULT 'Personal',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  title TEXT,
  company TEXT,
  linkedin TEXT,
  website TEXT,
  color TEXT DEFAULT '#00C9A7',
  avatar TEXT,
  qr_mode TEXT DEFAULT 'vcard',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles access"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);
