---
name: eter-context
description: "Primary operating context for the Éter ecosystem. Use when a task mentions @éter, Éter, FÉter Stock, the catalog, Supabase, reseller links, Android app, Remotion videos, or broad project direction."
---

# Éter Context

## Identity

- Brand: `Éter`.
- Mobile/admin panel: `FÉter Stock`.
- Installed Android app label: `FÉter Stock`.
- Official production website: `https://eter.store`.
- Visible brand copy should use `Éter`; technical links should default to `eter.store` unless the deployment explicitly supports the accented domain.
- Main product: Eter Store, a premium commerce and content system using Next.js, Supabase, Tailwind CSS, Android/Kotlin, Remotion, Hyperframes, and local agent skills.

## Repository Map

- Web app: `src/`.
- Public website routes: home `/`, catalog `/catalog`, community `/comunidad`, about `/about`, contact `/contacto`.
- Web catalog: `src/app/catalog`, `src/components/catalog`, `src/hooks/useCatalog.ts`, `src/lib/product-mapping.ts`.
- Android app: `MyApplication/`.
- Supabase migrations: `supabase/migrations/`.
- Local skills: `.agents/skills/`.
- Plugins: `plugins/`.
- Éter plugin: `plugins/eter/`.
- Remotion and video work: `src/remotion/`, `videos/premium-footwear-ad60/`, `videos/eter-*`.
- Public brand assets: `public/logo.png`, `public/hero.png`, `public/zapa_cat.png`, `public/design/*`, `public/audio/*`.

## Default Work Pattern

1. Inspect current files and schema before assuming.
2. Preserve user changes and avoid broad rewrites.
3. Prefer existing Éter patterns over new abstractions.
4. Verify with narrow checks:
   - Android: `./gradlew.bat :app:assembleDebug --offline --no-daemon`.
   - Web TypeScript/lint: focused `npx tsc --noEmit` or `next lint --file`.
   - Supabase: query real schema and test RPC/storage paths.
   - Remotion: `npx tsc --noEmit`, `npx remotion still`, then render.
5. Store repeated knowledge in this plugin or `.agents/skills/`.

## Skill Routing

- Broad Eter editing, auditing, redesign, or "make it professional": use `eter-editor-expert`.
- Creating, repairing, packaging, or validating Eter skills/plugins: use `eter-skill-forge`.
- Brand/name/copy/UI identity: use `eter-brand`.
- Database, RPC, RLS, storage, schema: use `eter-supabase`.
- Android build/runtime/APK/FÉter Stock: use `eter-android`.
- Web catalog and reseller flow: use `eter-catalog-web`.
- Video, Remotion, content, ads: use `eter-content-video`.
- Known errors and fast fixes: use `eter-troubleshooting`.
