# Estructura actual del sitio

## Stack

- Next.js 14 App Router.
- React 18.
- Tailwind CSS.
- Supabase Auth, Database y Storage.
- Zustand para carrito/auth/UI.
- Framer Motion, GSAP y Lenis para motion.
- Gemini/AI SDK para herramientas IA.
- Stripe, MercadoPago, Nave y AstroPay aparecen en rutas de checkout.
- Remotion/Hyperframes para videos.

## Rutas publicas detectadas

- `/`: landing/home.
- `/catalog`: catalogo publico.
- `/catalog/[id]`: detalle de producto.
- `/catalog/best`, `/catalog/new`, `/catalog/accessories`: vistas filtradas.
- `/cart`, `/checkout`, `/order-confirmation`.
- `/resellers`: pagina de revendedores.
- `/c/[slug]`: catalogo publico de revendedor.
- `/c/[slug]/[productId]`: detalle en catalogo revendedor.
- `/c/catalogorev`, `/c/nuevocatalogrev`: catalogos revendedor generales/experimentales.
- `/about`, `/contact`, `/contacto`, `/community`, `/comunidad`, `/support`, `/shipping`, `/returns`, `/privacy`, `/size-guide`.
- `/eter-videos`: contenido/video.

## Rutas de auth y privadas

- `/login`, `/register`, `/auth/callback`, `/logout`.
- `/dashboard`: dashboard protegido.
- `/dashboard/catalogue`: gestion de catalogo.
- `/dashboard/inventory`: inventario.
- `/dashboard/myshop`: tienda del revendedor.
- `/dashboard/orders`, `/dashboard/purchases`: pedidos/compras.
- `/dashboard/messages`: mensajes/soporte.
- `/dashboard/announcements`: anuncios.
- `/dashboard/profiles`: perfiles/usuarios.
- `/dashboard/settings`: configuracion.
- `/dashboard/ranking`: ranking.
- `/dashboard/video-generator`: generador de video.
- `/academy`: academia.

## APIs relevantes

- `/api/catalog`: catalogo publico JSON.
- `/api/catalog.json`, `/api/catalog-chatfuel.json`: endpoints bot/catalogo.
- `/api/bot-catalog-e8a2b3c4`: catalogo optimizado para bots WhatsApp/Manychat.
- `/api/products/stock`: stock autenticado.
- `/api/admin/products`: gestion admin de productos.
- `/api/admin/sync`: sincronizacion admin.
- `/api/chat`: Aura, asistente IA de ETER.
- `/api/ai/optimize-description`: generador de descripciones.
- `/api/meta/catalog`, `/api/meta-catalog-export`: feeds Meta/Google Merchant.
- `/api/checkout/*`: checkout con proveedores.

## Componentes clave

- `src/components/landing/LandingPage.tsx`: home/landing con identidad visual y propuesta revendedor.
- `src/components/catalog/ProductCard.tsx`: card de producto mobile-first.
- `src/components/catalog/CatalogHero.tsx`: hero de catalogo con stock real.
- `src/components/catalog/StockBadge.tsx`: estado de stock.
- `src/components/reseller/ResellerCatalog.tsx`: catalogo revendedor.
- `src/components/reseller/MarginCalculator.tsx`: calculadora de margen.
- `src/app/(protected)/dashboard/myshop/page.tsx`: configuracion de tienda revendedor.
- `src/components/dashboard/products/ProductManager.tsx`: gestion de productos y stock.
- `src/config/roles.ts`: permisos por rol.
- `src/config/branding.ts`: base oficial de marca, Aura y revendedores.

## Antes del login

El usuario puede ver marca, landing, catalogo, detalle, contenido publico, paginas comerciales y catalogos de revendedor publicados.

## Despues del login

El usuario accede a dashboard. Segun rol puede ver catalogo, pedidos, mensajes, academia, ranking, Mi Tienda y, si corresponde, inventario, perfiles, anuncios y configuracion.

## Elementos a conservar en mobile

- Dark mode premium.
- Logo/wordmark ETER.
- Stock por talle.
- Badges de disponibilidad.
- Filtros rapidos por talle/stock/categoria.
- Resumen operativo de stock.
- Compartir catalogo/producto.
- Calculadora de margen propio.
- Dashboard por rol.
- Aura/IA como herramienta util, no decorativa.

