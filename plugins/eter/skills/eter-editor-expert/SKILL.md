---
name: eter-editor-expert
description: "Expert editing workflow for the Eter repository and plugin ecosystem. Use when the user says Eter/Éter and asks Codex to edit, fix, audit, redesign, extend, professionalize, or decide what to change across the Next.js app, Supabase schema, Android app, catalog, brand assets, videos, plugins, or skills."
---

# Eter Editor Expert

This skill is the operating layer for changing Eter with memory of the real repo. Use it to move from "edit Eter" to a focused, validated change without rereading the whole project.

## Quick Start

1. Read repo root `AGENTS.md`, then `plugins/eter/skills/eter-context/SKILL.md`.
2. Run `scripts/eter_repo_snapshot.py` when the task is broad or the relevant area is unclear.
3. Select the smallest extra Eter skill:
   - Brand/UI/copy: `eter-brand`.
   - Catalog/reseller/cart: `eter-catalog-web`.
   - Supabase/RLS/RPC/storage: `eter-supabase`.
   - Android/admin app: `eter-android`.
   - Video/content: `eter-content-video`.
   - Known breakage: `eter-troubleshooting`.
   - Skills/plugins: `eter-skill-forge`.
4. Inspect touched files before editing. Preserve user changes.
5. Make scoped changes, then run the narrowest meaningful validation.

## Decision Tree

- If the request names a specific file, route, component, SQL object, or Android screen, inspect that artifact first.
- If the request says "mejoralo", "arreglalo", "hacelo profesional", or "cuando diga Eter", start with the snapshot script and route by affected surface.
- If the work changes visible UI, verify mobile and desktop layout and keep Eter's premium dark identity.
- If the work changes Supabase, inspect schema, RLS, migrations, and call sites before editing.
- If the work changes skills/plugins, use `eter-skill-forge` and validate the generated structure.

## Editing Rules

- Prefer existing local patterns in `src/`, `MyApplication/`, `supabase/`, `.agents/skills/`, and `plugins/eter/`.
- Keep user-facing brand text as `Éter` and the admin/mobile product as `FÉter Stock`; keep technical tokens ASCII when required.
- Do not introduce broad abstractions unless they remove real duplication or match a local pattern.
- Do not edit `.env*`, `node_modules/`, build output, exports, or generated deployment folders unless explicitly requested.
- Treat `plugins/eter` as reusable memory: when a fix reveals a durable rule, add it to the relevant Eter skill or reference.

## Validation

Use the narrowest check that proves the changed behavior:

- Web app: `npx tsc --noEmit`; for UI, also inspect in browser when practical.
- Tests: `npm test` or focused `npx tsx <test-file>`.
- Supabase: migration syntax review plus targeted schema/RPC/storage verification.
- Android: `.\gradlew.bat :app:assembleDebug --offline --no-daemon` from `MyApplication/`.
- Skills: `python .agents\skills\skill-creator\scripts\quick_validate.py <skill-path>`.
- Plugins: `python C:\Users\Admin\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py <plugin-path>`.

## References

- Read `references/eter-operating-map.md` for durable repo map, quality gates, and routing notes.
- Read `references/eter-editing-playbook.md` for larger cross-surface edits.
