# 🛍️ ÉTER STORE - Product Details & Shopping Cart

## ✅ **Diseños Generados en Stitch**

### **1. Product Details Page**
- **Screen ID:** `14d3c35440b94bb890898d58c718bd8a`
- **Título:** "ÉTER STORE Product Detail - Nike Dunk Panda"
- **Dimensiones:** 2560 x 3798px
- **Screenshot:** [Ver diseño](https://lh3.googleusercontent.com/aida/AOfcidUFQIkqoM95EIBJIBShaxRIwiaA07cRL5FtmQVWBISnN40Mr8YoG-6ABd6ZVNS9n7H9mjvzt31v0DQpIiuJ0x2lO38gTBu05zTVdDkwZSXYZlSfb2ZSws_rVBotCp3GAT_nmT6my1TbE2COCVFfRZeIONHFsgakih4hwU8FU8WFk5eFV_GJeMxwkkLa0zSNzQK58yvLgTS_FWAdZhNMOoJN4j3EMqcExOfCoeONKZPFnVmyaDQm-HshQw)
- **HTML:** [Descargar](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc4ZDQ0YzM2NWUwMzQ3MTA4ZmVkNDdhYzAyOWI0OGI5EgsSBxDngfPZ3RsYAZIBIwoKcHJvamVjdF9pZBIVQhM4MTY3MDU1MzYxNTc5NjUyODAx&filename=&opi=96797242)

### **2. Shopping Cart Slide-out**
- **Screen ID:** `17ce9b9f232c4d8088290f8b5920b404`
- **Título:** "ÉTER STORE Slide-out Shopping Cart"
- **Dimensiones:** 2560 x 2048px (panel 480px width)
- **Screenshot:** [Ver diseño](https://lh3.googleusercontent.com/aida/AOfcidVt5mlEk5uZlFg54eLfgE7P2pYCGDAcbKlzo40nekHvk30PCyG24zXK_nfAnsw3irQROLElNNd-W-c3lm2W7V3Npl9dHdO6gQhfXBQH217HlnRSiJJIBR1tm3_7YBb9dVFMe-4E1CVfIPyFCkSZ26g575BDcUSEUmS7egHFVM0eqJ2iHhFAYIuPbKpRvvbQkSLU7oU5OG1j2RTCaBOAe2MsRmHvP5hcwEp_gL5PTai9542IVkQ1Un-GLoo)
- **HTML:** [Descargar](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2JjMzNmYTUzNWY0MzQ0MGRhYTI2ZGM3N2E4OWE2MDg3EgsSBxDngfPZ3RsYAZIBIwoKcHJvamVjdF9pZBIVQhM4MTY3MDU1MzYxNTc5NjUyODAx&filename=&opi=96797242)

---

## 📐 **1. PRODUCT DETAILS PAGE**

### **Layout Structure:**

#### **LEFT SIDE (60% width):**
```
Product Gallery:
├── Main Image: Nike Dunk Low Panda
│   ├── Background: Gradient dark gray → black
│   ├── Border: 4px gold when active
│   └── Zoom on hover (magnifier style)
│
└── Thumbnails Row (4 images):
    ├── Different angles
    ├── Glassmorphic containers
    ├── Gold border on selected
    └── Click to change main image
```

#### **RIGHT SIDE (40% width):**
```
Info Panel (Glassmorphic):
├── Header:
│   ├── Badge: "TENDENCIA" (gold pill, top-right)
│   ├── Brand: "Nike Sportswear" (gray-400, small)
│   ├── Model: "DUNK LOW RETRO" (4rem, font-black)
│   └── Subtitle: "Panda Black/White" (xl, gray-300)
│
├── Pricing:
│   ├── Original: "$180.000" (strikethrough, gray-500)
│   ├── Current: "$130.000" (5rem, gold gradient)
│   └── Savings: "-28% OFF" (green pill, pulse)
│
├── Selectors:
│   ├── Color Swatches:
│   │   └── Circles: Black/White (clickable)
│   │
│   ├── Size Grid (38-45):
│   │   ├── Glassmorphic squares
│   │   ├── Selected: Gold border + scale-105
│   │   └── Sold out: Diagonal line, opacity-50
│   │
│   └── Stock: "Solo 3 disponibles" (red, small)
│
├── Description Box (Glassmorphic):
│   ├── Text: "El clásico atemporal..."
│   └── Features:
│       • Cuero genuino
│       • Suela de goma vulcanizada
│       • Tech Flex en collar
│       • Plantilla acolchada
│
├── CTAs (Stacked):
│   ├── 1. "AGREGAR AL CARRITO"
│   │   ├── Full width, py-6
│   │   ├── Gold gradient background
│   │   ├── Black text, font-black
│   │   └── Hover: glow effect
│   │
│   └── 2. "COMPRAR AHORA"
│       ├── Full width, py-6
│       ├── Ghost (border gold)
│       └── White text
│
├── Social Share:
│   └── Icons: Instagram, WhatsApp, Twitter
│       └── Glassmorphic, gold on hover
│
└── Specs Grid (2 columns):
    ├── SKU: NDD-001-BW
    ├── Material: Cuero premium
    ├── Origen: Vietnam
    └── Garantía: 30 días
```

#### **STICKY HEADER (Top):**
```
├── Breadcrumb: Catálogo > Nike > Dunk Low
├── Back arrow (left, gold on hover)
└── Glassmorphic bar
```

#### **RELATED PRODUCTS (Bottom):**
```
"También te puede interesar"
└── 4 Products (Horizontal scroll):
    ├── Mini glassmorphic cards
    ├── Image + Name + Price
    └── Quick "+" button (add to cart)
```

---

## 🛒 **2. SHOPPING CART SLIDE-OUT**

### **Container:**
```css
Width: 480px (desktop), 100% (mobile)
Height: 100vh
Position: fixed, right: 0
Background: black/95, backdrop-blur-2xl
Border-left: 4px gold gradient
Transform: translateX(100%) → translateX(0)
Transition: 300ms ease-out
Z-index: 1000
```

### **Overlay:**
```css
Background: black/40, backdrop-blur-sm
Click → closes cart
```

### **Structure:**

#### **HEADER (Sticky):**
```
Glassmorphic Bar:
├── "CARRITO" (text-3xl, font-black)
├── Item count: "(3 productos)" (gray-400)
└── Close X button (gold on hover)
```

#### **CART ITEMS (Scrollable):**
```
Each Item Card (Glassmorphic):
├── Layout: Horizontal
├── Border: 2px white/10
├── Padding: 1.5rem
│
├── Left: Product Image (120x120px, rounded-xl)
│
├── Center:
│   ├── Brand: "Nike" (small, gray-400)
│   ├── Name: "Dunk Low Panda" (font-bold)
│   ├── Size: "Talle 42" (gray-400)
│   └── Color: "Black/White" (gray-400)
│
└── Right:
    ├── Price: "$130.000" (xl, gold gradient)
    ├── Quantity:
    │   ├── Glassmorphic buttons: - | 1 | +
    │   └── Gold on hover
    └── Remove: Trash icon (red on hover)
```

**Example Items:**
1. Nike Dunk Low Panda - Talle 42 - $130.000 × 1
2. Yeezy Boost 350 Onyx - Talle 43 - $210.000 × 2
3. Jordan 1 High OG - Talle 41 - $185.000 × 1

#### **PROMO CODE:**
```
Glassmorphic Container:
├── Input: "Código de descuento"
│   └── Border white/10, focus: gold
└── Apply Button:
    ├── Gold gradient
    └── Success: Green text "¡Código aplicado!"
```

#### **SUMMARY (Sticky Bottom):**
```
Darker Glassmorphic Box:
├── Subtotal: "$655.000" (gray-300)
├── Descuento: "-$50.000" (green, text-lg)
├── Envío: "GRATIS" (green)
│   └── Strikethrough: "$15.000"
├── Divider (gold, 1px)
└── Total: "$605.000"
    ├── text-4xl, gold gradient
    └── font-black
```

#### **TRUST BADGES:**
```
Row of 3:
├── Shield icon + "Compra segura"
├── Lock icon + "Pago encriptado"
└── Truck icon + "Envío 24hs"
All: gray-400 text, gold icons
```

#### **CTAs (Stacked):**
```
1. "FINALIZAR COMPRA"
   ├── Full width, py-4
   ├── Gold gradient
   ├── Black text, font-black
   └── Hover: scale-105 + glow

2. "SEGUIR COMPRANDO"
   ├── Full width, py-4
   ├── Ghost (border gold)
   ├── White text
   └── Click → closes cart
```

#### **EMPTY STATE:**
```
Center Aligned:
├── Shopping bag icon (huge, gray-600)
├── "Tu carrito está vacío" (text-2xl)
├── "Explorá nuestro catálogo" (gold link)
└── Button: "Ver productos"
    └── Ghost gold, redirects to /catalog
```

---

## 🎨 **Design System Specs**

### **Colors:**
```css
Background: #000000
Gold Primary: #FFD700
Gold Secondary: #FFA500
Gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%)
Text White: #FFFFFF
Text Muted: #9CA3AF
Success Green: #10B981
Error Red: #EF4444
Border Base: rgba(255, 255, 255, 0.1)
Border Hover: rgba(255, 255, 255, 0.5)
Glassmorphism BG: rgba(255, 255, 255, 0.05)
```

### **Typography:**
```css
Heading XXL: 5rem, weight 900, tracking -0.05em
Heading XL: 4rem, weight 900
Heading L: 3rem, weight 800
Heading M: 2rem, weight 700
Body L: 1.125rem, weight 500
Body M: 1rem, weight 400
Small: 0.875rem, weight 400
Tiny: 0.75rem, weight 400
```

### **Spacing:**
```css
Section: 8rem (128px)
Container: 3rem (48px)
Card: 2rem (32px)
Element: 1.5rem (24px)
Compact: 1rem (16px)
Tight: 0.5rem (8px)
```

### **Borders:**
```css
Primary: 4px solid
Secondary: 2px solid
Thin: 1px solid
Radius Small: 0.5rem (8px)
Radius Medium: 1rem (16px)
Radius Large: 2rem (32px)
Radius XL: 3rem (48px)
```

### **Transitions:**
```css
Fast: 150ms ease
Standard: 300ms ease-out
Slow: 500ms ease-in-out
Hover Scale: scale(1.02)
Active Scale: scale(0.98)
```

### **Effects:**
```css
Blur Standard: backdrop-filter: blur(40px)
Blur Heavy: backdrop-filter: blur(80px)
Shadow Soft: 0 10px 30px rgba(0, 0, 0, 0.3)
Shadow Hard: 0 20px 50px rgba(0, 0, 0, 0.6)
Glow Gold: 0 0 40px rgba(255, 215, 0, 0.4)
```

---

## 💻 **Implementation Plan**

### **File Structure:**
```
src/
├── app/
│   ├── catalog/
│   │   └── [id]/
│   │       └── page.tsx (Product Details)
│   └── components/
│       └── cart/
│           ├── CartSlideout.tsx
│           ├── CartItem.tsx
│           ├── CartSummary.tsx
│           └── EmptyCart.tsx
│
├── components/
│   ├── product/
│   │   ├── ProductGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── SizeSelector.tsx
│   │   ├── ColorSelector.tsx
│   │   └── RelatedProducts.tsx
│   │
│   └── ui/
│       ├── Button.tsx (variants: primary, ghost)
│       ├── Badge.tsx
│       ├── QuantitySelector.tsx
│       └── PromoCodeInput.tsx
│
├── hooks/
│   ├── useCart.tsx (Context + logic)
│   ├── useProduct.tsx
│   └── useCartAnimation.tsx
│
└── types/
    ├── product.ts
    └── cart.ts
```

### **Types:**
```typescript
// product.ts
interface Product {
  id: string
  name: string
  brand: string
  model: string
  description: string
  price: {
    current: number
    original?: number
    discount?: number
  }
  images: {
    main: string
    thumbnails: string[]
  }
  colors: {
    id: string
    name: string
    hex: string
    images: string[]
  }[]
  sizes: {
    value: number
    available: boolean
  }[]
  stock: number
  badge?: 'TENDENCIA' | 'NUEVO' | 'AGOTANDO'
  specs: {
    sku: string
    material: string
    origin: string
    warranty: string
  }
  features: string[]
}

// cart.ts
interface CartItem {
  productId: string
  name: string
  brand: string
  image: string
  size: number
  color: string
  price: number
  quantity: number
}

interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  promoCode?: string
}
```

### **Key Components:**

#### **1. ProductGallery.tsx**
```tsx
Features:
- Main image display
- Thumbnail carousel
- Click to change main image
- Zoom on hover (optional)
- Swipe gestures (mobile)
```

#### **2. SizeSelector.tsx**
```tsx
Features:
- Grid of size buttons
- Selected state (gold border)
- Disabled state (sold out)
- Keyboard navigation
- Clear visual feedback
```

#### **3. CartSlideout.tsx**
```tsx
Features:
- Slide in from right animation
- Overlay backdrop
- Multiple close triggers (X, overlay, ESC)
- Scroll lock on body
- Item list with animations
- Sticky header & summary
```

#### **4. CartItem.tsx**
```tsx
Features:
- Horizontal layout
- Quantity +/- controls
- Remove confirmation
- Update cart on change
- Optimistic updates
```

---

## 🔄 **State Management: useCart Hook**

```tsx
interface CartContext {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, size: number, color: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  applyPromoCode: (code: string) => Promise<boolean>
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  totals: {
    subtotal: number
    discount: number
    shipping: number
    total: number
  }
}
```

---

## ✨ **Animations**

### **Cart Slide-in:**
```tsx
Initial: { x: '100%', opacity: 0 }
Animate: { x: 0, opacity: 1 }
Transition: { duration: 0.3, ease: 'easeOut' }
```

### **Item Add:**
```tsx
Product card → Mini version flies to cart icon
Cart icon → Pulse + badge ++
Cart slideout → Opens automatically
New item → Fade + slide in from top
```

### **Item Remove:**
```tsx
Item → Fade + slide left
Summary → Number updates with spring
Empty state → Fade in if last item
```

### **Quantity Update:**
```tsx
Button → Scale down (active)
Number → Fade old → Fade new
Summary → Count up animation
```

---

## 📱 **Responsive Behavior**

### **Product Details:**
```
Desktop (1024px+):
- Split 60/40 layout
- Thumbnails horizontal

Tablet (768-1023px):
- Split 50/50
- Smaller typography

Mobile (<768px):
- Stack vertically
- Gallery carousel
- Sticky CTAs bottom
```

### **Cart Slide-out:**
```
Desktop: 480px width, right side
Tablet: 380px width
Mobile: 100% width, full screen
```

---

## 🎯 **Next Steps for Implementation**

1. ✅ Diseños generados en Stitch
2. ⏳ Descargar HTMLs y analizar estructura
3. ⏳ Crear componentes React reutilizables
4. ⏳ Implementar CartContext con Zustand/Redux
5. ⏳ Conectar a Supabase para productos
6. ⏳ Añadir animaciones con Framer Motion
7. ⏳ Testing responsive en todos los dispositivos
8. ⏳ Optimización de performance

---

**¿Listo para implementar?** 🚀

Los diseños están perfectos y mantienen 100% la coherencia visual con la landing page y el catálogo.

---

*Generado con Gemini 3 Pro + Stitch*  
*Proyecto: 8167055361579652801*  
*Fecha: 2026-02-09*
