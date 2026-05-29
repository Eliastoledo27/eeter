# Eter Operating Map

## Surfaces

- Web app: `src/` with Next.js App Router, React 18, Tailwind, Supabase SSR, Framer Motion, Remotion, Stripe, PayPal, and AI SDK packages.
- Catalog: `src/app/catalog`, `src/components/catalog`, `src/components/cart`, `src/hooks/useCatalog.ts`, `src/lib/product-mapping.ts`.
- Protected dashboard: `src/app/(protected)/dashboard`, `src/components/dashboard`, `src/components/announcements`.
- Reseller catalog: `src/app/c`, `src/components/reseller`, reseller profile data in Supabase.
- Supabase: `supabase/migrations`, `supabase/*.sql`, `src/utils/supabase`, server actions in `src/app/actions`.
- Android/admin app: `MyApplication/`.
- Media/video: `src/remotion`, `src/components/video*`, `videos/`, `eter-videos/`, `scripts/hyperframes-product-plugin.mjs`.
- Agent memory: `.agents/skills`, `.agents/plugins`, `plugins/eter`, `plugins/eter-antigravity-toolkit`.

## Stable Product Rules

- Public brand is `Éter`; mobile/admin app is `FÉter Stock`.
- Main public domain is `https://eter.store`.
- Eter UI should be premium, dark, direct, commerce-focused, and responsive.
- Catalog sections should keep liquidation, catalog, and flash offers distinct unless the user asks for a content strategy change.
- Supabase product source is `public.productos`; orders write to `public.pedidos`.
- Mobile privileged sync should use `public.feter_admin_sync(payload jsonb)` with `x-admin-token: Feter`.

## Default Checks

- Before broad edits: inspect `git status --short` and relevant files.
- Before UI changes: inspect component, route, CSS/Tailwind config, and data source.
- Before data changes: inspect migration history, schema assumptions, RLS, and call sites.
- Before plugin/skill changes: inspect existing plugin manifest and marketplace entry.

## Avoid

- Do not edit deployment copies, generated folders, or dependency folders as the source of truth.
- Do not normalize away `Éter` in visible brand copy.
- Do not enable RLS blindly; define and inspect policies first.
- Do not split durable Eter memory across random markdown files when it belongs in a skill reference.
