# ÉTER STORE Design System 2026

**Version:** 1.0.0  
**Last Updated:** February 14, 2026  
**Theme:** Dark Luxury with Golden Accents

---

## 📋 Table of Contents

1. [Brand Identity](#brand-identity)
2. [Typography](#typography)
3. [Color Palette](#color-palette)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations & Motion](#animations--motion)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Code Guidelines](#code-guidelines)

---

## 🎨 Brand Identity

### Logo
- **Primary Logo:** ÉTER with golden accent
- **Formats:** SVG (preferred), PNG with transparency
- **Minimum Size:** 120px width
- **Clear Space:** Minimum 24px on all sides

### Brand Values
- **Luxury:** Premium materials and craftsmanship
- **Innovation:** Cutting-edge design and technology
- **Authenticity:** Genuine products and transparent processes
- **Sustainability:** Eco-conscious production methods

### Tagline
> "Luxury Meets Innovation"

---

## 📝 Typography

### Font Families

#### Headings & Titles
**Manrope** - Bold, SemiBold, Medium
- Import: `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');`

#### Body & Content
**Inter** - Regular, Medium, SemiBold
- Import: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');`

### Type Scale

| Element | Typeface | Weight | Size/Line Height | Usage |
|---------|----------|--------|------------------|-------|
| **H1** | Manrope | Bold (700) | 48px/56px | Hero titles, main headings |
| **H2** | Manrope | SemiBold (600) | 36px/44px | Section headings |
| **H3** | Manrope | SemiBold (600) | 28px/36px | Subsection headings |
| **H4** | Manrope | Medium (500) | 24px/32px | Card titles, labels |
| **Body Large** | Inter | Medium (500) | 18px/28px | Lead paragraphs, highlights |
| **Body** | Inter | Regular (400) | 16px/24px | Main content, descriptions |
| **Caption** | Inter | Medium (500) | 14px/20px | Metadata, labels |
| **Small** | Inter | Regular (400) | 12px/16px | Fine print, footnotes |

### Best Practices
- **Line Length:** 60-80 characters for optimal readability
- **Letter Spacing:** -0.02em for headings, 0 for body
- **Text Alignment:** Left-aligned for body, center for headings (contextual)

---

## 🎨 Color Palette

### Primary Colors

```css
/* Primary Gold */
--color-primary: #C88A04;
--color-primary-light: #ECA413;
--color-primary-dark: #A67203;

/* Backgrounds */
--color-bg-darkest: #0A0A0A;
--color-bg-dark: #131313;
--color-bg-medium: #1A1A1A;
--color-bg-light: #1F1F1F;
--color-bg-card: #2A2A2A;

/* Text */
--color-text-primary: #FFFFFF;
--color-text-secondary: #F5F5F5;
--color-text-muted: #A0A0A0;
--color-text-disabled: #666666;
```

### Semantic Colors

```css
/* Success */
--color-success: #10B981;
--color-success-bg: rgba(16, 185, 129, 0.1);

/* Warning */
--color-warning: #F59E0B;
--color-warning-bg: rgba(245, 158, 11, 0.1);

/* Error */
--color-error: #EF4444;
--color-error-bg: rgba(239, 68, 68, 0.1);

/* Info */
--color-info: #3B82F6;
--color-info-bg: rgba(59, 130, 246, 0.1);
```

### Gradients

```css
/* Golden Gradient (Primary) */
background: linear-gradient(135deg, #C88A04 0%, #ECA413 100%);

/* Dark Gradient (Backgrounds) */
background: linear-gradient(180deg, #131313 0%, #0A0A0A 100%);

/* Shimmer Effect (Loading) */
background: linear-gradient(
  90deg,
  rgba(255, 255, 255, 0) 0%,
  rgba(255, 255, 255, 0.1) 50%,
  rgba(255, 255, 255, 0) 100%
);
```

### Usage Guidelines

| Color | Usage | Don't Use For |
|-------|-------|---------------|
| Primary Gold | CTAs, accents, hover states, premium badges | Body text, large backgrounds |
| Dark Backgrounds | Main backgrounds, cards, surfaces | Text (low contrast) |
| White/Light | Primary text, icons, borders | Backgrounds in light mode |
| Success Green | Confirmations, success messages, positive metrics | Error states, warnings |
| Error Red | Error messages, destructive actions, alerts | Success states, CTA buttons |

---

## 📏 Spacing & Layout

### Spacing Scale

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-base: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
--spacing-4xl: 96px;
--spacing-5xl: 128px;
```

### Grid System

- **Container Max Width:** 1440px
- **Grid Columns:** 12 columns
- **Gutter:** 24px (desktop), 16px (tablet), 12px (mobile)
- **Margin:** 80px (desktop), 40px (tablet), 20px (mobile)

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
/* Elevation System */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.6);

/* Glow Effects */
--glow-primary: 0 0 20px rgba(200, 138, 4, 0.4);
--glow-hover: 0 0 30px rgba(236, 164, 19, 0.6);
```

---

## 🧩 Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Add to Cart
</button>

// CSS
.btn-primary {
  padding: 12px 32px;
  background: linear-gradient(135deg, #C88A04 0%, #ECA413 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(236, 164, 19, 0.6);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button
```css
.btn-secondary {
  padding: 12px 32px;
  background: transparent;
  color: #C88A04;
  border: 2px solid #C88A04;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(200, 138, 4, 0.1);
  border-color: #ECA413;
}
```

#### Button Sizes
- **Small:** padding: 8px 20px, font-size: 14px
- **Medium:** padding: 12px 32px, font-size: 16px (default)
- **Large:** padding: 16px 48px, font-size: 18px

### Cards

#### Product Card
```tsx
<div className="product-card">
  <div className="product-image">
    <img src="..." alt="Product" />
    <button className="wishlist-btn">
      <HeartIcon />
    </button>
  </div>
  <div className="product-info">
    <h4 className="product-title">Nike Air Max 2026</h4>
    <p className="product-price">$189.99</p>
    <button className="btn-primary">Add to Cart</button>
  </div>
</div>

// CSS
.product-card {
  background: #1A1A1A;
  border: 1px solid rgba(200, 138, 4, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6);
  border-color: rgba(200, 138, 4, 0.5);
}

.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-info {
  padding: 24px;
}

.product-title {
  font-family: 'Manrope', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.product-price {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #C88A04;
  margin-bottom: 16px;
}
```

#### Info Card (Glassmorphism)
```css
.info-card {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: rgba(26, 26, 26, 0.8);
  border-color: rgba(200, 138, 4, 0.3);
}
```

### Navigation

#### Top Navbar
```tsx
<nav className="navbar">
  <div className="navbar-container">
    <div className="navbar-logo">
      <img src="/logo.svg" alt="ÉTER" />
    </div>
    <ul className="navbar-menu">
      <li><a href="/" className="active">Home</a></li>
      <li><a href="/catalog">Catalog</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
    <div className="navbar-actions">
      <button className="icon-btn"><SearchIcon /></button>
      <button className="icon-btn"><HeartIcon /></button>
      <button className="icon-btn cart">
        <ShoppingCartIcon />
        <span className="badge">3</span>
      </button>
      <button className="icon-btn"><UserIcon /></button>
    </div>
  </div>
</nav>

// CSS
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(200, 138, 4, 0.2);
}

.navbar-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-menu {
  display: flex;
  gap: 40px;
  list-style: none;
}

.navbar-menu a {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #F5F5F5;
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;
}

.navbar-menu a::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #C88A04, #ECA413);
  transition: width 0.3s ease;
}

.navbar-menu a.active,
.navbar-menu a:hover {
  color: #C88A04;
}

.navbar-menu a.active::after,
.navbar-menu a:hover::after {
  width: 100%;
}

.navbar-actions {
  display: flex;
  gap: 16px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  background: rgba(200, 138, 4, 0.1);
  border: 1px solid rgba(200, 138, 4, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.icon-btn:hover {
  background: rgba(200, 138, 4, 0.2);
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #EF4444;
  color: #FFFFFF;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Forms

#### Input Field
```tsx
<div className="form-group">
  <label htmlFor="email">Email Address</label>
  <input 
    id="email"
    type="email" 
    placeholder="Enter your email"
    className="form-input"
  />
</div>

// CSS
.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #F5F5F5;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 14px 20px;
  background: #1A1A1A;
  border: 2px solid #2A2A2A;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #C88A04;
  box-shadow: 0 0 0 4px rgba(200, 138, 4, 0.1);
}

.form-input::placeholder {
  color: #666666;
}
```

---

## 🎬 Animations & Motion

### Transition Settings

```css
/* Base Transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

/* Easing Functions */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Framer Motion Variants

#### Page Transitions
```tsx
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
>
  {/* Page content */}
</motion.div>
```

#### Hover Effects
```tsx
const cardHover = {
  rest: {
    scale: 1,
    y: 0
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

<motion.div
  variants={cardHover}
  initial="rest"
  whileHover="hover"
>
  {/* Card content */}
</motion.div>
```

#### Stagger Children
```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Loading States

```tsx
// Shimmer Effect
const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 2000px 100%;
  animation: ${shimmer} 2s infinite;
}
```

### Micro-interactions

```css
/* Button Press */
.btn:active {
  transform: scale(0.98);
}

/* Ripple Effect */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple-effect {
  position: absolute;
  background: rgba(200, 138, 4, 0.4);
  border-radius: 50%;
  animation: ripple 0.6s ease-out;
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large Desktops */

/* Usage */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Responsive Typography

```css
/* Fluid Typography */
.heading-1 {
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.2;
}

.heading-2 {
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1.3;
}

.body {
  font-size: clamp(14px, 2vw, 16px);
  line-height: 1.5;
}
```

### Grid Responsiveness

```css
.product-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}

@media (min-width: 1280px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr); /* Large Desktop */
  }
}
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Text on Dark Background:** Minimum contrast ratio 4.5:1
- **Large Text (18px+):** Minimum contrast ratio 3:1
- **UI Components:** Minimum contrast ratio 3:1

#### Keyboard Navigation
```tsx
// Focus Visible Styles
*:focus-visible {
  outline: 2px solid #C88A04;
  outline-offset: 4px;
}

// Skip to Main Content
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #C88A04;
  color: #0A0A0A;
  padding: 8px 16px;
  z-index: 1000;
}

.skip-link:focus {
  top: 0;
}
```

#### ARIA Labels
```tsx
// Button with Icon Only
<button aria-label="Add to cart">
  <ShoppingCartIcon aria-hidden="true" />
</button>

// Loading State
<div role="status" aria-live="polite">
  {isLoading && <span>Loading products...</span>}
</div>

// Form Error
<input 
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email address
  </span>
)}
```

#### Screen Reader Support
```tsx
// Visually Hidden but Screen Reader Accessible
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

<span className="sr-only">Current page: Home</span>
```

---

## 💻 Code Guidelines

### CSS Variables Setup

```css
:root {
  /* Colors */
  --color-primary: #C88A04;
  --color-primary-light: #ECA413;
  --color-primary-dark: #A67203;
  
  --color-bg-darkest: #0A0A0A;
  --color-bg-dark: #131313;
  --color-bg-medium: #1A1A1A;
  --color-bg-light: #1F1F1F;
  --color-bg-card: #2A2A2A;
  
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #F5F5F5;
  --color-text-muted: #A0A0A0;
  
  /* Typography */
  --font-heading: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-base: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  --spacing-4xl: 96px;
  --spacing-5xl: 128px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.6);
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### React Component Structure

```tsx
// components/ProductCard.tsx
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  onAddToCart: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  price,
  image,
  onAddToCart
}) => {
  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="product-image">
        <img src={image} alt={title} />
        <button className="wishlist-btn" aria-label="Add to wishlist">
          <Heart />
        </button>
      </div>
      <div className="product-info">
        <h4 className="product-title">{title}</h4>
        <p className="product-price">${price.toFixed(2)}</p>
        <button 
          className="btn-primary"
          onClick={() => onAddToCart(id)}
        >
          <ShoppingCart size={20} />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};
```

### Recharts Customization

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{payload[0].payload.name}</p>
        <p className="value">${payload[0].value}</p>
      </div>
    );
  }
  return null;
};

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis 
      dataKey="name" 
      stroke="#A0A0A0"
      style={{ fontSize: '12px', fontFamily: 'Inter' }}
    />
    <YAxis 
      stroke="#A0A0A0"
      style={{ fontSize: '12px', fontFamily: 'Inter' }}
    />
    <Tooltip content={<CustomTooltip />} />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#C88A04"
      strokeWidth={3}
      dot={{ fill: '#ECA413', r: 6 }}
      activeDot={{ r: 8 }}
    />
  </LineChart>
