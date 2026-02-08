-- ========================================================================
-- FIX PRODUCT UPLOAD PERMISSIONS (STORAGE & DB)
-- ========================================================================
-- Fecha: 2026-02-10
-- Descripción: 
-- 1. Asegura que el bucket 'products' exista en Storage.
-- 2. Configura políticas RLS para Storage (Imágenes de productos).
-- 3. Actualiza políticas de la tabla 'productos' para usar la función optimizada
--    'is_admin_or_support()' (basada en user_roles) y evitar recursión.
-- ========================================================================

-- ------------------------------------------------------------------------
-- 1. STORAGE: Configuración del Bucket 'products'
-- ------------------------------------------------------------------------

-- Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Habilitar RLS en objetos (por si acaso)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas del bucket products para limpiar
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me access" ON storage.objects; -- Política común de prueba

-- Crear nuevas políticas seguras
-- LECTURA: Pública para todos
CREATE POLICY "Public Access Products" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'products' );

-- ESCRITURA: Solo Admins y Soporte (usando user_roles)
CREATE POLICY "Admin Insert Products" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'products' 
  AND (public.is_admin_or_support() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Update Products" 
ON storage.objects FOR UPDATE 
USING ( 
  bucket_id = 'products' 
  AND (public.is_admin_or_support() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Delete Products" 
ON storage.objects FOR DELETE 
USING ( 
  bucket_id = 'products' 
  AND (public.is_admin_or_support() OR auth.role() = 'service_role')
);

-- ------------------------------------------------------------------------
-- 2. DATABASE: Actualización de Políticas en 'productos'
-- ------------------------------------------------------------------------

-- Eliminar políticas anteriores que dependían de 'profiles' (riesgo de recursión)
DROP POLICY IF EXISTS "Admins can insert products" ON public.productos;
DROP POLICY IF EXISTS "Admins can update products" ON public.productos;
DROP POLICY IF EXISTS "Admins can delete products" ON public.productos;

-- Crear nuevas políticas usando 'is_admin_or_support()' (user_roles)
CREATE POLICY "Admins can insert products" 
ON public.productos FOR INSERT 
WITH CHECK ( public.is_admin_or_support() );

CREATE POLICY "Admins can update products" 
ON public.productos FOR UPDATE 
USING ( public.is_admin_or_support() )
WITH CHECK ( public.is_admin_or_support() );

CREATE POLICY "Admins can delete products" 
ON public.productos FOR DELETE 
USING ( public.is_admin_or_support() );

-- Asegurar lectura pública (ya debería existir, pero reforzamos)
DROP POLICY IF EXISTS "Public view of catalog" ON public.productos;
CREATE POLICY "Public view of catalog" 
ON public.productos FOR SELECT 
USING (true);
