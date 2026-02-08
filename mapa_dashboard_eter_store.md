# 🗺️ Mapa Conceptual: Eter Store Dashboard

Este documento detalla la arquitectura, flujo de datos y estructura de componentes del Dashboard de Eter Store.

---

## 1. 🏗️ Arquitectura General

El Dashboard opera bajo una arquitectura híbrida en **Next.js (App Router)**:
*   **Ruta Principal:** `/dashboard` (Protegida por Middleware).
*   **Estrategia de Renderizado:** Client Components (`'use client'`) para interactividad, alimentados por **Server Actions** para la obtención de datos segura.
*   **Sistema de Vistas:**
    1.  **Vista Bento (Default):** Panel visual modular para métricas rápidas.
    2.  **Vista Admin (Legacy/Gestión):** Panel de gestión intensiva (CRUDs, Tablas) activado por parámetros URL (`?view=...`).

---

## 2. 🚦 Flujo de Entrada y Seguridad

### **A. Middleware (`src/middleware.ts`)**
*   **Función:** Guardián de acceso.
*   **Lógica:**
    *   Intercepta rutas `/dashboard*`.
    *   Verifica sesión de Supabase (`supabase.auth.getUser()`).
    *   Verifica cookies de Bypass (`eter_dev_session`) para modo desarrollo/demo.
    *   **Redirección:** Si no hay sesión válida -> `/login`.

### **B. Autenticación (`src/hooks/useAuth.tsx`)**
*   **Contexto:** `AuthProvider`.
*   **Funcionalidad:**
    *   Gestiona el estado global del usuario (`user`).
    *   Maneja Login Híbrido:
        *   **Demo:** Setea cookies locales y usuario mock.
        *   **Real:** Autentica contra Supabase Auth.
    *   Exponer métodos: `login`, `logout`, `setRealUser`.

---

## 3. 📱 Estructura de Navegación

### **A. Sidebar (`src/components/layout/Sidebar.tsx`)**
*   **Rol:** Menú de navegación principal (Izquierda).
*   **Lógica:** Renderiza ítems basados en el rol del usuario (`admin` vs `reseller`).
*   **Items Comunes:**
    *   `Dashboard` (`/dashboard`)
    *   `Catálogo` (`/dashboard?view=products`)
    *   `Pedidos` (`/dashboard?view=orders`)
    *   `Academia` (`/dashboard?view=academy`)

### **B. TopBar (`src/components/layout/TopBar.tsx`)**
*   **Rol:** Cabecera superior.
*   **Elementos:**
    *   Buscador Global (Input visual).
    *   Notificaciones (`NotificationsPopover`).
    *   Menú de Usuario (Avatar -> Perfil, Configuración, Logout).

---

## 4. 🖼️ Núcleo del Dashboard (`src/app/(protected)/dashboard/page.tsx`)

Este archivo actúa como el **Router de Vistas**.

### **Lógica de Selección de Vista:**
```typescript
const view = searchParams.get('view');
if (view && view !== 'dashboard') {
  return <LegacyAdminDashboard initialView={view} />; // -> Modo Gestión
}
return <BentoGrid ... />; // -> Modo Visual
```

### **Rama 1: Modo Visual (Bento Grid)**
Diseñado para consumo rápido de información.
*   **Contenedor:** `src/components/dashboard/bento/BentoGrid.tsx`
*   **Widgets (Componentes Autónomos):**
    *   **`WelcomeWidget`**: Saludo personalizado y fecha.
    *   **`StatsWidget`**: Tarjetas de métricas (Ingresos, Pedidos, Clientes).
        *   *Data Source:* `getDashboardStats()` (Server Action).
    *   **`RevenueChartWidget`**: Gráfico de líneas de ingresos.
        *   *Data Source:* `getRevenueData()` (Server Action).
    *   **`TopProductsWidget`**: Lista de productos más vendidos.
        *   *Data Source:* `getTopProducts()` (Server Action).
    *   **`RecentOrdersWidget`**: Tabla resumida de últimos 5 pedidos.
        *   *Data Source:* `getRecentOrders()` (Server Action).

### **Rama 2: Modo Gestión (AdminDashboard)**
Diseñado para operaciones CRUD y administración detallada.
*   **Controlador:** `src/components/admin/AdminDashboard.tsx`
*   **Estado:** Maneja `stats`, `recentOrders`, `allOrders` y controla qué sub-sección mostrar.
*   **Sub-Secciones:**
    1.  **Inventario (`ProductManager`):**
        *   *Ubicación:* `src/components/dashboard/products/ProductManager.tsx`
        *   *Funciones:* Listar, Crear, Editar, Eliminar productos.
        *   *Hook:* `useCatalog()` (Maneja lógica de Supabase + Optimistic UI).
    2.  **Pedidos (`OrdersTable`):**
        *   *Ubicación:* `src/components/admin/OrdersTable.tsx`
        *   *Funciones:* Ver historial completo, filtrar por estado.
    3.  **Clientes (`CustomersTable`):**
        *   *Ubicación:* `src/components/admin/CustomersTable.tsx`
    4.  **Configuración (`SettingsForm`):**
        *   *Ubicación:* `src/components/admin/SettingsForm.tsx`

---

## 5. 🔌 Capa de Datos (Server Actions)

Archivo central: `src/app/actions/dashboard.ts`

Estas funciones se ejecutan en el servidor y alimentan tanto al Bento Grid como al AdminDashboard.

*   **`isBypassSession()`**: Detecta si estamos en modo Demo.
*   **`getDashboardStats()`**:
    *   Calcula ingresos totales, conteo de pedidos y crecimiento.
    *   *Demo:* Retorna objeto estático `getMockStats()`.
    *   *Real:* Consulta tablas `pedidos`, `productos`, `clientes` en Supabase.
*   **`getRecentOrders(limit)`**:
    *   Obtiene últimos N pedidos.
*   **`getAllOrders()`**:
    *   Obtiene historial completo para la vista de Pedidos.
*   **`getTopProducts()`**:
    *   Analiza los ítems dentro de los pedidos JSON para calcular ranking de ventas.

---

## 6. 🛠️ Resumen de Dependencias Clave

*   **UI/UX:** `framer-motion` (animaciones), `lucide-react` (iconos), `shadcn/ui` (componentes base), `sonner` (toasts).
*   **Backend:** `@supabase/ssr` (conexión DB).
*   **Estado:** `zustand` (`useAuthStore`, `useUIStore`).

---

## 7. 🔗 Mapa de Vinculación (Ejemplo de Flujo)

1.  **Usuario entra a `/dashboard`**
    *   `page.tsx` detecta sin params -> Renderiza **BentoGrid**.
    *   `StatsWidget` se monta -> Llama a `getDashboardStats()`.
    *   `getDashboardStats` verifica sesión -> Consulta Supabase -> Retorna JSON.
    *   Widget muestra "$1.2M Ingresos".

2.  **Usuario hace clic en "Inventario" (Sidebar)**
    *   Navegación a `/dashboard?view=products`.
    *   `page.tsx` detecta `view=products` -> Renderiza **AdminDashboard**.
    *   `AdminDashboard` lee prop `activeSection='products'`.
    *   Renderiza **ProductManager**.
    *   `ProductManager` usa `useCatalog` para traer lista de productos.
