# 🔧 Guía de Instalación: Corrección de Permisos y RLS

## 📋 Resumen

Esta guía te ayudará a ejecutar la migración SQL que soluciona completamente los problemas de permisos insuficientes en la aplicación ÉTER Store.

**Problemas que soluciona**:
- ❌ Error "Permisos Insuficientes" en el dashboard
- ❌ Falta de políticas INSERT y DELETE en `profiles`
- ❌ Recursión infinita en políticas RLS  
- ❌ Políticas no optimizadas para `messages`
- ❌ Mensajes que no se cargan correctamente

## 🚀 Pasos de Instalación

### 1. Acceder a Supabase

1. Abre tu navegador y ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **Eter Store** (`tolzrvsykzmvndvomllt`)

### 2. Ejecutar la Migración SQL

1. En el panel izquierdo, haz click en **SQL Editor**
2. Haz click en **New Query** para crear una nueva consulta
3. Abre el archivo: `supabase/migrations/20260208_comprehensive_rls_fix.sql`
4. **Copia TODO el contenido del archivo**
5. **Pega el contenido** en el editor SQL de Supabase
6. Haz click en el botón **Run** (Ejecutar)
7. **Espera** a que se complete la ejecución (debería tomar 2-5 segundos)

✅ **Resultado esperado**: Deberías ver el mensaje "Success. No rows returned"

### 3. Verificar la Instalación

1. En el SQL Editor, crea una **nueva consulta**
2. Abre el archivo: `supabase/migrations/verify-permissions.sql`
3. **Copia TODO el contenido**
4. **Pega** en el editor y haz click en **Run**
5. Revisa los resultados

✅ **Todos los checks deben mostrar**: ✅ PASS o ✅ EXISTS

### 4. Verificaciones Críticas

Ejecuta estas queries individualmente para verificar:

**a) Verificar políticas de profiles**:
```sql
SELECT policyname, cmd::text as operation
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
```

**Deberías ver 7 políticas**:
- ✅ profiles_delete_admin (DELETE)
- ✅ profiles_insert_admin (INSERT)
- ✅ profiles_insert_own (INSERT)
- ✅ profiles_select_admin (SELECT)
- ✅ profiles_select_own (SELECT)
- ✅ profiles_update_admin (UPDATE)
- ✅ profiles_update_own (UPDATE)

**b) Verificar políticas de messages**:
```sql
SELECT policyname, cmd::text as operation
FROM pg_policies 
WHERE tablename = 'messages'
ORDER BY cmd, policyname;
```

**Deberías ver 6 políticas**:
- ✅ messages_delete_admin (DELETE)
- ✅ messages_insert_authenticated (INSERT)
- ✅ messages_select_admin (SELECT)
- ✅ messages_select_own (SELECT)
- ✅ messages_update_admin (UPDATE)
- ✅ messages_update_own (UPDATE)

**c) Verificar tabla user_roles**:
```sql
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('profiles', 'messages', 'user_roles')
AND schemaname = 'public';
```

**Resultado esperado**:
- profiles: `rls_enabled = true` ✅
- messages: `rls_enabled = true` ✅  
- user_roles: `rls_enabled = false` ✅ (¡Muy importante! No debe tener RLS)

## 🧪 Pruebas en la Aplicación

Después de ejecutar la migración, verifica que todo funciona:

### 1. Probar Login de Admin

```bash
# En la terminal, asegúrate de estar en el directorio del proyecto
cd "c:\Users\Tole\Desktop\Pegada Solo\eter-store"

# Iniciar el servidor de desarrollo
npm run dev
```

1. Abre http://localhost:3000/login
2. Inicia sesión con: `feitopepe510@gmail.com`
3. Deberías ver un indicador "Rol: admin" en algún lugar del dashboard

### 2. Probar Vista de Mensajes

1. Ve a: http://localhost:3000/dashboard?view=messages
2. **✅ Verificar**: NO debe aparecer "Permisos Insuficientes"
3. **✅ Verificar**: Debe cargar la lista de conversaciones/usuarios
4. **✅ Verificar**: El botón "Enviar a todos" debe estar visible

### 3. Probar Vista de Usuarios

1. Ve a: http://localhost:3000/dashboard?view=users
2. **✅ Verificar**: Debe mostrar la lista de todos los usuarios
3. **✅ Verificar**: Debe poder seleccionar y editar usuarios
4. **✅ Verificar**: NO debe haber errores en la consola del navegador

### 4. Verificar Consola del Navegador

- Presiona F12 para abrir DevTools
- Ve a la pestaña "Console"
- **✅ Verificar**: NO debe haber errores relacionados con permisos o RLS

## ⚠️ Troubleshooting

### Problema: "infinite recursion detected"

**Solución**:
1. Verifica que la tabla `user_roles` NO tenga RLS habilitado
2. Ejecuta:
```sql
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

### Problema: "Permisos Insuficientes" sigue apareciendo  

**Solución**: Sincronizar roles manualmente
```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::text FROM public.profiles
ON CONFLICT (user_id) 
DO UPDATE SET role = EXCLUDED.role;
```

### Problema: Las políticas no se crearon

**Solución**:
1. Elimina todas las políticas antiguas manualmente desde Supabase Dashboard > Authentication > Policies
2. Vuelve a ejecutar el script de migración

### Problema: Usuario admin no tiene permisos

**Solución**: Actualizar rol manualmente
```sql
-- Verificar rol actual
SELECT id, email, role FROM profiles WHERE email = 'feitopepe510@gmail.com';

-- Si NO es 'admin', actualizar
UPDATE profiles 
SET role = 'admin'
WHERE email = 'feitopepe510@gmail.com';

-- Sincronizar con user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM profiles WHERE email = 'feitopepe510@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## 📊 Verificación Final

Ejecuta este checklist completo:

- [ ] ✅ Migración SQL ejecutada sin errores
- [ ] ✅ Script de verificación muestra todos los PASS
- [ ] ✅ 7 políticas en tabla `profiles`
- [ ] ✅ 6 políticas en tabla `messages`
- [ ] ✅ Tabla `user_roles` existe y NO tiene RLS
- [ ] ✅ Funciones `can_manage_profiles()` e `is_admin_or_support()` existen
- [ ] ✅ Login con admin funciona
- [ ] ✅ Vista de mensajes carga sin error
- [ ] ✅ Vista de usuarios muestra la lista
- [ ] ✅ NO hay errores en consola del navegador
- [ ] ✅ Botón "Enviar a todos" funciona

## 🎯 Siguiente Paso

Una vez que todos los checks estén ✅, la aplicación debería funcionar perfectamente.

Si encuentras algún problema, revisa la sección de Troubleshooting arriba o consulta los archivos:
- `RLS-FIX-GUIDE.md` - Guía detallada de resolución de problemas RLS
- `PERMISSIONS-GUIDE.md` - Guía del sistema de permisos (si existe)

---

**¿Necesitas ayuda?** Revisa los logs del navegador y de la consola de Supabase para obtener mensajes de error específicos.
