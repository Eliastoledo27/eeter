-- =====================================================================
-- RBAC JWT ROLE SYNC MIGRATION — Éter Store
-- =====================================================================
-- This migration adds a trigger that syncs the user's role from the
-- profiles table into auth.users.raw_app_meta_data, embedding the role
-- directly in the JWT token. This eliminates the need for an extra DB
-- query during middleware execution.
--
-- Run this in Supabase SQL Editor if MCP is unavailable.
-- =====================================================================

-- 1. Create function to sync role into JWT app_metadata
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role::text)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger on profiles table
DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON public.profiles;
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.sync_role_to_jwt();

-- 3. Backfill existing users: sync their current roles to JWT
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, role FROM public.profiles WHERE role IS NOT NULL
  LOOP
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', r.role::text)
    WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Create helper function to get role from JWT (for use in RLS policies)
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role',
    'user'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. Create helper function to check if JWT role is admin or support
CREATE OR REPLACE FUNCTION public.is_admin_or_support_jwt()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_jwt_role() IN ('admin', 'support');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================================
-- VERIFICATION: Run these to confirm
-- =====================================================================
-- SELECT id, email, raw_app_meta_data->>'role' as jwt_role FROM auth.users;
-- SELECT public.get_jwt_role();
-- =====================================================================
