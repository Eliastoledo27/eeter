-- Add bank transfer details columns to public.profiles table to support direct reseller payments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_cbu text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_alias text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bank_owner_name text;
