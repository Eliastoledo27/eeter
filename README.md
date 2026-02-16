# 🎨 ÉTER STORE - Unified Design System 2026

<div align="center">

![ÉTER STORE](https://img.shields.io/badge/ÉTER-STORE-C88A04?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)

**Luxury Meets Innovation**

</div>

---

## 📋 Overview

ÉTER STORE Design System is a comprehensive, professional UI/UX framework built for luxury e-commerce experiences. This system integrates modern web technologies with premium design aesthetics to create a cohesive, accessible, and performant user interface.

### 🌟 Key Features

- 🎯 **Consistent Design Language** - Unified visual identity across all pages
- 🎨 **Premium Dark Theme** - Sophisticated dark mode with golden accents
- ⚡ **Performance Optimized** - Smooth 60fps animations using Framer Motion
- ♿ **Accessibility First** - WCAG 2.1 AA compliant
- 📱 **Fully Responsive** - Mobile, Tablet, and Desktop breakpoints
- 🧩 **Component Library** - 50+ reusable React components
- 📊 **Data Visualization** - Custom Recharts themes
- 🎬 **Premium Animations** - Micro-interactions and page transitions

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd eter-store

# Install dependencies
npm install

# Start development server
npm run dev
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### Import Fonts

Add to your `index.html` or main app file:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 📁 Project Structure

```
eter-store/
├── src/
│   ├── components/
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── cards/           # Card components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── InfoCard.tsx
│   │   │   └── ...
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── catalog/         # Catalog-specific components
│   │   └── dashboard/       # Dashboard components
│   ├── lib/
│   │   ├── animations.ts    # Framer Motion presets
│   │   ├── recharts-theme.tsx # Recharts customization
│   │   └── utils.ts         # Utility functions
│   ├── styles/
│   │   ├── design-tokens.css # CSS variables
│   │   ├── globals.css      # Global styles
│   │   └── ...
│   └── pages/               # Application pages
├── docs/
│   ├── DESIGN_SYSTEM.md     # Complete design system documentation
│   ├── COMPONENT_LIBRARY.md # Component usage guide
│   └── ...
└── README.md
```

---

## 🎨 Design System

### Color Palette

```css
/* Primary Gold */
--color-primary: #C88A04;
--color-primary-light: #ECA413;
--color-primary-dark: #A67203;

/* Dark Backgrounds */
--color-bg-darkest: #0A0A0A;
--color-bg-dark: #131313;
--color-bg-medium: #1A1A1A;

/* Text */
--color-text-primary: #FFFFFF;
--color-text-secondary: #F5F5F5;
--color-text-muted: #A0A0A0;

/* Semantic Colors */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Manrope | Bold (700) | 48px |
| H2 | Manrope | SemiBold (600) | 36px |
| H3 | Manrope | SemiBold (600) | 28px |
| Body | Inter | Regular (400) | 16px |
| Caption | Inter | Medium (500) | 14px |

### Spacing Scale

```
4px → 8px → 12px → 16px → 24px → 32px → 48px → 64px → 96px → 128px
```

---

## 🧩 Component Usage

### Button

```tsx
import { Button } from '@/components/ui/Button';
import { ShoppingCart } from 'lucide-react';

<Button 
  variant="primary" 
  size="lg" 
  icon={ShoppingCart}
  onClick={handleClick}
>
  Add to Cart
</Button>
```

**Variants:** `primary`, `secondary`, `tertiary`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

### Product Card

```tsx
import { ProductCard } from '@/components/cards/ProductCard';

<ProductCard
  product={{
    id: '1',
    title: 'Nike Air Max 2026',
    price: 189.99,
    image: '/products/nike-air-max.jpg',
    category: 'Sneakers',
    inStock: true,
    isNew: true
  }}
  onAddToCart={handleAddToCart}
  onToggleFavorite={handleToggleFavorite}
  onQuickView={handleQuickView}
/>
```

### Input Field

```tsx
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';

<Input
  label="Search Products"
  placeholder="Enter product name..."
  icon={Search}
  iconPosition="left"
  onChange={handleSearch}
/>
```

---

## 🎬 Animations

### Page Transitions

```tsx
import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

function Page() {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Page content */}
    </motion.div>
  );
}
```

### Hover Effects

```tsx
import { motion } from 'framer-motion';
import { cardHoverVariants } from '@/lib/animations';

<motion.div
  variants={cardHoverVariants}
  initial="rest"
  whileHover="hover"
>
  {/* Card content */}
</motion.div>
```

### Stagger Children

```tsx
import { motion } from 'framer-motion';
import { 
  staggerContainerVariants, 
  staggerItemVariants 
} from '@/lib/animations';

<motion.div
  variants={staggerContainerVariants}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## 📊 Data Visualization

### Line Chart

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  chartColors,
  defaultChartMargin,
  defaultCartesianGridProps,
  defaultXAxisProps,
  defaultYAxisProps,
  CustomTooltip,
  ChartGradients,
  formatCurrency
} from '@/lib/recharts-theme';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data} margin={defaultChartMargin}>
    <ChartGradients />
    <CartesianGrid {...defaultCartesianGridProps} />
    <XAxis dataKey="date" {...defaultXAxisProps} />
    <YAxis {...defaultYAxisProps} tickFormatter={formatCurrency} />
    <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
    <Line 
      type="monotone" 
      dataKey="sales" 
      stroke={chartColors.primary}
      strokeWidth={3}
    />
  </LineChart>
