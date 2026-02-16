# ÉTER STORE Component Library

**Comprehensive React Component Guide**  
Version 1.0.0

---

## Table of Contents

1. [Button Components](#button-components)
2. [Card Components](#card-components)
3. [Form Components](#form-components)
4. [Navigation Components](#navigation-components)
5. [Layout Components](#layout-components)
6. [Data Visualization](#data-visualization)
7. [Animation Components](#animation-components)

---

## Button Components

### Primary Button

```tsx
// components/ui/Button.tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const fullWidthClass = fullWidth ? 'btn-full-width' : '';
  const classes = `${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim();

  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      
      {Icon && iconPosition === 'left' && !isLoading && (
        <Icon className="btn-icon btn-icon-left" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      
      <span className="btn-text">{children}</span>
      
      {Icon && iconPosition === 'right' && !isLoading && (
        <Icon className="btn-icon btn-icon-right" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </motion.button>
  );
};
```

**CSS (Button.css)**

```css
/* Base Button Styles */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: var(--font-body);
  font-weight: var(--font-weight-semibold);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
  user-select: none;
  outline: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Button Sizes */
.btn-sm {
  height: var(--btn-height-sm);
  padding: 0 var(--btn-padding-x-sm);
  font-size: var(--font-size-sm);
}

.btn-md {
  height: var(--btn-height-md);
  padding: 0 var(--btn-padding-x-md);
  font-size: var(--font-size-base);
}

.btn-lg {
  height: var(--btn-height-lg);
  padding: 0 var(--btn-padding-x-lg);
  font-size: var(--font-size-lg);
}

.btn-full-width {
  width: 100%;
}

/* Button Variants */
.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--glow-primary-lg), var(--shadow-lg);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-color: var(--color-primary-light);
}

.btn-tertiary {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-normal);
}

.btn-tertiary:hover:not(:disabled) {
  background: var(--color-bg-hover);
  border-color: var(--color-border-strong);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
}

/* Button Spinner */
.btn-spinner {
  display: inline-flex;
  margin-right: var(--spacing-xs);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Icon Positioning */
.btn-icon-left {
  margin-right: calc(-1 * var(--spacing-xs));
}

.btn-icon-right {
  margin-left: calc(-1 * var(--spacing-xs));
}
```

**Usage Example:**

```tsx
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ProductPage() {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(productId);
    setIsAdding(false);
  };

  return (
    <div>
      {/* Primary button with icon */}
      <Button 
        variant="primary" 
        size="lg" 
        icon={ShoppingCart}
        iconPosition="left"
        onClick={handleAddToCart}
        isLoading={isAdding}
      >
        Add to Cart
      </Button>

      {/* Secondary button */}
      <Button variant="secondary" size="md">
        View Details
      </Button>

      {/* Button with right icon */}
      <Button 
        variant="tertiary" 
        icon={ArrowRight}
        iconPosition="right"
      >
        Continue Shopping
      </Button>
    </div>
  );
}
```

---

## Card Components

### Product Card

```tsx
// components/cards/ProductCard.tsx
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import './ProductCard.css';

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onQuickView: (id: string) => void;
  isFavorite?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
  isFavorite = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const cardVariants = {
    rest: { y: 0 },
    hover: { 
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const imageVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  const overlayVariants = {
    rest: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.article
      className="product-card"
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {/* Image Container */}
      <div className="product-card__image-container">
        {!imageLoaded && (
          <div className="product-card__skeleton skeleton" />
        )}
        
        <motion.img
          src={product.image}
          alt={product.title}
          className={`product-card__image ${imageLoaded ? 'loaded' : ''}`}
          variants={imageVariants}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges */}
        <div className="product-card__badges">
          {product.isNew && (
            <span className="badge badge-new">New</span>
          )}
          {product.discount && (
            <span className="badge badge-discount">-{product.discount}%</span>
          )}
          {!product.inStock && (
            <span className="badge badge-out-of-stock">Out of Stock</span>
          )}
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="product-card__overlay"
          variants={overlayVariants}
        >
          <button
            className="icon-btn"
            onClick={() => onToggleFavorite(product.id)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart 
              size={20} 
              fill={isFavorite ? 'currentColor' : 'none'} 
            />
          </button>
          
          <button
            className="icon-btn"
            onClick={() => onQuickView(product.id)}
            aria-label="Quick view"
          >
            <Eye size={20} />
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="product-card__content">
        <span className="product-card__category">{product.category}</span>
        
        <h3 className="product-card__title">{product.title}</h3>
        
        <div className="product-card__pricing">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          
          {product.originalPrice && (
            <span className="product-card__original-price">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="md"
          fullWidth
          icon={ShoppingCart}
          iconPosition="left"
          onClick={() => onAddToCart(product.id)}
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </motion.article>
  );
};
```

**CSS (ProductCard.css)**

```css
.product-card {
  background: var(--color-bg-medium);
  border: 1px solid var(--color-border-normal);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.product-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-xl);
}

/* Image Container */
.product-card__image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-bg-card);
}

.product-card__skeleton {
  position: absolute;
  inset: 0;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.product-card__image.loaded {
  opacity: 1;
}

/* Badges */
.product-card__badges {
  position: absolute;
  top: var(--spacing-base);
  left: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  z-index: 10;
}

.badge {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-new {
  background: var(--color-success);
  color: white;
}

.badge-discount {
  background: var(--color-error);
  color: white;
}

.badge-out-of-stock {
  background: var(--color-text-muted);
  color: white;
}

/* Overlay Actions */
.product-card__overlay {
  position: absolute;
  top: var(--spacing-base);
  right: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  z-index: 10;
}

.icon-btn {
  width: 40px;
  height: 40px;
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border-normal);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background: rgba(200, 138, 4, 0.2);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.1);
}

/* Product Content */
.product-card__content {
  padding: var(--spacing-lg);
}

.product-card__category {
  display: block;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: var(--spacing-sm);
}

.product-card__title {
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-base);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card__pricing {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.product-card__price {
  font-family: var(--font-heading);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.product-card__original-price {
  font-size: var(--font-size-base);
  color: var(--color-text-muted);
  text-decoration: line-through;
}

/* Responsive */
@media (max-width: 767px) {
  .product-card__content {
    padding: var(--spacing-base);
  }

  .product-card__title {
    font-size: var(--font-size-base);
  }

  .product-card__price {
    font-size: var(--font-size-xl);
  }
}
```

---

## Form Components

### Input Field

```tsx
// components/ui/Input.tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}

        <div className={`input-container ${hasError ? 'input-error' : ''} ${isFocused ? 'input-focused' : ''}`}>
          {Icon && iconPosition === 'left' && (
            <Icon className="input-icon input-icon-left" size={20} />
          )}

          <input
            ref={ref}
            id={inputId}
            className={`input ${Icon ? `input-with-icon-${iconPosition}` : ''} ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {Icon && iconPosition === 'right' && (
            <Icon className="input-icon input-icon-right" size={20} />
          )}
        </div>

        {error && (
          <motion.p
            id={`${inputId}-error`}
            className="input-error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-helper`} className="input-helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**CSS (Input.css)**

```css
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.input-full-width {
  width: 100%;
}

.input-label {
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.input-required {
  color: var(--color-error);
  margin-left: var(--spacing-xs);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  height: var(--input-height-md);
  padding: 0 var(--input-padding-x);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background: var(--color-bg-medium);
  border: 2px solid var(--color-border-normal);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  outline: none;
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input:hover:not(:disabled) {
  border-color: var(--color-border-strong);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input with Icons */
.input-with-icon-left {
  padding-left: calc(var(--input-padding-x) + 32px);
}

.input-with-icon-right {
  padding-right: calc(var(--input-padding-x) + 32px);
}

.input-icon {
  position: absolute;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  pointer-events: none;
}

.input-icon-left {
  left: var(--input-padding-x);
}

.input-icon-right {
  right: var(--input-padding-x);
}

.input-focused .input-icon {
  color: var(--color-primary);
}

/* Error State */
.input-error .input {
  border-color: var(--color-error);
}

.input-error .input:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.input-error-message {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.input-helper-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
```

---

## Continue with more components...

This is a comprehensive starting point. Would you like me to:

1. **Continue with Navigation, Layout, and Data Visualization components?**
2. **Create specific animation presets for Framer Motion?**
3. **Build Recharts custom themes and components?**
4. **Generate additional screens in Stitch showcasing these components?**

Let me know which direction you'd like to prioritize!
