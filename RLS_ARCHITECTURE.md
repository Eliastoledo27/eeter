# 🔧 Solución RLS: Diagrama de Arquitectura

## Problema Original (Recursión Infinita)

```
Usuario solicita ver perfiles
    ↓
RLS Policy: "profiles_admin_read_all" 
    ↓
Ejecuta: EXISTS (SELECT 1 FROM profiles WHERE role IN ('admin'))
    ↓
Nueva consulta a 'profiles' activa RLS nuevamente
    ↓
RLS Policy: "profiles_admin_read_all" (otra vez)
    ↓
🔄 RECURSIÓN INFINITA 💥
```

## Solución Implementada (Tabla Auxiliar)

```
Usuario solicita ver perfiles
    ↓
RLS Policy: "profiles_admin_read_all"
    ↓
Llama a función: is_admin_or_support()
    ↓
Consulta tabla: user_roles (SIN RLS ✓)
    ↓
Retorna: true/false
    ↓
✅ ACCESO PERMITIDO O DENEGADO
```

## Arquitectura de Tablas

```
┌─────────────────────┐
│   auth.users        │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ FK: id
           │
     ┌─────┴─────┬──────────────────┐
     │           │                  │
     ▼           ▼                  ▼
┌─────────┐ ┌──────────┐  ┌────────────────┐
│profiles │ │user_roles│  │ Otras tablas   │
│(CON RLS)│ │(SIN RLS) │  │ (products,     │
│         │ │          │  │  orders, etc)  │
└────┬────┘ └─────┬────┘  └────────────────┘
     │            │
     │            │
     └─────┬──────┘
           │
    Trigger mantiene
      sincronizado
```

## Flujo de Sincronización

```
1. Usuario actualiza su rol en profiles
   UPDATE profiles SET role = 'admin' WHERE id = '...'
        ↓
2. Trigger detecta cambio
   sync_role_on_profile_change (AFTER UPDATE)
        ↓
3. Ejecuta función sync_user_role()
        ↓
4. Actualiza user_roles automáticamente
   INSERT INTO user_roles ... ON CONFLICT UPDATE
        ↓
5. ✅ Ambas tablas sincronizadas
```

## Políticas RLS Resultantes

### profiles (Tabla Principal)

| Política                  | Operación | Condición                        |
|---------------------------|-----------|----------------------------------|
| `profiles_read_own`       | SELECT    | `auth.uid() = id`                |
| `profiles_admin_read_all` | SELECT    | `is_admin_or_support()`          |
| `profiles_update_own`     | UPDATE    | `auth.uid() = id`                |
| `profiles_admin_update`   | UPDATE    | `is_admin_or_support()`          |

### user_roles (Tabla Auxiliar)

**NO tiene RLS habilitado** (crítico para evitar recursión)

## Verificación del Sistema

### 1. Verificar que user_roles existe
```sql
SELECT * FROM public.user_roles LIMIT 5;
```

### 2. Verificar sincronización
```sql
SELECT 
  p.id, 
  p.email, 
  p.role as profile_role, 
  ur.role as user_role_role,
  CASE 
    WHEN p.role::text = ur.role THEN '✅ Sync'
    ELSE '❌ Out of sync'
  END as status
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id;
```

### 3. Verificar función
```sql
-- Como usuario admin
SELECT public.is_admin_or_support(); -- Debería retornar true

-- Como usuario normal
SELECT public.is_admin_or_support(); -- Debería retornar false
```

### 4. Verificar políticas activas
```sql
SELECT 
  tablename, 
  policyname, 
  cmd,
  qual::text as condition
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

## Casos de Uso

### Caso 1: Nuevo Usuario se Registra
```
1. Supabase Auth crea usuario en auth.users
2. Trigger handle_new_user() crea registro en profiles
3. Trigger sync_user_role() crea registro en user_roles
4. ✅ Usuario tiene perfil completo y rol sincronizado
```

### Caso 2: Admin Actualiza Rol de Usuario
```
1. Admin ejecuta: UPDATE profiles SET role = 'reseller' WHERE id = '...'
2. Trigger sync_role_on_profile_change se activa
3. user_roles se actualiza automáticamente
4. ✅ Rol sincronizado en ambas tablas
```

### Caso 3: Usuario Intenta Ver Todos los Perfiles
```
1. Usuario ejecuta: SELECT * FROM profiles
2. RLS evalúa:
   - profiles_read_own: ¿Es su propio perfil? NO
   - profiles_admin_read_all: ¿is_admin_or_support()? NO
3. ❌ Acceso denegado (solo ve su propio perfil)
```

### Caso 4: Admin Intenta Ver Todos los Perfiles
```
1. Admin ejecuta: SELECT * FROM profiles
2. RLS evalúa:
   - profiles_admin_read_all: ¿is_admin_or_support()? 
     → Consulta user_roles (sin RLS)
     → Encuentra role = 'admin'
     → Retorna TRUE
3. ✅ Acceso permitido (ve todos los perfiles)
```

## Beneficios de esta Solución

✅ **Elimina recursión**: user_roles no tiene RLS
✅ **Performance**: Función es STABLE (cacheable)
✅ **Mantenimiento automático**: Trigger sincroniza roles
✅ **Escalable**: Mismo patrón para otras tablas
✅ **Seguro**: Solo permisos necesarios

## Aplicar en Otras Tablas

Si tienes el mismo problema en otras tablas, usa el mismo patrón:

```sql
-- En lugar de:
CREATE POLICY "admin_access" ON tabla FOR ALL 
USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Usa:
CREATE POLICY "admin_access" ON tabla FOR ALL 
USING (public.is_admin_or_support());
```

La función `is_admin_or_support()` ya está disponible para todas las tablas.
