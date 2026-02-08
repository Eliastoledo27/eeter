-- ========================================================================
-- RESTRICT CATALOG ACCESS TO ADMINS ONLY
-- ========================================================================
-- Fecha: 2026-02-09
-- Descripción: Restringe la edición del catálogo (tabla productos) 
--              exclusivamente a administradores.
--              Permite lectura pública (o autenticada).
-- ========================================================================

-- 1. Habilitar RLS en la tabla productos (por seguridad)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas permisivas anteriores
-- (Nombres basados en migraciones previas como 20250204_fix_permissions.sql)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.productos;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.productos;
DROP POLICY IF EXISTS "Enable update for all users" ON public.productos;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.productos;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.productos;
DROP POLICY IF EXISTS "Admins have full access to products" ON public.productos;

-- 3. Crear política de LECTURA (Ver catálogo)
-- Permitimos que cualquiera vea los productos (público)
-- Si se requiere restringir a solo usuarios logueados, cambiar a: auth.role() = 'authenticated'
CREATE POLICY "Public view of catalog" 
ON public.productos FOR SELECT 
USING (true);

-- 4. Crear políticas de EDICIÓN (Solo Admins)
-- Se verifica contra la tabla profiles.
-- NOTA: Esto asume que el usuario tiene permiso para leer su propio rol en profiles.

CREATE POLICY "Admins can insert products" 
ON public.productos FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update products" 
ON public.productos FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete products" 
ON public.productos FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
