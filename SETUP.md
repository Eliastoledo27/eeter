# 🛠️ Configuración Inicial de Supabase

Para que la aplicación funcione correctamente (subida de imágenes y creación de productos), necesitas ejecutar el siguiente script SQL en tu panel de Supabase.

Esto es necesario porque la aplicación necesita permisos para guardar datos en la base de datos y archivos en el almacenamiento.

## Pasos

1.  Ve a tu proyecto en **[Supabase Dashboard](https://supabase.com/dashboard)**.
2.  En el menú lateral izquierdo, haz clic en el icono **SQL Editor** (parece una terminal `>_`).
3.  Haz clic en **New Query**.
4.  Copia el siguiente código, pégalo en el editor y dale al botón **RUN**.

```sql
-- 1. Crear el bucket de almacenamiento para imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Permitir que cualquiera vea las imágenes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

-- 3. Permitir que cualquiera suba imágenes (Modo Desarrollo)
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' );

-- 4. Habilitar seguridad (RLS) en la tabla de productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 5. Permitir todas las operaciones (Crear, Leer, Actualizar, Borrar) a todos los usuarios
-- NOTA: Esto es para facilitar el desarrollo. En producción, deberías restringir INSERT/UPDATE/DELETE.

-- Lectura
DROP POLICY IF EXISTS "Enable read access for all users" ON productos;
CREATE POLICY "Enable read access for all users" ON productos FOR SELECT USING (true);

-- Creación (Esto soluciona el error "violates row-level security policy")
DROP POLICY IF EXISTS "Enable insert for all users" ON productos;
CREATE POLICY "Enable insert for all users" ON productos FOR INSERT WITH CHECK (true);

-- Actualización
DROP POLICY IF EXISTS "Enable update for all users" ON productos;
CREATE POLICY "Enable update for all users" ON productos FOR UPDATE USING (true) WITH CHECK (true);

-- Borrado
DROP POLICY IF EXISTS "Enable delete for all users" ON productos;
CREATE POLICY "Enable delete for all users" ON productos FOR DELETE USING (true);
```

## ¿Por qué necesito hacer esto?

*   **Error "Bucket not found":** Supabase no crea los "discos duros" (buckets) automáticamente. El script lo crea por ti.
*   **Error "row-level security policy":** Por defecto, Supabase protege tus tablas para que nadie pueda escribir en ellas. El script añade una regla que dice "permitir escribir a todos" para que puedas probar la app.
