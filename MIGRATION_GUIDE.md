# Guía de Migración: Fix RLS Recursion

## Problema

El error "infinite recursion detected in policy for relation 'profiles'" ocurre cuando las políticas RLS de la tabla `profiles` intentan consultar la misma tabla para verificar roles, creando un bucle infinito.

## Solución Implementada

Se creó una **tabla auxiliar** `user_roles` **sin RLS** que almacena los roles de usuario. Las políticas RLS ahora consultan esta tabla en lugar de `profiles`.

### Migración: `20260207_fix_profiles_rls.sql`

#### Componentes principales:

1. **Tabla `user_roles` (sin RLS)**
   ```sql
   create table public.user_roles (
     user_id uuid primary key,
     role text not null default 'user',
     updated_at timestamp with time zone default now()
   );
   ```

2. **Función optimizada**
   ```sql
   create or replace function public.is_admin_or_support()
   returns boolean as $$
   begin
     return exists (
       select 1 from public.user_roles
       where user_id = auth.uid()
       and role in ('admin', 'support')
     );
   end;
   $$ language plpgsql security definer stable;
   ```

3. **Trigger de sincronización**
   - Mantiene `user_roles` sincronizada con `profiles.role`
   - Se ejecuta en INSERT/UPDATE de `profiles`

4. **Nuevas políticas**
   - `profiles_read_own`: Los usuarios leen su propio perfil
   - `profiles_admin_read_all`: Los admins leen todos los perfiles
   - `profiles_update_own`: Los usuarios actualizan su perfil
   - `profiles_admin_update`: Los admins actualizan cualquier perfil

## Cómo Aplicar

### Opción 1: Supabase CLI (Recomendado)
```bash
cd eter-store
npx supabase db push
```

### Opción 2: Supabase Dashboard
1. Ve a SQL Editor en Supabase Dashboard
2. Copia el contenido de `supabase/migrations/20260207_fix_profiles_rls.sql`
3. Ejecuta el script

### Opción 3: Aplicar manualmente
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f supabase/migrations/20260207_fix_profiles_rls.sql
```

## Verificación

Después de aplicar la migración, verifica:

1. **Tabla creada**:
   ```sql
   SELECT * FROM public.user_roles LIMIT 5;
   ```

2. **Función disponible**:
   ```sql
   SELECT public.is_admin_or_support();
   ```

3. **Políticas activas**:
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```

Deberías ver:
- `profiles_read_own`
- `profiles_admin_read_all`
- `profiles_update_own`
- `profiles_admin_update`

## Mantenimiento

- Los roles se sincronizan automáticamente mediante el trigger
- Si necesitas actualizar un rol manualmente:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
  ```
  El trigger actualizará `user_roles` automáticamente.

## Rollback (si es necesario)

Si necesitas revertir esta migración:

```sql
-- Eliminar políticas nuevas
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;

-- Eliminar función y tabla
DROP FUNCTION IF EXISTS public.is_admin_or_support();
DROP TRIGGER IF EXISTS sync_role_on_profile_change ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_user_role();
DROP TABLE IF EXISTS public.user_roles;

-- Restaurar política simple (no recomendado - causa recursión)
-- CREATE POLICY "Public profiles visible" ON profiles FOR SELECT USING (true);
```

## Notas Importantes

- ⚠️ **NO** habilites RLS en `user_roles` - esto causaría el mismo problema
- ✅ La función `is_admin_or_support()` es `STABLE` para mejor performance
- ✅ El trigger mantiene sincronizados los roles automáticamente
- ✅ Esta solución funciona para otras tablas que necesitan verificar roles
