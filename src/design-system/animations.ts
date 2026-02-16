/**
 * ÉTER Store Animation System
 * Framer Motion variants and animation utilities
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  base: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slow: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  premium: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
} satisfies Record<string, Transition>;

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transitions.base,
  },
  
  slideInFromRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: transitions.premium,
  },
  
  slideInFromLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: transitions.premium,
  },
  
  slideInFromBottom: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: transitions.premium,
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: transitions.premium,
  },
} as const;

// ============================================================================
// HOVER EFFECTS
// ============================================================================

export const hoverEffects = {
  lift: {
    rest: { y: 0 },
    hover: { y: -4, transition: transitions.fast },
  },
  
  liftMore: {
    rest: { y: 0 },
    hover: { y: -8, transition: transitions.base },
  },
  
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: transitions.fast },
  },
  
  scaleSmall: {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: transitions.fast },
  },
  
  glow: {
    rest: { 
      boxShadow: '0 0 0 rgba(255, 217, 0, 0)' 
    },
    hover: { 
      boxShadow: '0 0 20px rgba(255, 217, 0, 0.3)',
      transition: transitions.base,
    },
  },
  
  liftAndScale: {
    rest: { y: 0, scale: 1 },
    hover: { 
      y: -4, 
      scale: 1.02,
      transition: transitions.fast,
    },
  },
} satisfies Record<string, Variants>;

// ============================================================================
// TAP/PRESS EFFECTS
// ============================================================================

export const tapEffects = {
  press: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  
  pressMore: {
    scale: 0.9,
    transition: { duration: 0.1 },
  },
} as const;

// ============================================================================
// LIST/STAGGER ANIMATIONS
// ============================================================================

export const staggerContainers = {
  default: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  
  fast: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },
  
  slow: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  },
} satisfies Record<string, Variants>;

export const staggerItems = {
  fadeIn: {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: transitions.base,
    },
  },
  
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: transitions.premium,
    },
  },
  
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: transitions.premium,
    },
  },
  
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: transitions.premium,
    },
  },
} satisfies Record<string, Variants>;

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const loadingAnimations = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  
  shimmer: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
} as const;

// ============================================================================
// MODAL/OVERLAY ANIMATIONS
// ============================================================================

export const modalAnimations = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transitions.fast,
  },
  
  modal: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: transitions.premium,
  },
  
  slideFromBottom: {
    initial: { opacity: 0, y: '100%' },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100%' },
    transition: transitions.premium,
  },
} as const;

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================

export const microInteractions = {
  bounceIn: {
    initial: { scale: 0 },
    animate: { 
      scale: [0, 1.2, 1],
      transition: {
        duration: 0.5,
        times: [0, 0.6, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },
  
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
  
  wiggle: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5 },
  },
} as const;

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Combine multiple animation variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((acc, variant) => ({ ...acc, ...variant }), {});
}

/**
 * Create a delayed animation
 */
export function delayedAnimation(
  animation: Variants,
  delay: number
): Variants {
  return Object.entries(animation).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && value !== null) {
      acc[key] = {
        ...value,
        transition: {
          ...(typeof value === 'object' && 'transition' in value ? value.transition : {}),
          delay,
        },
      };
    }
    return acc;
  }, {} as Variants);
}
