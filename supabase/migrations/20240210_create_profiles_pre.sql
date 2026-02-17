-- =====================================================
-- MIGRATION: Create Profiles System
-- Description: Creates profiles table with user roles,
--              RLS policies, and auto-creation trigger
-- =====================================================

-- 1. Create user_role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'support', 'reseller', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  role user_role DEFAULT 'user' NOT NULL,
  reseller_slug text UNIQUE,
  whatsapp_number text,
  commission_rate float DEFAULT 0.1,
  is_premium boolean DEFAULT false,
  points integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity timestamp with time zone DEFAULT now(),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_reseller_slug ON public.profiles(reseller_slug);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public profiles visible" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

-- 6. Create RLS Policies

-- Policy: Anyone can view profiles (public information)
CREATE POLICY "Public profiles visible" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy: Admins can do everything with profiles
CREATE POLICY "Admins manage all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'support')
    )
  );

-- 7. Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, do nothing
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger to call the function on new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 9. Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to auto-update updated_at on profile changes
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 11. Populate existing auth users with profiles (if any exist)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 12. Comment on table and columns for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with role management and reseller functionality';
COMMENT ON COLUMN public.profiles.role IS 'User role: admin, support, reseller, or user';
COMMENT ON COLUMN public.profiles.reseller_slug IS 'Unique slug for reseller storefront URL';
COMMENT ON COLUMN public.profiles.commission_rate IS 'Commission percentage for resellers (0.1 = 10%)';
COMMENT ON COLUMN public.profiles.is_premium IS 'Premium subscription status for extended features';
COMMENT ON COLUMN public.profiles.points IS 'Gamification points for user engagement';
COMMENT ON COLUMN public.profiles.streak_days IS 'Consecutive days of activity for gamification';
