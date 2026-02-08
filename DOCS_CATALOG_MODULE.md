# Módulo de Gestión de Catálogos

## 1. Descripción General
Sistema completo para que los usuarios (revendedores) suban, gestionen y visualicen sus propios catálogos de productos (PDF, Imágenes). Reemplaza la antigua vista estática de productos.

## 2. Estructura de Base de Datos

### Tabla: `public.catalogs`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | FK a `auth.users` |
| `title` | text | Título del catálogo |
| `description` | text | Descripción opcional |
| `file_url` | text | URL pública del archivo en Storage |
| `category` | text | Categoría (General, Sneakers, etc.) |
| `created_at` | timestamp | Fecha de subida |

### Storage Bucket: `catalogs`
- **Acceso:** Autenticado para subida/borrado. Público para lectura (visualización).
- **Ruta:** `{user_id}/{timestamp}.{ext}`

## 3. Componentes

- **`CatalogManager.tsx`**: Componente principal. Gestiona el estado, búsqueda y listado.
- **`UploadCatalogForm.tsx`**: Formulario con validación de archivo (max 10MB) y subida a Supabase.
- **`CatalogCard.tsx`**: Tarjeta de visualización con acciones (Ver, Eliminar) y preview inteligente.

## 4. Server Actions (`actions/catalog.ts`)

- `uploadCatalog(formData)`: Sube archivo a Storage -> Guarda metadata en DB -> Revalida path.
- `deleteCatalog(id, url)`: Borra de DB -> Borra de Storage -> Revalida path.
- `getCatalogs(query)`: Busca catálogos del usuario actual con filtrado por título/categoría.

## 5. Configuración de Supabase

Ejecutar el siguiente SQL para habilitar el módulo:

```sql
-- Crear tabla
CREATE TABLE IF NOT EXISTS public.catalogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own catalogs" ON public.catalogs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own catalogs" ON public.catalogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own catalogs" ON public.catalogs FOR DELETE USING (auth.uid() = user_id);

-- Storage (Si no existe el bucket 'catalogs')
-- insert into storage.buckets (id, name, public) values ('catalogs', 'catalogs', true);
```
