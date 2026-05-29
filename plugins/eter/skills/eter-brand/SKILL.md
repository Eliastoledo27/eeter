---
name: eter-brand
description: "Éter brand, naming, tone, interface, and content rules. Use for visible text, UI polish, marketing, videos, product naming, and brand consistency."
---

# Éter Brand

## Names

- Brand: `Éter`.
- Android/admin app: `FÉter Stock`.
- Avoid: `Eter`, `Feter`, `Féter Stock`, `My Application` in visible user-facing places unless a technical token requires ASCII.
- Admin bypass token remains ASCII: `Feter`.

## Personality

Éter should feel premium, urbano, oscuro, técnico, fast-moving, and clean. It should not sound generic or corporate.

Use confident Spanish for user-facing copy:

- Short, sharp lines.
- Direct commerce language.
- Minimal instruction text in app screens.
- No decorative filler.

## Visual Defaults

- Dark premium base: black / near-black.
- Accent: cyan `#00E5FF`.
- Support colors: green `#00E676`, orange `#FF9100`, red `#FF1744`, violet when needed.
- Avoid flat one-color palettes.
- Keep cards tight and functional; avoid nested cards.
- Product/place/brand must be visible in the first viewport for landing/hero work.

## Assets

Core assets:

- `public/logo.png`
- `public/hero.png`
- `public/zapa_cat.png`
- `public/titulo_cat.png`
- `public/texto.png`
- `public/design/grafiti cian.png`
- `public/design/grafiti verde.png`
- `public/design/grafiti violeta.png`
- `public/design/lineas grafiti tricolor.png`
- `public/design/mancha cian.png`
- `public/design/mancha verde.png`
- `public/design/mancha violeta.png`
- `public/audio/*.mp3`

## Copy Corrections

Always fix mojibake and accents in visible UI:

- `Catálogo`
- `Música`
- `Críticos`
- `Categoría`
- `Descripción`
- `Éter`
- `FÉter Stock`

Technical headers/tokens should stay ASCII when HTTP requires it, especially `Authorization: Bearer Feter` and `x-admin-token: Feter`.
