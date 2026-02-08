# Migraciones de Supabase - Éter Store

## Orden de Aplicación

Las migraciones se aplican en orden cronológico según su timestamp:

1. `20240203_init_schema.sql` - Schema inicial (legacy)
2. `20240204_audit_logs.sql` - Sistema de auditoría (legacy)
3. `20250202_init_schema.sql` - Re-inicialización del schema
4. `20250204_fix_permissions.sql` - Arreglo de permisos para productos
5. `20260204_create_notifications.sql` - Sistema de notificaciones
6. `20260205_academy_gamification.sql` - Academia y gamificación
7. `20260205_create_profiles_system.sql` - Sistema de perfiles con roles
8. `20260206_create_messages_table.sql` - Tabla de mensajes
9. `20260206_update_messages_table.sql` - Actualización de mensajes
10. **`20260207_fix_profiles_rls.sql`** - ⚠️ **FIX CRÍTICO: Recursión RLS**

## Migración Más Reciente: Fix RLS Recursion

### Problema
Error: `infinite recursion detected in policy for relation "profiles"`

### Solución
Crea una tabla auxiliar `user_roles` sin RLS para romper el ciclo de recursión.

### Aplicar

```bash
# Desde el directorio eter-store/
npx supabase db push
```

O ejecuta manualmente el SQL en Supabase Dashboard.

Consulta [`../MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md) para detalles completos.

## Estado Actual del Schema

### Tablas Principales
- `profiles` - Perfiles de usuario con roles (CON RLS)
- `user_roles` - Tabla auxiliar de roles (SIN RLS) ⭐ NUEVO
- `products` - Catálogo de productos
- `reseller_orders` - Órdenes de revendedores
- `academy_courses` - Cursos de la academia
- `academy_modules` - Módulos de cursos
- `academy_content` - Contenido (lecciones)
- `academy_progress` - Progreso de usuarios
- `gamification_levels` - Niveles de gamificación
- `messages` - Sistema de mensajería
- `notifications` - Notificaciones

### Funciones Importantes
- `is_admin_or_support()` - Verifica roles de admin/support (usa `user_roles`)
- `handle_new_user()` - Crea perfil al registrarse
- `sync_user_role()` - Sincroniza roles entre `profiles` y `user_roles`

## Desarrollo Local

### Setup
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Aplicar migraciones
supabase db push
```

### Crear Nueva Migración
```bash
supabase migration new nombre_descriptivo
```

### Reset Local (CUIDADO)
```bash
supabase db reset
```

## Troubleshooting

### Error: "infinite recursion detected"
- Verifica que `user_roles` NO tenga RLS habilitado
- Ejecuta `20260207_fix_profiles_rls.sql`
- Verifica que las políticas usan `is_admin_or_support()` en lugar de queries directas

### Error: "relation user_roles does not exist"
- Ejecuta la migración `20260207_fix_profiles_rls.sql`

### Políticas no funcionan
```sql
-- Verificar políticas activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'products', 'reseller_orders');
```

## Recursos

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- Guía del proyecto: [`../MIGRATION_GUIDE.md`](../MIGRATION_GUIDE.md)
