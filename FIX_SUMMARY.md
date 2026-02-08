# 📋 RESUMEN: Fix RLS Recursion - Éter Store

## 🎯 Objetivo
Resolver el error `infinite recursion detected in policy for relation "profiles"` que impedía el acceso a los perfiles de usuario.

## 🔴 Problema
Las políticas RLS en la tabla `profiles` consultaban la misma tabla para verificar roles, creando un bucle infinito:

```sql
-- ❌ CAUSABA RECURSIÓN
CREATE POLICY "Admins manage all profiles" 
ON public.profiles FOR ALL 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'support'))
);
```

## ✅ Solución
Se creó una tabla auxiliar `user_roles` **sin RLS** que almacena roles y rompe el ciclo:

```sql
-- ✅ SIN RECURSIÓN
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'user'
);

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY; -- CRÍTICO

CREATE FUNCTION is_admin_or_support()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles  -- Consulta tabla SIN RLS
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

## 📦 Archivos Creados/Modificados

### Nuevos Archivos
1. **`supabase/migrations/20260207_fix_profiles_rls.sql`** ⭐
   - Migración principal que implementa la solución
   - Crea `user_roles`, función `is_admin_or_support()`, y trigger de sincronización
   - Aplica nuevas políticas RLS

2. **`supabase/migrations/verify_rls_fix.sql`**
   - Script de verificación con 10 checks automatizados
   - Ejecutar después de aplicar la migración

3. **`MIGRATION_GUIDE.md`**
   - Guía completa de la migración
   - Instrucciones de aplicación y rollback
   - Troubleshooting

4. **`RLS_ARCHITECTURE.md`**
   - Diagrama visual del flujo
   - Arquitectura de tablas
   - Casos de uso detallados

5. **`supabase/migrations/README.md`**
   - Documentación de todas las migraciones
   - Orden de aplicación
   - Troubleshooting

6. **`scripts/apply-rls-fix.ps1`**
   - Helper script para aplicar la migración
   - Muestra opciones de aplicación

### Archivos Modificados
1. **`supabase_schema.sql`**
   - Agregada tabla `user_roles`
   - Actualizada función `is_admin_or_support()`
   - Agregado trigger `sync_role_on_profile_change`
   - Actualizadas políticas RLS

2. **`supabase/migrations/20260205_academy_gamification.sql`**
   - Políticas de academy actualizadas para usar `is_admin_or_support()`

## 🏗️ Componentes de la Solución

### 1. Tabla `user_roles`
```sql
CREATE TABLE user_roles (
  user_id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'user',
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
```

### 2. Función `is_admin_or_support()`
```sql
CREATE FUNCTION is_admin_or_support()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

### 3. Trigger de Sincronización
```sql
CREATE FUNCTION sync_user_role()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::text)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = EXCLUDED.role, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER sync_role_on_profile_change
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role();
```

### 4. Nuevas Políticas RLS
```sql
-- Usuarios leen su propio perfil
CREATE POLICY "profiles_read_own" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins leen todos los perfiles
CREATE POLICY "profiles_admin_read_all" 
ON profiles FOR SELECT 
USING (is_admin_or_support());

-- Usuarios actualizan su propio perfil
CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admins actualizan cualquier perfil
CREATE POLICY "profiles_admin_update" 
ON profiles FOR UPDATE 
USING (is_admin_or_support());
```

## 🚀 Cómo Aplicar

### Opción 1: Supabase CLI (Recomendado)
```bash
cd eter-store
npx supabase db push
```

### Opción 2: Supabase Dashboard
1. Ve a SQL Editor: `https://supabase.com/dashboard/project/YOUR_PROJECT/sql`
2. Copia el contenido de `supabase/migrations/20260207_fix_profiles_rls.sql`
3. Ejecuta el script

### Opción 3: Script Helper
```bash
cd eter-store/scripts
./apply-rls-fix.ps1
```

## ✔️ Verificación

### Ejecutar Script de Verificación
```sql
-- En SQL Editor de Supabase
\i supabase/migrations/verify_rls_fix.sql
```

### Checks Esperados
- ✅ user_roles table exists
- ✅ user_roles RLS is disabled
- ✅ is_admin_or_support() function exists
- ✅ sync_role_on_profile_change trigger exists
- ✅ profiles has correct policies (4 policies)
- ✅ old policies removed
- ✅ profiles and user_roles are synced
- ✅ is_admin_or_support uses user_roles
- ✅ profiles RLS is enabled

### Test Manual
```sql
-- Como admin
SELECT * FROM profiles; -- ✅ Debe mostrar todos los perfiles

-- Como usuario normal
SELECT * FROM profiles; -- ✅ Debe mostrar solo su perfil
```

## 📊 Impacto

### Beneficios
✅ Elimina recursión infinita en RLS  
✅ Mejora performance (función STABLE)  
✅ Sincronización automática de roles  
✅ Patrón reutilizable para otras tablas  
✅ Mantiene seguridad RLS intacta  

### Cambios en Comportamiento
- **Antes**: Error "infinite recursion" al acceder a perfiles
- **Después**: Acceso normal según roles

### Performance
- Función `is_admin_or_support()` es **STABLE** = cacheable
- Consulta a tabla sin RLS = más rápido
- Trigger ligero = impacto mínimo en writes

## 🔄 Flujo de Trabajo Post-Migración

### Actualizar Rol de Usuario
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
-- El trigger actualiza user_roles automáticamente ✅
```

### Crear Nuevo Usuario
```sql
-- 1. Supabase Auth crea usuario en auth.users
-- 2. handle_new_user() crea registro en profiles
-- 3. sync_user_role() crea registro en user_roles
-- ✅ Todo automático
```

## 📚 Documentación Relacionada

- **MIGRATION_GUIDE.md** - Guía completa de migración
- **RLS_ARCHITECTURE.md** - Diagramas y arquitectura
- **supabase/migrations/README.md** - Índice de migraciones
- **verify_rls_fix.sql** - Script de verificación

## ⚠️ Notas Importantes

1. **NUNCA** habilites RLS en `user_roles` - causaría el mismo problema
2. El trigger mantiene sincronizados `profiles.role` y `user_roles.role` automáticamente
3. La función `is_admin_or_support()` está disponible para todas las tablas
4. Si necesitas rollback, consulta `MIGRATION_GUIDE.md`

## 🎓 Lecciones Aprendidas

### ❌ Anti-Pattern
```sql
-- NO HACER: Consulta recursiva en RLS
CREATE POLICY "admin_policy" ON tabla
USING (EXISTS (SELECT 1 FROM tabla WHERE ...));
```

### ✅ Best Practice
```sql
-- SÍ HACER: Usar tabla auxiliar sin RLS
CREATE TABLE helper_table (...);
ALTER TABLE helper_table DISABLE ROW LEVEL SECURITY;

CREATE FUNCTION check_permission()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM helper_table WHERE ...);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "admin_policy" ON tabla
USING (check_permission());
```

## 📞 Soporte

Si encuentras problemas:
1. Ejecuta `verify_rls_fix.sql` para diagnóstico
2. Revisa `MIGRATION_GUIDE.md` sección Troubleshooting
3. Verifica logs de Supabase Dashboard
4. Consulta `RLS_ARCHITECTURE.md` para entender el flujo

---

**Fecha de Implementación**: 2026-02-07  
**Versión**: 1.0  
**Estado**: ✅ Producción Ready
