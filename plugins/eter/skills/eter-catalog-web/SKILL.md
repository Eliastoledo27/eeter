---
name: eter-catalog-web
description: "Éter web catalog operating guide. Use for `/catalog`, product sections, liquidation, flash offers, cart behavior, reseller links, announcements, and Supabase-backed catalog data."
---

# Éter Catalog Web

## Core Routes And Files

- Official production website: `https://eter.store`.
- Public routes to keep in mind: `/`, `/catalog`, `/comunidad`, `/about`, `/contacto`.
- Catalog page: `src/app/catalog/page.tsx`, `src/app/catalog/CatalogClient.tsx`.
- Product card: `src/components/catalog/ProductCard.tsx`.
- Quick view: `src/components/catalog/ProductQuickView.tsx`.
- Floating cart: `src/components/cart/FloatingCartButton.tsx`.
- Liquidation: `src/components/catalog/LiquidationCarousel.tsx`.
- Flash offers: `src/components/catalog/LiquidationCardsSection.tsx`.
- Reseller links: `src/components/catalog/ResellerCatalogLinks.tsx`.
- Announcements: `src/components/announcements/FloatingAnnouncements.tsx`, `src/hooks/useAnnouncements.ts`.

## Section Logic

Desired order:

1. Liquidación real at the top.
2. General section named `Catálogo`.
3. Cheapest section named `Ofertas Flash`.

Product sections:

- `liquidation_active = true` means real Liquidación.
- `product_sections` includes `flash` for flash inclusion.
- `product_sections` includes `catalog` for general catalog.
- Flash can also be computed from lower prices, but avoid duplicating real liquidation unless explicitly marked `flash`.

## Interaction Rules

- Size chips are square, same size, pressable.
- Quick-buy arrow:
  - If a size is selected, add to cart and open cart.
  - If no size is selected, open quick view.
- Floating cart sits bottom-left, dark premium Éter style.
- Floating announcements should avoid visually competing with bottom-left cart.
- Quick view should be fast, minimal, responsive, mobile-friendly.

## Reseller Links

Show exclusive catalog links for verified/active resellers only.

Sources usually involve `profiles.reseller_slug`, role, and active/premium/verified signals depending on current schema. Verify schema and policy before changing.

## Validation

- Run focused type/lint checks for touched files.
- Visually check mobile and desktop for overlap.
- Confirm catalog product counts against Supabase where relevant.
- When production behavior matters, compare local behavior with the public site context for `eter.store` before changing app-web data contracts.
