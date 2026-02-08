# Dashboard: diagnóstico y correcciones

## Problemas detectados

1. Acceso sin sesión: la página del dashboard y academia ejecutaban queries con `user` nulo y podían romper la UI.
2. Null-safety: componentes asumían `full_name` y `name` no nulos.
3. Sesión inestable: el middleware no garantizaba preservación de cookies en redirecciones.
4. Estado duplicado: `checkSession()` se ejecutaba en varios lugares, generando requests redundantes.
5. Build roto: `useSearchParams()` no estaba envuelto en Suspense para prerender y había errores de lint/TS.

## Cambios aplicados

- Guardas server-side:
  - Dashboard: [page.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/app/(protected)/dashboard/page.tsx) ahora hace `redirect('/login')` si no hay usuario/perfil.
  - Academia: [page.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/app/(protected)/academy/page.tsx) misma lógica de protección.
- Null-safety:
  - Utilidades: [dashboard-utils.ts](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/lib/dashboard-utils.ts) para `getFirstName()` y `getInitial()`.
  - Home: [DashboardHome.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/components/dashboard/DashboardHome.tsx) ya no rompe si `full_name` es vacío.
  - Ranking: [DashboardRanking.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/components/dashboard/DashboardRanking.tsx) ya no rompe si `name` es vacío.
- Middleware (cookies + redirect):
  - [middleware.ts](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/middleware.ts) ahora copia cookies a la respuesta de redirect para evitar pérdida de sesión.
- Estado global:
  - [auth-store.ts](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/store/auth-store.ts) agrega manejo de errores y selects mínimos.
  - Se removieron llamadas duplicadas a `checkSession()` de [layout.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/app/(protected)/layout.tsx) y [Navbar.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/components/layout/Navbar.tsx) (se mantiene en AuthProvider).
- Performance:
  - Dashboard fetching paralelizado con `Promise.all` y columnas mínimas.
- Build:
  - Suspense:
    - [layout.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/app/(protected)/layout.tsx) envuelve Sidebar/BottomBar.
    - [page.tsx](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/app/(protected)/dashboard/page.tsx) envuelve DashboardShell.
  - Tipos compartidos para evitar `any`: [dashboard.ts](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/types/dashboard.ts).

## Pruebas

- Unit test utilidades del dashboard:
  - [dashboard-utils.test.ts](file:///c:/Users/Tole/Desktop/Pegada%20Solo/eter-store/src/tests/dashboard-utils.test.ts)
  - Ejecutar: `npx tsx src/tests/dashboard-utils.test.ts`
- Build verificado:
  - `npm run build` finaliza correctamente.

## Nota

Los warnings de `next/image` por uso de `<img>` no rompen el build; se pueden optimizar después migrando a `next/image` para mejorar LCP.