</ResponsiveContainer>

// Custom Tooltip Styles
.custom-tooltip {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(200, 138, 4, 0.3);
  border-radius: 8px;
  padding: 12px;
}

.custom-tooltip .label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #F5F5F5;
  margin-bottom: 4px;
}

.custom-tooltip .value {
  font-family: 'Manrope', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #C88A04;
}
```

---

## 📦 Technology Stack

- **Framework:** React 18+ with TypeScript
- **Styling:** CSS Modules / Styled Components / Tailwind CSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React
- **Fonts:** Manrope & Inter (Google Fonts)

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install framer-motion recharts lucide-react

# Install fonts (if using local)
npm install @fontsource/manrope @fontsource/inter
```

### Import Fonts

```tsx
// In your main App.tsx or _app.tsx
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
```

### Global Styles

```css
/* globals.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg-darkest);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

---

## 📚 Component Library

Refer to the Stitch project for interactive component examples:
- **Project ID:** 5594560822162253523
- **Project Name:** ÉTER STORE — Final Unified Design System 2026

### Available Screens
1. Landing Page (multiple variations)
2. Catalog Screen
3. Product Detail Screen
4. Cart & Checkout Screen
5. Login Screen
6. Register Screen
7. Reseller Dashboard
8. About & Resellers Directory
9. Mobile View
10. Design System Documentation

---

## 📝 Notes

- Always maintain consistent spacing using the defined scale
- Test color contrast for accessibility compliance
- Use Framer Motion for all animations to ensure performance
- Follow mobile-first responsive design approach
- Implement proper ARIA labels for accessibility
- Keep components modular and reusable

---

**Built with ❤️ by the ÉTER Design Team**  
*Last updated: February 14, 2026*
