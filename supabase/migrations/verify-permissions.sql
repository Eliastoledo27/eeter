-- =====================================================
-- SCRIPT DE VERIFICACIÓN: Comprehensive RLS Fix
-- Ejecutar después de aplicar 20260208_comprehensive_rls_fix.sql
-- =====================================================

\echo '========================================='
\echo 'VERIFICACIÓN DE POLÍTICAS RLS'
\echo '========================================='
\echo ''

-- 1. Verificar que user_roles existe y NO tiene RLS
\echo '1. Verificando tabla user_roles...'
SELECT 
  'user_roles table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles' AND schemaname = 'public')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as table_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'user_roles' 
      AND schemaname = 'public' 
      AND rowsecurity = false
    )
    THEN '✅ RLS DISABLED (correcto)'
    ELSE '❌ RLS ENABLED (incorrecto)'
  END as rls_status;

\echo ''
\echo '2. Verificando funciones helper...'

-- 2. Verificar funciones
SELECT 
  routine_name as function_name,
  '✅ EXISTS' as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('can_manage_profiles', 'is_admin_or_support', 'sync_user_role')
ORDER BY routine_name;

\echo ''
\echo '3. Verificando políticas de PROFILES...'

-- 3. Verificar políticas de profiles
SELECT 
  policyname,
  cmd::text as operation,
  '✅ ACTIVE' as status
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Contar políticas esperadas
SELECT 
  'Políticas de profiles' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 7 THEN '✅ COMPLETO (7 políticas)'
    ELSE '❌ INCOMPLETO (faltan políticas)'
  END as status
FROM pg_policies 
WHERE tablename = 'profiles';

\echo ''
\echo '4. Verificando políticas de MESSAGES...'

-- 4. Verificar políticas de messages
SELECT 
  policyname,
  cmd::text as operation,
  '✅ ACTIVE' as status
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;

-- Contar políticas esperadas
SELECT 
  'Políticas de messages' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ COMPLETO (6 políticas)'
    ELSE '❌ INCOMPLETO (faltan políticas)'
  END as status
FROM pg_policies 
WHERE tablename = 'messages';

\echo ''
\echo '5. Verificando sincronización de roles...'

-- 5. Verificar sincronización entre profiles y user_roles
SELECT 
  'Sincronización de roles' as check_name,
  COUNT(*) as desincronizados,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ TODOS SINCRONIZADOS'
    ELSE '❌ HAY DESINCRONIZACIÓN'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE p.role::text != ur.role OR ur.role IS NULL;

-- Mostrar detalles de desincronización (si hay)
\echo ''
\echo 'Detalles de sincronización:'
SELECT 
  p.id,
  p.email,
  p.role::text as profile_role,
  COALESCE(ur.role, 'NULL') as user_roles_role,
  CASE 
    WHEN p.role::text = ur.role THEN '✅'
    WHEN ur.role IS NULL THEN '⚠️ FALTA EN user_roles'
    ELSE '❌ DESINCRONIZADO'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY 
  CASE 
    WHEN p.role::text = ur.role THEN 2
    WHEN ur.role IS NULL THEN 0
    ELSE 1
  END,
  p.email
LIMIT 20;

\echo ''
\echo '6. Resumen de roles...'

-- 6. Resumen de roles
SELECT 
  role,
  COUNT(*) as usuarios,
  '👥' as icon
FROM user_roles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'support' THEN 2
    WHEN 'reseller' THEN 3
    WHEN 'user' THEN 4
    ELSE 5
  END;

\echo ''
\echo '7. Verificando RLS activo en tablas principales...'

-- 7. Verificar RLS en tablas
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status,
  CASE tablename
    WHEN 'profiles' THEN 'debe estar ENABLED'
    WHEN 'messages' THEN 'debe estar ENABLED'
    WHEN 'user_roles' THEN 'debe estar DISABLED'
  END as expected
FROM pg_tables
WHERE tablename IN ('profiles', 'messages', 'user_roles')
AND schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo '8. Verificando triggers...'

-- 8. Verificar triggers
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  '✅ ACTIVE' as status
FROM pg_trigger
WHERE tgname = 'sync_role_on_profile_change';

\echo ''
\echo '========================================='
\echo 'VERIFICACIÓN COMPLETADA'
\echo '========================================='
\echo ''
\echo 'Si todos los checks muestran ✅, la migración fue exitosa!'
\echo ''

-- Query adicional: Verificar que no hay políticas viejas
SELECT 
  'Políticas obsoletas' as check_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NO HAY POLÍTICAS ANTIGUAS'
    ELSE '⚠️ HAY POLÍTICAS QUE DEBEN ELIMINARSE'
  END as status
FROM pg_policies 
WHERE tablename IN ('profiles', 'messages')
AND policyname IN (
  'Public profiles visible',
  'Users update own profile',
  'Admins manage all profiles'
);

-- Si hay desincronización, mostrar query para arreglarlo
DO $$
DECLARE
  desync_count integer;
BEGIN
  SELECT COUNT(*) INTO desync_count
  FROM profiles p
  LEFT JOIN user_roles ur ON p.id = ur.user_id
  WHERE p.role::text != ur.role OR ur.role IS NULL;
  
  IF desync_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ ACCIÓN REQUERIDA: Hay % perfiles desincronizados', desync_count;
    RAISE NOTICE 'Ejecutar para sincronizar:';
    RAISE NOTICE '';
    RAISE NOTICE 'INSERT INTO public.user_roles (user_id, role)';
    RAISE NOTICE 'SELECT id, role::text FROM public.profiles';
    RAISE NOTICE 'ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;';
    RAISE NOTICE '';
  END IF;
END $$;
