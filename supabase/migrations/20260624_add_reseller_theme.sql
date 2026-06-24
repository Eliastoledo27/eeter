-- Add reseller_theme column to profiles table to support multiple public catalog templates
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reseller_theme text DEFAULT 'original';