</ResponsiveContainer>
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

### Responsive Utilities

```tsx
// Hide on mobile
<div className="hide-mobile">Desktop only content</div>

// Show only on mobile
<div className="show-mobile-only">Mobile only content</div>

// Hide on desktop
<div className="hide-desktop">Mobile/Tablet content</div>
```

---

## ♿ Accessibility

### Keyboard Navigation

All interactive elements support keyboard navigation:

- **Tab** - Navigate between elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close modals and dropdowns
- **Arrow Keys** - Navigate within components

### Screen Reader Support

```tsx
// Descriptive labels
<button aria-label="Add to cart">
  <ShoppingCartIcon aria-hidden="true" />
</button>

// Live regions
<div role="status" aria-live="polite">
  {isLoading && <span>Loading products...</span>}
</div>

// Error messages
<input 
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}
```

### Color Contrast

All text meets WCAG 2.1 AA standards:
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18px+):** 3:1 contrast ratio
- **UI components:** 3:1 contrast ratio

---

## 🎯 Stitch Integration

This design system is fully integrated with **Stitch** for visual design:

### View in Stitch

**Project ID:** `5594560822162253523`  
**Project Name:** ÉTER STORE — Final Unified Design System 2026

### Available Screens

1. ✨ **Design System Documentation** - Complete visual reference
2. 🏠 **Landing Pages** (5 variations) - Hero sections, features, CTAs
3. 📦 **Catalog Screen** - Product grid with filters
4. 🔍 **Product Detail Screen** - Full product information
5. 🛒 **Cart & Checkout** - Shopping cart and payment
6. 🔐 **Login/Register Screens** - Authentication flows
7. 📊 **Reseller Dashboard** - Analytics and metrics
8. ℹ️ **About & Resellers Directory** - Company information
9. 📱 **Mobile View** - Responsive mobile layout

---

## 📚 Documentation

### Core Documentation

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design system guide
- **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Component usage examples

### Code References

- **[design-tokens.css](./src/styles/design-tokens.css)** - CSS variables
- **[globals.css](./src/styles/globals.css)** - Global styles
- **[animations.ts](./src/lib/animations.ts)** - Framer Motion presets
- **[recharts-theme.tsx](./src/lib/recharts-theme.tsx)** - Chart styling

---

## 🛠️ Development Guidelines

### Code Style

```tsx
// ✅ Good - Consistent naming
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return <div className="product-card">{/* ... */}</div>;
};

// ❌ Bad - Inconsistent naming
const productcard = ({ prod }) => {
  return <div className="card">{/* ... */}</div>;
};
```

### Component Structure

1. **Imports** - External libraries, then internal modules
2. **Types/Interfaces** - TypeScript definitions
3. **Component** - Main component function
4. **Styles** - CSS/styled-components
5. **Export** - Named export

### Styling Approach

```tsx
// Use CSS variables from design tokens
.button {
  background: var(--color-primary);
  padding: var(--spacing-base) var(--spacing-lg);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}
```

---

## 🚦 Performance

### Optimization Checklist

- ✅ **Image Optimization** - WebP format, lazy loading
- ✅ **Code Splitting** - Dynamic imports for routes
- ✅ **CSS Optimization** - Critical CSS inline
- ✅ **Animation Performance** - GPU-accelerated transforms
- ✅ **Bundle Size** - Tree shaking, minification

### Performance Metrics

- **Lighthouse Score:** 95+
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.0s
- **Cumulative Layout Shift:** < 0.1

---

## 🧪 Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📦 Build & Deploy

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```env
VITE_API_URL=https://api.eter-store.com
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

---

## 🤝 Contributing

### Design System Updates

1. **Propose Changes** - Open an issue describing the change
2. **Update Documentation** - Modify relevant .md files
3. **Update Code** - Implement in components
4. **Update Stitch** - Reflect changes in Stitch project
5. **Submit PR** - Create pull request with screenshots

### Component Creation

```tsx
// 1. Create component file
// components/ui/NewComponent.tsx

// 2. Add to component library docs
// COMPONENT_LIBRARY.md

// 3. Create Stitch screen showcasing component
// (Use Stitch MCP to generate)

// 4. Add usage examples in docs
```

---

## 📞 Support & Resources

### Documentation
- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Components:** [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)

### External Resources
- **Framer Motion:** https://www.framer.com/motion/
- **Recharts:** https://recharts.org/
- **Lucide Icons:** https://lucide.dev/

### Stitch Project
- **View Designs:** Access project `5594560822162253523` in Stitch
- **Export Code:** Download HTML/CSS from individual screens

---

## 📜 License

Copyright © 2026 ÉTER STORE. All rights reserved.

---

## 🎉 Acknowledgments

Built with:
- **React** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Premium animations
- **Recharts** - Data visualization
- **Lucide** - Icon library
- **Stitch** - Visual design tool

---

<div align="center">

**ÉTER STORE Design System v1.0.0**

*Luxury Meets Innovation*

Made with ❤️ by the ÉTER Design Team

</div>
