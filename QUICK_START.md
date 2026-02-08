# 🚀 QUICK START: Aplicar Fix RLS

## ⚡ Aplicación Rápida (2 minutos)

### Paso 1: Ir a Supabase Dashboard
Abre: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql`

### Paso 2: Copiar y Pegar
Copia TODO el contenido del archivo:
```
eter-store/supabase/migrations/20260207_fix_profiles_rls.sql
```

### Paso 3: Ejecutar
Haz clic en "Run" ▶️

### Paso 4: Verificar
Ejecuta este query para verificar:
```sql
SELECT 
  'user_roles exists' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_roles')
    THEN '✅ SUCCESS'
    ELSE '❌ FAILED'
  END as result;
```

### Paso 5: Probar
```sql
-- Esto ya NO debe dar error de recursión
SELECT * FROM profiles LIMIT 5;
```

## ✅ ¿Funcionó?
Si ves perfiles sin error "infinite recursion", ¡listo!

## ❌ ¿Problemas?
Lee: [`MIGRATION_GUIDE.md`](MIGRATION_GUIDE.md)

---

**Tiempo estimado**: 2-3 minutos  
**Dificultad**: ⭐ Fácil
