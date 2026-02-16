/**
 * ÉTER Store Design System Tokens
 * Central configuration for all design tokens
 * @2026 - Senior Frontend Architecture
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fonts: {
    heading: ['Space Grotesk', 'Manrope', 'sans-serif'].join(', '),
    body: ['Inter', 'Manrope', 'sans-serif'].join(', '),
    display: ['Space Grotesk', 'Manrope', 'sans-serif'].join(', '),
    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'].join(', '),
  },
  
  scale: {
    // Display (Hero sections)
    display: {
      xl: { size: '4.5rem', lineHeight: '1', weight: '800' }, // 72px
      lg: { size: '3.75rem', lineHeight: '1', weight: '800' }, // 60px
      md: { size: '3rem', lineHeight: '1.1', weight: '700' }, // 48px
      sm: { size: '2.25rem', lineHeight: '1.2', weight: '700' }, // 36px
    },
    
    // Headings
    heading: {
      h1: { size: '2.5rem', lineHeight: '1.2', weight: '700' }, // 40px
      h2: { size: '2rem', lineHeight: '1.3', weight: '700' }, // 32px
      h3: { size: '1.5rem', lineHeight: '1.4', weight: '600' }, // 24px
      h4: { size: '1.25rem', lineHeight: '1.4', weight: '600' }, // 20px
      h5: { size: '1.125rem', lineHeight: '1.5', weight: '600' }, // 18px
      h6: { size: '1rem', lineHeight: '1.5', weight: '600' }, // 16px
    },
    
    // Body text
    body: {
      xl: { size: '1.25rem', lineHeight: '1.75', weight: '400' }, // 20px
      lg: { size: '1.125rem', lineHeight: '1.75', weight: '400' }, // 18px
      md: { size: '1rem', lineHeight: '1.5', weight: '400' }, // 16px
      sm: { size: '0.875rem', lineHeight: '1.5', weight: '400' }, // 14px
      xs: { size: '0.75rem', lineHeight: '1.5', weight: '400' }, // 12px
    },
  },
} as const;

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Primary - Gold accent
  primary: {
    DEFAULT: '#ffd900',
    dim: '#c88a04',
    light: '#ffe033',
    dark: '#b37800',
  },
  
  // Backgrounds
  background: {
    DEFAULT: '#0A0A0A',
    elevated: '#1a1a1a',
    surface: '#262626',
    muted: '#171717',
  },
  
  // Content/Text
  content: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    muted: '#52525B',
    disabled: '#3f3f46',
  },
  
  // Accent colors
  accent: {
    blue: '#0EA5E9',
    purple: '#D946EF',
    gold: '#ffd900',
    teal: '#14B8A6',
    rose: '#F43F5E',
    orange: '#F97316',
  },
  
  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',
  
  // Borders
  border: {
    DEFAULT: '#262626',
    light: '#3f3f46',
    muted: 'rgba(255, 255, 255, 0.05)',
    accent: 'rgba(255, 217, 0, 0.2)',
  },
  
  // Glassmorphism overlays
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    dark: 'rgba(0, 0, 0, 0.4)',
    darker: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Glow effects
  glow: {
    sm: '0 0 10px rgba(255, 217, 0, 0.15)',
    md: '0 0 20px rgba(255, 217, 0, 0.2)',
    lg: '0 0 30px rgba(255, 217, 0, 0.3)',
    xl: '0 0 40px rgba(255, 217, 0, 0.4)',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const animations = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    premium: 'cubic-bezier(0.22, 1, 0.36, 1)', // Smooth premium feel
  },
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  button: {
    height: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
    },
  },
  
  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
    },
  },
} as const;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Convert hex color to rgba with alpha
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get responsive font size classes
 */
export function getResponsiveFontSize(base: string, md?: string, lg?: string): string {
  const classes = [base];
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  return classes.join(' ');
}
