# Éter Store - Luxury Catalog Design System

## Philosophy
Quiet luxury meets Scandinavian minimalism. Understated elegance with sophisticated details.

## Color Palette

### Primary Neutrals
- **Charcoal**: `#1C1C1C` - Primary text, headings
- **Warm Gray**: `#3A3A3A` - Secondary text
- **Stone**: `#6B6B6B` - Muted text, captions
- **Off-White**: `#F7F7F5` - Background
- **Pure White**: `#FFFFFF` - Cards, surfaces

### Metallic Accents
- **Gold**: `#C9A227` - Primary accent, CTAs
- **Champagne Gold**: `#D4AF37` - Hover states
- **Silver**: `#C0C0C0` - Secondary accents
- **Copper**: `#B87333` - Warm highlights
- **Rose Gold**: `#B76E79` - Elegant touches

### Earthy Tones (Scandinavian Influence)
- **Burgundy**: `#722F37` - Rich depth
- **Terracotta**: `#E2725B` - Warm accents
- **Sage**: `#87A878` - Natural touch
- **Warm Beige**: `#D4C5B0` - Neutral warmth

## Typography System

### Serif - Editorial Headlines
```css
font-family: 'Playfair Display', 'Bodoni Moda', serif;
```
- H1: 48-72px, weight 600-700, tight letter-spacing
- H2: 36-48px, weight 600
- H3: 24-32px, weight 500-600
- Editorial quotes: 24px, italic, weight 400

### Sans-Serif - Body & UI
```css
font-family: 'Inter', 'Lato', sans-serif;
```
- Body: 16-18px, weight 400, line-height 1.6
- UI Elements: 14px, weight 500, uppercase, tracking 0.1em
- Micro labels: 11-12px, weight 600, uppercase, tracking 0.15em

## Spacing System (Editorial Grid)

### Section Spacing
- **Hero**: 120-160px vertical padding
- **Major sections**: 96-120px
- **Standard sections**: 64-80px
- **Compact sections**: 40-48px

### Component Spacing
- **Card padding**: 24-32px
- **Grid gaps**: 24-40px
- **Element margins**: 16-24px
- **Tight spacing**: 8-12px

### Container
- **Max-width**: 1400px (editorial)
- **Side margins**: 24px mobile, 48px tablet, 80px desktop

## Effects & Textures

### Shadows (Soft & Sophisticated)
```css
--shadow-soft: 0 4px 20px rgba(0, 0, 0, 0.06);
--shadow-medium: 0 8px 32px rgba(0, 0, 0, 0.08);
--shadow-luxury: 0 16px 48px rgba(0, 0, 0, 0.12);
--shadow-gold: 0 4px 24px rgba(201, 162, 39, 0.15);
```

### Borders
- **Subtle**: 1px solid rgba(0, 0, 0, 0.08)
- **Accent**: 1px solid #C9A227
- **Card radius**: 16-24px
- **Button radius**: 8px (refined) or full (pills)

### Textures
- **Noise overlay**: 2-3% opacity
- **Gradient backgrounds**: Subtle warm gradients
- **Glass morphism**: backdrop-blur with white/80 opacity

## Animation Principles

### Transitions
- **Standard**: 300ms ease-out
- **Smooth**: 500ms cubic-bezier(0.4, 0, 0.2, 1)
- **Luxury**: 600ms cubic-bezier(0.22, 1, 0.36, 1)

### Hover Effects
- **Cards**: translateY(-4px) + shadow increase
- **Buttons**: background darken + subtle scale(1.02)
- **Images**: scale(1.05) with smooth transition
- **Links**: color shift with underline animation

### Micro-interactions
- **Stagger delays**: 50-100ms between elements
- **Page transitions**: 400ms fade + slide
- **Loading states**: Skeleton with shimmer effect

## Component Specifications

### Product Cards (Luxury Variant)
- Full-bleed image with gradient overlay
- Category badge (uppercase, micro text)
- Product name (serif, 18-20px)
- Price with gold accent
- Quick actions overlay on hover
- Shadow increases on hover

### Buttons
**Primary (Gold)**
- Background: #C9A227
- Text: #1C1C1C (dark for contrast)
- Padding: 16px 32px
- Border-radius: 8px
- Hover: darken 10% + scale(1.02)

**Secondary (Outline)**
- Border: 1px solid #1C1C1C
- Background: transparent
- Hover: background #1C1C1C, text white

**Ghost**
- Background: rgba(255, 255, 255, 0.8)
- Backdrop blur
- Border: 1px solid rgba(0, 0, 0, 0.1)

### Form Elements
- Inputs: 48px height, subtle border
- Focus: gold ring (2px)
- Labels: uppercase, 12px, letter-spacing 0.1em
- Placeholders: muted gray

## Grid System (Modular)

### Editorial Grid
- 12-column base
- Asymmetric layouts (7:5, 8:4 ratios)
- Variable heights for visual rhythm
- Generous whitespace (40-60px gaps)

### Product Grid
- Mobile: 2 columns, 16px gap
- Tablet: 3 columns, 24px gap
- Desktop: 4 columns, 32px gap
- Large: 4-5 columns, 40px gap

## Responsive Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640-1024px
- **Desktop**: 1024-1400px
- **Large**: > 1400px

## Print Considerations
- Color profile: CMYK ready
- Minimum font size: 10pt for print
- Margins: minimum 15mm
- Images: 300 DPI minimum
- Convert gold to CMYK: C10 M25 Y80 K5

## Accessibility (WCAG 2.1 AA)
- Contrast ratio: 4.5:1 minimum
- Focus indicators: 2px gold outline
- Keyboard navigation: full support
- Screen reader: semantic HTML
- Reduced motion: respect preferences
