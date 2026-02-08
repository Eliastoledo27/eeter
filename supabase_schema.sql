-- 1. ENUMS Y EXTENSIONES
CREATE TYPE user_role AS ENUM ('admin', 'support', 'reseller', 'user');

-- 2. TABLA PROFILES (Core del sistema)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  role user_role DEFAULT 'user',
  reseller_slug text UNIQUE, -- Ej: 'juan-shoes'
  whatsapp_number text,
  commission_rate float DEFAULT 0.1, -- 10% de ganancia por defecto
  is_premium boolean DEFAULT false,
  points integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity timestamp with time zone DEFAULT now(),
  avatar_url text
);

-- 2B. TABLA AUXILIAR PARA ROLES (sin RLS - evita recursión)
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamp with time zone DEFAULT now()
);

-- Función para verificar si el usuario es admin/soporte (usa user_roles sin RLS)
CREATE OR REPLACE FUNCTION public.is_admin_or_support()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger para sincronizar roles automáticamente
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::text)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = EXCLUDED.role, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_role_on_profile_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();


-- 3. TABLA PRODUCTS
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  base_price float NOT NULL, -- Precio de costo/showroom
  images text[] DEFAULT '{}',
  stock_by_size jsonb DEFAULT '{}',
  is_active boolean DEFAULT true
);

-- 4. TABLA RESELLER_ORDERS (CRM Simple)
CREATE TABLE reseller_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id uuid REFERENCES profiles(id),
  customer_name text,
  customer_phone text,
  product_id uuid REFERENCES products(id),
  status text DEFAULT 'pending', -- pending, completed, cancelled
  created_at timestamp with time zone DEFAULT now(),
  sale_price float,
  profit float
);

-- 5. TABLA ACHIEVEMENTS
CREATE TABLE achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  icon_name text,
  points_required integer DEFAULT 100
);

-- 6. TABLA ACADEMY_CONTENT
CREATE TABLE academy_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text CHECK (type IN ('video', 'pdf', 'audio')),
  url text NOT NULL,
  description text,
  is_vip boolean DEFAULT false,
  thumbnail_url text
);

-- 7. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseller_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_content ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: user_roles NO debe tener RLS para evitar recursión
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Profiles: User can read own, Admin can read all, Users can update own, Admin can update all
CREATE POLICY "profiles_read_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_read_all" ON profiles FOR SELECT USING (public.is_admin_or_support());
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (public.is_admin_or_support());

-- Products: Public read
CREATE POLICY "Public products visible" ON products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON products FOR ALL USING (public.is_admin_or_support());

-- Reseller Orders: Reseller sees own, Admin sees all
CREATE POLICY "Resellers see own orders" ON reseller_orders FOR SELECT USING (auth.uid() = reseller_id);
CREATE POLICY "Resellers create orders" ON reseller_orders FOR INSERT WITH CHECK (auth.uid() = reseller_id);
CREATE POLICY "Admins see all orders" ON reseller_orders FOR SELECT USING (public.is_admin_or_support());



-- Academy: Public read for free content, VIP for Premium only
CREATE POLICY "Public academy visible" ON academy_content FOR SELECT USING (
  is_vip = false OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.is_premium = true
  ))
);

-- 8. TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
