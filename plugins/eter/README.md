# @éter

Repo-local Codex plugin for the Éter ecosystem.

This plugin is meant to be invoked when work should use Éter's real operating memory: brand rules, FÉter Stock Android behavior, Supabase tables and RPCs, catalog logic, reseller links, media workflows, and known troubleshooting paths.

Official public web presence:

- Production website: `https://eter.store`.
- Brand spelling in visible copy: `Éter`; use `eter.store` for technical URLs unless the current deployment explicitly supports the accented domain.
- Treat the website, FÉter Stock Android app, and Supabase project as one connected operating system: catalog data, product images, reseller links, announcements, orders, coupons, and inventory sections must stay synchronized.

## What It Contains

- `eter-context`: global map of the project and how to route work.
- `eter-brand`: names, tone, palette, and copy rules.
- `eter-supabase`: schema, RPC, storage, safety, and verification.
- `eter-android`: FÉter Stock build and runtime rules.
- `eter-catalog-web`: web catalog sections, cart, quick view, and reseller links.
- `eter-content-video`: Remotion/Hyperframes/content production rules.
- `eter-troubleshooting`: known errors and fixes from previous work.

## Intended Use

When a user says `@éter`, load the smallest relevant skill or skills from this plugin and act from the current repository context instead of rediscovering decisions from scratch.
