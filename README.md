# ÉTER STORE PLATFORM 🚀

Bienvenido a **Éter Store**, la plataforma premium para emprendedores y revendedores digitales. Este proyecto ha sido construido con las últimas tecnologías para garantizar escalabilidad, seguridad y una experiencia de usuario de lujo.

## 🛠 Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Lenguaje:** TypeScript
*   **Estilos:** Tailwind CSS + Framer Motion
*   **Base de Datos & Auth:** Supabase (PostgreSQL)
*   **Estado Global:** Zustand
*   **Validación:** Zod
*   **Notificaciones:** Sonner

## 🌟 Características Principales

### 1. Catálogo Público (Index Page)
*   Visualización de productos en grilla con diseño "Glassmorphism".
*   Buscador en tiempo real por nombre de producto.
*   Filtrado por categorías dinámicas.
*   Diseño totalmente responsive.

### 2. Sistema de Roles (RBAC)
La plataforma adapta su interfaz según el rol del usuario:
*   **Admin:** Acceso total a todas las métricas, usuarios e inventario.
*   **Support:** Acceso a CRM y gestión de usuarios.
*   **Reseller:** Acceso a su catálogo personalizado, academia y ranking.
*   **User:** Acceso básico de visualización.

Los roles se gestionan en `src/config/roles.ts`.

### 3. Dashboard Gamificado
*   Sistema de puntos y rachas (streaks).
*   Ranking global de revendedores.
*   CRM integrado para registrar ventas directas.

### 4. Academia LMS
*   Contenido educativo (Video, PDF, Audio).
*   Bloqueo de contenido VIP para usuarios no premium.

### 5. Seguridad & Validación
*   Protección de rutas con Middleware.
*   Validación de formularios con Zod (Login/Registro).
*   Manejo de errores global (`error.tsx`, `not-found.tsx`).

## 🚀 Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <repo_url>
    cd eter-store
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` con tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
    ```

4.  **Configurar Base de Datos:**
    
    **⚠️ IMPORTANTE: Fix RLS Recursion Required**
    
    Si encuentras el error `infinite recursion detected in policy for relation "profiles"`, sigue esta guía rápida:
    
    **Opción Rápida (2 minutos):**
    - Lee [`QUICK_START.md`](QUICK_START.md)
    - Aplica la migración `supabase/migrations/20260207_fix_profiles_rls.sql`
    
    **Documentación completa:**
    - 📚 Índice de documentos: [`INDEX.md`](INDEX.md)
    - 📋 Resumen ejecutivo: [`FIX_SUMMARY.md`](FIX_SUMMARY.md)
    - 🏗️ Arquitectura: [`RLS_ARCHITECTURE.md`](RLS_ARCHITECTURE.md)
    
    **Setup inicial:**
    ```bash
    # Opción 1: Usando Supabase CLI
    npx supabase db push
    
    # Opción 2: Manualmente en SQL Editor
    # Ejecuta: supabase_schema.sql
    # Luego: supabase/migrations/20260207_fix_profiles_rls.sql
    ```

5.  **Correr el servidor:**
    ```bash
    npm run dev
    ```

## 📖 Manual de Usuario (Gestión de Roles)

Para cambiar el rol de un usuario y ver las diferentes interfaces:

1.  Ve a tu dashboard de Supabase > Table Editor > `profiles`.
2.  Busca el usuario por su email.
3.  Edita la columna `role` a uno de los valores permitidos: `admin`, `support`, `reseller`, `user`.
4.  El usuario debe refrescar la página para ver los cambios en su Dashboard.

---

**Desarrollado con ❤️ para Éter Store**
