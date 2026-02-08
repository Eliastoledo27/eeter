-- ========================================================================
-- COMPREHENSIVE RLS FIX - ÉTER STORE
-- ========================================================================
-- Fecha: 2026-02-08
-- Descripción: Solución completa para problemas de permisos
--              - Elimina políticas conflictivas
--              - Agrega políticas INSERT y DELETE faltantes
--              - Optimiza políticas para messages
--              - Usa user_roles (sin RLS) para evitar recursión
-- ========================================================================

-- ========================================================================
-- PARTE 1: LIMPIEZA DE POLÍTICAS ANTIGUAS
-- ========================================================================

-- Eliminar todas las políticas antiguas de profiles
DROP POLICY IF EXISTS "profiles: user can read own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: admin can read all" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles visible" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "allow_read_self" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;

-- Eliminar políticas antiguas de messages (si existen)
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_select_admin" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_authenticated" ON public.messages;
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
DROP POLICY IF EXISTS "messages_update_admin" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_admin" ON public.messages;

-- ========================================================================
-- PARTE 2: VERIFICAR Y CREAR TABLA user_roles (sin RLS)
-- ========================================================================

-- Crear tabla auxiliar para roles si no existe
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamp with time zone DEFAULT now()
);

-- Asegurarse de que NO tiene RLS habilitado (crítico para evitar recursión)
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Sincronizar roles existentes desde profiles (idempotente)
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text FROM public.profiles
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = EXCLUDED.role, 
  updated_at = now();

-- ========================================================================
-- PARTE 3: FUNCIONES HELPER Y TRIGGERS
-- ========================================================================

-- Función para mantener sincronizado user_roles con profiles
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::text)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role, 
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar automáticamente
DROP TRIGGER IF EXISTS sync_role_on_profile_change ON public.profiles;
CREATE TRIGGER sync_role_on_profile_change
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role();

-- Función optimizada para verificar si el usuario tiene permisos de admin/support
CREATE OR REPLACE FUNCTION public.can_manage_profiles()
RETURNS BOOLEAN AS $$
BEGIN
  -- Consulta la tabla user_roles que NO tiene RLS (evita recursión)
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si el usuario es admin o support (alias)
CREATE OR REPLACE FUNCTION public.is_admin_or_support()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.can_manage_profiles();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ========================================================================
-- PARTE 4: POLÍTICAS RLS PARA PROFILES
-- ========================================================================

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Los usuarios pueden ver su propio perfil
CREATE POLICY "profiles_select_own"
ON public.profiles 
FOR SELECT
USING (auth.uid() = id);

-- SELECT: Los admins/support pueden ver todos los perfiles
CREATE POLICY "profiles_select_admin"
ON public.profiles 
FOR SELECT
USING (public.can_manage_profiles());

-- INSERT: Los usuarios pueden crear su propio perfil (durante signup)
CREATE POLICY "profiles_insert_own"
ON public.profiles 
FOR INSERT
WITH CHECK (auth.uid() = id);

-- INSERT: Los admins pueden crear perfiles para otros usuarios
CREATE POLICY "profiles_insert_admin"
ON public.profiles 
FOR INSERT
WITH CHECK (public.can_manage_profiles());

-- UPDATE: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_own"
ON public.profiles 
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- UPDATE: Los admins pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_admin"
ON public.profiles 
FOR UPDATE
USING (public.can_manage_profiles())
WITH CHECK (public.can_manage_profiles());

-- DELETE: Solo admins pueden eliminar perfiles
CREATE POLICY "profiles_delete_admin"
ON public.profiles 
FOR DELETE
USING (public.can_manage_profiles());

-- ========================================================================
-- PARTE 5: POLÍTICAS RLS PARA MESSAGES
-- ========================================================================

-- Asegurarse de que RLS está habilitado
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- SELECT: Los usuarios pueden ver mensajes donde son sender o receiver
CREATE POLICY "messages_select_own"
ON public.messages 
FOR SELECT
USING (
  auth.uid() = sender_id 
  OR 
  auth.uid() = receiver_id
);

-- SELECT: Los admins pueden ver todos los mensajes
CREATE POLICY "messages_select_admin"
ON public.messages 
FOR SELECT
USING (public.can_manage_profiles());

-- INSERT: Usuarios autenticados pueden enviar mensajes
CREATE POLICY "messages_insert_authenticated"
ON public.messages 
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Los usuarios pueden actualizar sus propios mensajes (marcar como leído)
CREATE POLICY "messages_update_own"
ON public.messages 
FOR UPDATE
USING (
  auth.uid() = sender_id 
  OR 
  auth.uid() = receiver_id
)
WITH CHECK (
  auth.uid() = sender_id 
  OR 
  auth.uid() = receiver_id
);

-- UPDATE: Los admins pueden actualizar cualquier mensaje
CREATE POLICY "messages_update_admin"
ON public.messages 
FOR UPDATE
USING (public.can_manage_profiles())
WITH CHECK (public.can_manage_profiles());

-- DELETE: Solo admins pueden eliminar mensajes
CREATE POLICY "messages_delete_admin"
ON public.messages 
FOR DELETE
USING (public.can_manage_profiles());

-- ========================================================================
-- PARTE 6: PERMISOS DE TABLAS
-- ========================================================================

-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated, anon;

-- ========================================================================
-- PARTE 7: COMENTARIOS Y DOCUMENTACIÓN
-- ========================================================================

COMMENT ON TABLE public.user_roles IS 'Tabla auxiliar sin RLS para almacenar roles de usuario y evitar recursión en políticas RLS de profiles';
COMMENT ON FUNCTION public.can_manage_profiles() IS 'Verifica si el usuario actual tiene permisos de admin o support consultando user_roles (sin RLS)';
COMMENT ON FUNCTION public.sync_user_role() IS 'Mantiene sincronizada la tabla user_roles con los cambios en profiles.role';

-- ========================================================================
-- FIN DEL SCRIPT
-- ========================================================================

-- Ejecutar las siguientes queries para verificar que todo funciona:
/*
-- 1. Verificar políticas de profiles
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Verificar políticas de messages
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY policyname;

-- 3. Verificar sincronización de roles
SELECT 
  p.id,
  p.email,
  p.role as profile_role,
  ur.role as user_roles_role,
  CASE 
    WHEN p.role::text = ur.role THEN '✅ Synced'
    ELSE '❌ Out of sync'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;

-- 4. Verificar que user_roles NO tiene RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_roles';
*/
