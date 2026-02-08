-- Create catalogs table
CREATE TABLE IF NOT EXISTS public.catalogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own catalogs" ON public.catalogs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own catalogs" ON public.catalogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogs" ON public.catalogs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogs" ON public.catalogs
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket creation (Note: This is usually done via Supabase dashboard, 
-- but we provide SQL for policy management if the bucket exists)
-- Assuming bucket name is 'catalogs'

-- Storage Policies (Requires 'catalogs' bucket to exist)
-- Allow public read (if catalogs are public) or authenticated read
-- Let's assume authenticated read for own catalogs, or public read for sharing?
-- Requirement says "Visualización en el index", implying user sees their own or maybe public ones?
-- "Listado de catálogos del usuario" -> user manages their own.
-- "Visualización en el index" -> "muestre los catálogos en la página principal".
-- Let's assume public read is fine for simplicity of "Ver catálogo" button opening new tab.

-- Policy to allow authenticated uploads
-- insert into storage.buckets (id, name, public) values ('catalogs', 'catalogs', true);

-- CREATE POLICY "Give users access to own folder" ON storage.objects
--   FOR ALL USING (bucket_id = 'catalogs' AND auth.uid()::text = (storage.foldername(name))[1]);
