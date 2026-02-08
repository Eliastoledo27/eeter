-- =====================================================
-- SCRIPT DE VERIFICACIÓN: RLS Fix
-- Ejecutar después de aplicar 20260207_fix_profiles_rls.sql
-- =====================================================

-- 1. Verificar que user_roles existe y no tiene RLS
SELECT 
  'user_roles table exists' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles' AND schemaname = 'public')
    THEN '✅ PASS'
    ELSE '❌ FAIL - table does not exist'
  END as result;

SELECT 
  'user_roles RLS is disabled' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'user_roles' 
      AND schemaname = 'public' 
      AND rowsecurity = false
    )
    THEN '✅ PASS'
    ELSE '❌ FAIL - RLS should be disabled'
  END as result;

-- 2. Verificar que la función existe
SELECT 
  'is_admin_or_support() function exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin_or_support'
    )
    THEN '✅ PASS'
    ELSE '❌ FAIL - function does not exist'
  END as result;

-- 3. Verificar que el trigger existe
SELECT 
  'sync_role_on_profile_change trigger exists' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'sync_role_on_profile_change'
    )
    THEN '✅ PASS'
    ELSE '❌ FAIL - trigger does not exist'
  END as result;

-- 4. Verificar políticas correctas en profiles
SELECT 
  'profiles has correct policies' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE tablename = 'profiles' 
      AND policyname IN (
        'profiles_read_own',
        'profiles_admin_read_all',
        'profiles_update_own',
        'profiles_admin_update'
      )
    ) = 4
    THEN '✅ PASS'
    ELSE '❌ FAIL - expected 4 policies'
  END as result;

-- 5. Verificar que NO existen políticas viejas
SELECT 
  'old policies removed' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE tablename = 'profiles' 
      AND policyname IN (
        'Public profiles visible',
        'Users update own profile',
        'Admins manage all profiles'
      )
    ) = 0
    THEN '✅ PASS'
    ELSE '❌ FAIL - old policies still exist'
  END as result;

-- 6. Verificar sincronización de datos
SELECT 
  'profiles and user_roles are synced' as check_name,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM profiles p
      LEFT JOIN user_roles ur ON p.id = ur.user_id
      WHERE p.role::text != ur.role OR ur.role IS NULL
    ) = 0
    THEN '✅ PASS'
    ELSE '❌ FAIL - some profiles not synced'
  END as result;

-- 7. Mostrar resumen de roles
SELECT 
  '--- ROLES SUMMARY ---' as info,
  '' as value
UNION ALL
SELECT 
  role::text as info,
  COUNT(*)::text || ' users' as value
FROM user_roles
GROUP BY role
ORDER BY info;

-- 8. Listar todas las políticas activas en profiles
SELECT 
  '--- ACTIVE POLICIES ---' as policyname,
  '' as cmd,
  '' as qual
UNION ALL
SELECT 
  policyname,
  cmd::text,
  SUBSTRING(qual::text, 1, 50) as qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 9. Verificar que la función usa user_roles
SELECT 
  'is_admin_or_support uses user_roles' as check_name,
  CASE 
    WHEN (
      SELECT prosrc FROM pg_proc 
      WHERE proname = 'is_admin_or_support'
    ) LIKE '%user_roles%'
    THEN '✅ PASS'
    ELSE '❌ FAIL - function does not reference user_roles'
  END as result;

-- 10. Verificar que profiles tiene RLS habilitado
SELECT 
  'profiles RLS is enabled' as check_name,
  CASE 
    WHEN (
      SELECT rowsecurity FROM pg_tables 
      WHERE tablename = 'profiles' AND schemaname = 'public'
    )
    THEN '✅ PASS'
    ELSE '❌ FAIL - RLS should be enabled on profiles'
  END as result;

-- RESULTADO FINAL
SELECT 
  '=====================================' as final_message
UNION ALL
SELECT 
  'VERIFICATION COMPLETE' as final_message
UNION ALL
SELECT 
  '=====================================' as final_message
UNION ALL
SELECT 
  'If all checks show ✅ PASS, the migration was successful!' as final_message;
