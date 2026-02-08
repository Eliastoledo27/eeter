# 📘 Guía Técnica Maestra: Proyecto Dashboard Eter Store (2025 Edition)

Este documento define la arquitectura, estándares y especificaciones técnicas para el desarrollo del dashboard de Eter Store. Está diseñado para garantizar escalabilidad, rendimiento extremo y mantenibilidad a largo plazo.

---

## 1. 🏗️ Arquitectura de Componentes & Modularidad

El sistema adopta una arquitectura híbrida basada en **Next.js App Router**, separando estrictamente la responsabilidad entre el servidor (Data Fetching, Lógica de Negocio) y el cliente (Interactividad).

### **Patrón de Diseño: "Server Shell / Client Islands"**
*   **Páginas (Server Components):** Actúan como "controladores". Realizan la carga de datos en paralelo y pasan la información a los componentes visuales.
*   **Widgets (Client Components):** Son puramente presentacionales ("Dumb Components") o gestionan interactividad local mínima. Reciben datos vía `props`, nunca los solicitan ellos mismos (eliminando el efecto "waterfall").

### **Jerarquía de Módulos**
```
src/
├── app/ (Rutas & Páginas)
│   ├── (protected)/dashboard/
│   │   ├── page.tsx          <-- Data Fetching Orchestrator (Server)
│   │   ├── layout.tsx        <-- Shell Layout (Sidebar/TopBar)
│   │   └── loading.tsx       <-- Skeleton Shell
│
├── components/ (UI & Bloques)
│   ├── admin/                <-- Módulos de Gestión (CRUDs complejos)
│   │   ├── ProductManager/   <-- Lógica encapsulada de producto
│   │   └── OrdersTable/      <-- Tablas avanzadas con filtrado
│   ├── dashboard/            <-- Widgets Visuales (Bento Grid)
│   │   ├── bento/            <-- Sistema de Layout Grid
│   │   └── widgets/          <-- Componentes aislados (Stats, Charts)
│   └── ui/                   <-- Átomos de diseño (Botones, Inputs)
│
├── lib/ (Utilidades)
│   ├── api/                  <-- Clientes API tipados
│   └── utils.ts              <-- Helpers puros
```

---

## 2. 🚀 Especificaciones de Módulos & Flujo de Datos

### **Módulo 1: Visual Dashboard (Bento Grid)**
*   **Objetivo:** Renderizado instantáneo de métricas clave (< 200ms TTFB).
*   **Tecnología:** CSS Grid avanzado + Framer Motion.
*   **Data Flow (Optimizado):**
    1.  `page.tsx` inicia `Promise.all([getStats, getOrders, getRevenue])`.
    2.  Mientras carga, `loading.tsx` muestra un Skeleton de alta fidelidad.
    3.  Al resolver, los datos se inyectan en `<StatsWidget stats={data} />`.
    4.  **Cero `useEffect` para carga inicial.**

### **Módulo 2: Gestión (AdminDashboard)**
*   **Objetivo:** Operaciones CRUD robustas y seguras.
*   **Tecnología:** React Hook Form + Zod + TanStack Table.
*   **Data Flow (Interactivo):**
    1.  Estado local para filtros y paginación.
    2.  **Server Actions** para mutaciones (`createProduct`, `updateOrder`).
    3.  **Optimistic UI:** Actualización inmediata de la interfaz antes de la confirmación del servidor para una sensación de velocidad nativa.

---

## 3. 🛠️ Stack Tecnológico Recomendado (Versiones Específicas)

Para garantizar estabilidad y acceso a las últimas optimizaciones:

*   **Core:**
    *   `Next.js`: **v14.2+** (Estabilidad en Server Actions).
    *   `React`: **v18.3+** (Preparado para v19).
    *   `TypeScript`: **v5.4+** (Tipado estricto).
*   **Estado & Data:**
    *   `Zustand`: **v4.5+** (Estado global cliente: Auth, UI).
    *   `TanStack Query`: **v5+** (Solo para data fetching dependiente de interacción de usuario compleja, si aplica).
    *   `Supabase JS`: **v2.42+** (Auth & DB).
*   **UI & Estilos:**
    *   `Tailwind CSS`: **v3.4+**.
    *   `Framer Motion`: **v11+** (Animaciones layout).
    *   `Lucide React`: **v0.360+** (Iconografía consistente).
    *   `Sonner`: **v1.4+** (Toasts de alto rendimiento).
*   **Formularios:**
    *   `React Hook Form`: **v7.51+**.
    *   `Zod`: **v3.22+**.

---

## 4. 🔒 Seguridad y Autenticación

### **Estrategia "Defense in Depth"**
1.  **Nivel Ruta (Middleware):**
    *   Validación de sesión JWT en cada request a `/dashboard*`.
    *   Redirección inmediata si el token es inválido o ha expirado.
2.  **Nivel Datos (RLS - Row Level Security):**
    *   Políticas en base de datos (Supabase) que aseguran que un usuario **solo** pueda leer/escribir sus propios registros.
    *   *Regla de Oro:* "El frontend no es seguridad".
3.  **Validación de Entrada (Zod):**
    *   Toda Server Action debe validar `input` con un esquema Zod antes de procesar.
    *   Sanitización automática de inputs para prevenir inyecciones.

---

## 5. 📏 Criterios de Rendimiento y Métricas

El éxito técnico se mide objetivamente:

*   **Core Web Vitals:**
    *   **LCP (Largest Contentful Paint):** < 1.2s (Dashboard principal).
    *   **CLS (Cumulative Layout Shift):** 0.00 (Layouts estables, esqueletos precisos).
    *   **INP (Interaction to Next Paint):** < 200ms.
*   **Bundle Size:**
    *   Ruta Dashboard JS inicial < 80kb (Gzip).
    *   Code splitting automático por ruta.

---

## 6. 🧪 Testing & Calidad

*   **Unit Testing (Vitest):**
    *   Pruebas de lógica de negocio pura (helpers, transformadores de datos).
    *   Validación de esquemas Zod.
*   **Component Testing (React Testing Library):**
    *   Verificar que los Widgets renderizan correctamente con props vacías, de carga y de error.
*   **E2E (Playwright - Opcional para fase 2):**
    *   Flujo crítico: Login -> Dashboard -> Crear Producto -> Logout.

---

## 7. 🚀 Plan de Mantenimiento y Actualización

1.  **Auditoría Mensual de Dependencias:** Revisar breaking changes y parches de seguridad.
2.  **Refactorización Proactiva:** Si un componente supera las 300 líneas, debe dividirse.
3.  **Logs de Errores:** Monitoreo activo (vía Sentry o logs de servidor) de fallos en Server Actions.
4.  **Documentación Viva:** Este archivo debe actualizarse cada vez que se introduce un cambio arquitectónico mayor.

---

*Este documento sirve como la fuente de verdad técnica para el equipo de desarrollo de Eter Store. Cualquier desviación de estos estándares debe ser justificada y documentada.*
