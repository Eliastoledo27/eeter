-- Migration: Complete Role-Based Access Control Setup
-- Author: Antigravity
-- Date: 2026-02-12

BEGIN;

-- 1. Create User Role Enum (Idempotent)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'support', 'reseller', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user'::user_role;

-- 3. Create Function to Sync Profile Role to Auth Metadata
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the auth.users metadata securely
    UPDATE auth.users
    SET raw_app_meta_data = 
        coalesce(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger to Auto-Sync on Profile Update/Insert
DROP TRIGGER IF EXISTS on_profile_role_change ON public.profiles;
CREATE TRIGGER on_profile_role_change
AFTER UPDATE OF role OR INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();

-- 5. Backfill existing users (Fix for current stalled users)
-- This updates auth.users for any profile that has a role mismatch
UPDATE auth.users u
SET raw_app_meta_data = 
    coalesce(u.raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE u.id = p.id
AND (u.raw_app_meta_data->>'role' IS DISTINCT FROM p.role::text);

COMMIT;
