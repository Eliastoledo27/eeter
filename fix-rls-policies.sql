-- ========================================================================
-- FIX RLS POLICIES FOR PROFILES TABLE - ÉTER STORE
-- ========================================================================
-- This script resolves the infinite recursion error in RLS policies
-- by using JWT claims instead of querying the profiles table
-- 
-- Run this in Supabase SQL Editor
-- ========================================================================

-- STEP 1: Drop all existing problematic policies
-- ========================================================================

DROP POLICY IF EXISTS "profiles: user can read own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "allow_read_self" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.is_admin();

-- ========================================================================
-- STEP 2: Create helper function to check admin status without recursion
-- ========================================================================

CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current user's email matches the admin email
  -- This uses JWT claims, not the profiles table, avoiding recursion
  RETURN (
    COALESCE(
      NULLIF(current_setting('request.jwt.claims', true), '')::json->>'email',
      ''
    ) = 'feitopepe510@gmail.com'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ========================================================================
-- STEP 3: Create new RLS policies using JWT claims (no recursion)
-- ========================================================================

-- Policy 1: SELECT - Users can read their own profile, admins can read all
CREATE POLICY "profiles_select_policy"
ON public.profiles 
FOR SELECT
USING (
  -- User can see their own profile
  auth.uid() = id 
  OR
  -- Admin can see all profiles (using JWT email, not querying profiles)
  is_admin_by_email()
);

-- Policy 2: UPDATE - Users can update their own profile, admins can update all
CREATE POLICY "profiles_update_policy"
ON public.profiles 
FOR UPDATE
USING (
  -- User can update their own profile
  auth.uid() = id
  OR
  -- Admin can update any profile
  is_admin_by_email()
);

-- Policy 3: INSERT - Only during signup or by admins
CREATE POLICY "profiles_insert_policy"
ON public.profiles 
FOR INSERT
WITH CHECK (
  -- User can insert their own profile (during signup)
  auth.uid() = id
  OR
  -- Admin can create profiles
  is_admin_by_email()
);

-- Policy 4: DELETE - Only admins can delete profiles
CREATE POLICY "profiles_delete_policy"
ON public.profiles 
FOR DELETE
USING (
  is_admin_by_email()
);

-- ========================================================================
-- STEP 4: Ensure RLS is enabled
-- ========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========================================================================
-- STEP 5: Grant necessary permissions
-- ========================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- ========================================================================
-- VERIFICATION QUERIES (Run these to test)
-- ========================================================================

-- Test 1: Check if policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'profiles';

-- Test 2: Check if function exists
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name = 'is_admin_by_email';

-- ========================================================================
-- NOTES
-- ========================================================================
-- 
-- This solution uses JWT claims to check admin status without querying
-- the profiles table, which prevents infinite recursion.
-- 
-- The admin email is hardcoded as 'feitopepe510@gmail.com' in the
-- is_admin_by_email() function.
-- 
-- To add more admins in the future, you can either:
-- 1. Update the function to check against multiple emails
-- 2. Use auth.users metadata (see alternative solution below)
-- 
-- ========================================================================

-- ========================================================================
-- ALTERNATIVE SOLUTION: Use auth.users metadata (More scalable)
-- ========================================================================
-- 
-- If you prefer a more scalable solution that doesn't hardcode emails,
-- uncomment the following section and comment out the previous policies.
-- This approach stores the role in auth.users metadata and syncs it
-- automatically.
-- 
-- ========================================================================

/*
-- Drop the simple function
DROP FUNCTION IF EXISTS public.is_admin_by_email();

-- Create function to sync role to auth.users metadata
CREATE OR REPLACE FUNCTION public.sync_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metadata in auth.users
  UPDATE auth.users
  SET raw_user_meta_data = 
    COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync role changes
DROP TRIGGER IF EXISTS sync_role_trigger ON public.profiles;
CREATE TRIGGER sync_role_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION sync_role_to_auth();

-- Helper function to check admin using metadata
CREATE OR REPLACE FUNCTION public.is_admin_from_metadata()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      ''
    ) IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Recreate policies using metadata
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR is_admin_from_metadata());

CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR is_admin_from_metadata());

CREATE POLICY "profiles_insert_policy"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id OR is_admin_from_metadata());

CREATE POLICY "profiles_delete_policy"
ON public.profiles FOR DELETE
USING (is_admin_from_metadata());

-- IMPORTANT: After creating the trigger, manually update the admin user
-- to trigger the sync:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'feitopepe510@gmail.com';
*/

-- ========================================================================
-- END OF SCRIPT
-- ========================================================================
