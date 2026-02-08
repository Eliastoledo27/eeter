# 🔧 Guía de Reparación: RLS Recursion Fix

## ⚠️ Problema
Las políticas RLS de la tabla `profiles` causan error de recursión infinita cuando intentan verificar el rol del usuario consultando la misma tabla `profiles`.

**Error:**
```
Error al obtener perfiles: infinite recursion detected in policy for relation "profiles"
```

## ✅ Solución

### Paso 1: Ejecutar el script SQL en Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `fix-rls-policies.sql`
4. Ejecuta el script completo
5. Verifica que se ejecute sin errores

### Paso 2: Verificar las políticas creadas

Ejecuta esta query para verificar que las políticas se crearon correctamente:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  cmd 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Deberías ver:
- `profiles_select_policy`
- `profiles_update_policy`
- `profiles_insert_policy`
- `profiles_delete_policy`

### Paso 3: Verificar la función helper

```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin_by_email';
```

Deberías ver la función `is_admin_by_email`.

### Paso 4: Probar en la aplicación

1. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Accede a http://localhost:3000/login

3. Inicia sesión con `feitopepe510@gmail.com`

4. Ve a http://localhost:3000/dashboard?view=messages

5. Verifica que:
   - Se muestre "Rol: admin" en el indicador
   - Se cargue la lista de usuarios en el inbox
   - El botón "Enviar a todos" funcione correctamente

6. Prueba también: http://localhost:3000/dashboard?view=users

### Paso 5: Eliminar allowlists temporales (Opcional)

Una vez confirmado que todo funciona, puedes eliminar los allowlists hardcodeados:

**En `src/app/actions/profiles.ts` (líneas 45-58):**
```typescript
// ELIMINAR ESTO:
const adminEmailAllowlist = new Set(['feitopepe510@gmail.com']);

// Check if user is admin
const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

if (!userProfile || !['admin', 'support'].includes(userProfile.role)) {
    if (!adminEmailAllowlist.has((user.email || '').toLowerCase())) {
        return { data: null, error: 'Permisos insuficientes' };
    }
}

// REEMPLAZAR CON:
// Check if user is admin
const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

if (!userProfile || !['admin', 'support'].includes(userProfile.role)) {
    return { data: null, error: 'Permisos insuficientes' };
}
```

**En `src/app/actions/messages.ts` (sendAdminMessage y sendAdminMessageToAll):**
Eliminar las líneas que contienen `adminEmailAllowlist`.

## 🎯 Cómo Funciona la Solución

### Problema Original
```sql
-- ❌ MALO: Esto causa recursión infinita
create policy "admin_can_read"
on profiles for select
using (
  exists (
    select 1 from profiles p  -- ← Consulta a sí misma = RECURSIÓN
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);
```

### Solución Implementada
```sql
-- ✅ BUENO: Usa JWT claims, no consulta profiles
create function is_admin_by_email()
returns boolean as $$
begin
  return (
    current_setting('request.jwt.claims', true)::json->>'email'
    = 'feitopepe510@gmail.com'
  );
end;
$$ language plpgsql stable security definer;

create policy "profiles_select_policy"
on profiles for select
using (
  auth.uid() = id  -- Usuario puede ver su propio perfil
  OR
  is_admin_by_email()  -- Admin puede ver todos (sin consultar profiles)
);
```

## 🔄 Solución Alternativa (Más Escalable)

Si en el futuro necesitas múltiples administradores, el script incluye una solución alternativa comentada que:

1. Almacena el rol en `auth.users.raw_user_meta_data`
2. Usa un trigger para sincronizar automáticamente
3. Lee el rol desde JWT metadata en lugar del email hardcodeado

Para activarla:
1. Descomenta la sección "ALTERNATIVE SOLUTION" en `fix-rls-policies.sql`
2. Comenta la sección anterior
3. Ejecuta el script actualizado
4. Ejecuta: `UPDATE profiles SET role = 'admin' WHERE email = 'feitopepe510@gmail.com';`

## 📝 Notas Importantes

- El email `feitopepe510@gmail.com` está hardcodeado en la función `is_admin_by_email()`
- Para agregar más admins, actualiza la función o usa la solución alternativa
- Las políticas ahora usan `SECURITY DEFINER` para evitar problemas de permisos
- RLS está habilitado en la tabla `profiles`

## 🐛 Troubleshooting

### Error: "permission denied for function is_admin_by_email"
**Solución:** Ejecuta:
```sql
GRANT EXECUTE ON FUNCTION is_admin_by_email() TO authenticated, anon;
```

### Error: "could not open relation with OID"
**Solución:** Verifica que RLS esté habilitado:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Los usuarios no se cargan en el inbox
**Solución:** 
1. Verifica que las políticas estén activas
2. Revisa la consola del navegador para ver errores específicos
3. Ejecuta las queries de verificación del Paso 2

### El rol no se muestra correctamente
**Solución:**
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que el perfil tenga `role = 'admin'` en la tabla profiles:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'feitopepe510@gmail.com';
   ```

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado sin errores
- [ ] 4 políticas creadas en `profiles`
- [ ] Función `is_admin_by_email()` existe
- [ ] Login exitoso con admin
- [ ] Vista `?view=messages` carga usuarios
- [ ] Vista `?view=users` funciona
- [ ] Botón "Enviar a todos" funciona
- [ ] Se muestra "Rol: admin" en el indicador
- [ ] (Opcional) Allowlists eliminados de código

## 🎉 Resultado Esperado

Después de aplicar el fix:
- ✅ No más errores de recursión
- ✅ Vista de mensajes carga lista de usuarios
- ✅ Vista de usuarios funciona correctamente
- ✅ Envío masivo de mensajes funcional
- ✅ Dashboard muestra datos reales sin errores
- ✅ Políticas RLS funcionan correctamente

---

**Última actualización:** {{ current_date }}  
**Autor:** OpenCode AI  
**Versión:** 1.0
