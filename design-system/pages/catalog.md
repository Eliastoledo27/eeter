# Catalog Design System (Override)

This page-specific guide overrides the global master for the public catalog experience.

## Goals
- Premium, minimal catalog for Eter resellers.
- Fast scanning on mobile, tablet, and desktop.
- Clear actions: add to cart, quick view, favorites.
- Advanced filtering without overwhelming the layout.

## Visual System
### Colors
- Primary: #1C1917
- Secondary: #44403C
- Accent/CTA: #CA8A04
- Background: #FAFAF9
- Surface: #FFFFFF (80-90% opacity for glass)
- Text: #0C0A09

### Typography
- Headings: Bodoni Moda
- Body/UI: Jost
- All-caps micro labels: 0.22em - 0.32em letter spacing

### Spacing + Radius
- Card radius: 24-28px
- Input radius: 16px
- Chip radius: full
- Section spacing: 48-96px
- Card padding: 16-20px

## Layout + Grid
- Responsive grid: 2 cols (mobile) / 3 cols (tablet) / 4 cols (desktop).
- Filters are sticky at top-24 with glass background.
- Infinite scroll with a manual "Load more" button for accessibility.

## Search + Filters
- Search bar with autocomplete suggestions (listbox).
- Filters: category, brand, price min/max, availability, sort.
- Active filters appear as removable chips.
- URL query string reflects filters for shareable states.

## Product Card
- Image with blur placeholder and responsive sizes.
- Category pill + availability badge.
- Price emphasized in accent.
- Actions: Add to cart, Quick view, Favorite.
- Hover: border and shadow only (no layout shift).

## Quick View Modal
- Large media, summary, price, stock, and size selection.
- Add to cart CTA with accent color.
- Favorite button visible.

## Microinteractions
- 150-300ms transitions on hover/focus.
- Prefer reduced motion respected (no motion when enabled).

## Accessibility (WCAG 2.1 AA)
- All controls have visible focus states.
- Keyboard operable cards (Enter/Space opens quick view).
- Color contrast maintained for text and buttons.
- Search suggestions use listbox semantics.
- Icons include aria-labels and titles.

## Performance
- next/image with responsive sizes and blur placeholder.
- Filter + search are client-side to avoid slow navigation.
- Infinite scroll loads slices, not all at once.

## Data Assumptions
- Brand is derived from the first token of product name.
- Availability uses total stock > 0 and product is_active.

## A/B Testing Plan
- Variant A (current): premium minimal + gold accent.
- Variant B: higher contrast CTA + larger price emphasis.
- Metrics: add-to-cart rate, quick-view rate, time on page.
- Implementation: route param or feature flag to set variant.
- Analytics: log events for search, filter, quick view, add to cart.

## Component Tokens
- CTA button: bg #CA8A04, text #0C0A09, radius 12-16px.
- Ghost button: white surface, border #0000001A.
- Input focus: ring #CA8A04 at 20% opacity.
