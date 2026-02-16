/**
 * ÉTER STORE - Framer Motion Animation Presets
 * Reusable animation variants for consistent motion design
 */

import { Variants, Transition } from 'framer-motion';

/* ============================================
   EASING FUNCTIONS
   ============================================ */

export const easings = {
    easeOut: [0.16, 1, 0.3, 1], // Smoother ease-out curve
    easeIn: [0.32, 0, 0.67, 0], // Gentler ease-in
    easeInOut: [0.65, 0, 0.35, 1], // More balanced ease-in-out
    bounce: [0.34, 1.56, 0.64, 1], // Subtle bounce
    spring: { type: 'spring', stiffness: 120, damping: 20 }, // Softer spring
    springBouncy: { type: 'spring', stiffness: 180, damping: 15 }, // Less aggressive bounce
    springGentle: { type: 'spring', stiffness: 100, damping: 22 }, // Very gentle spring
    premium: [0.19, 1, 0.22, 1], // Premium smooth curve
} as const;

/* ============================================
   TRANSITION PRESETS
   ============================================ */

export const transitions = {
    fast: {
        duration: 0.25,
        ease: easings.easeOut,
    },
    base: {
        duration: 0.5,
        ease: easings.easeInOut,
    },
    slow: {
        duration: 0.8,
        ease: easings.premium,
    },
    spring: easings.spring,
    springBouncy: easings.springBouncy,
    springGentle: easings.springGentle,
} as const;

/* ============================================
   PAGE TRANSITIONS
   ============================================ */

export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: easings.easeOut,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: easings.easeIn,
        },
    },
};

export const pageSlideVariants: Variants = {
    initial: {
        opacity: 0,
        x: 100,
    },
    animate: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: easings.easeOut,
        },
    },
    exit: {
        opacity: 0,
        x: -100,
        transition: {
            duration: 0.3,
            ease: easings.easeIn,
        },
    },
};

export const pageFadeVariants: Variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.4,
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.3,
        },
    },
};

/* ============================================
   CARD & HOVER ANIMATIONS
   ============================================ */

export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
    },
    hover: {
        scale: 1.01,
        y: -4,
        transition: transitions.base,
    },
};

export const cardPressVariants: Variants = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.02,
    },
    tap: {
        scale: 0.98,
    },
};

export const imageZoomVariants: Variants = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.8,
            ease: easings.premium,
        },
    },
};

export const glowVariants: Variants = {
    rest: {
        boxShadow: '0 0 20px rgba(200, 138, 4, 0.4)',
    },
    hover: {
        boxShadow: '0 0 30px rgba(236, 164, 19, 0.6)',
        transition: transitions.base,
    },
};

/* ============================================
   STAGGER ANIMATIONS
   ============================================ */

export const staggerContainerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.3,
        },
    },
};

export const staggerItemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: transitions.slow,
    },
};

export const staggerFastContainerVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export const gridItemVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: transitions.springGentle,
    },
};

/* ============================================
   MODAL & OVERLAY ANIMATIONS
   ============================================ */

export const modalOverlayVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: transitions.fast,
    },
    exit: {
        opacity: 0,
        transition: transitions.fast,
    },
};

export const modalContentVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            ...transitions.springGentle,
            delay: 0.1,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: transitions.fast,
    },
};

export const drawerVariants: Variants = {
    hidden: {
        x: '100%',
    },
    visible: {
        x: 0,
        transition: {
            ...transitions.springGentle,
            damping: 35,
        },
    },
    exit: {
        x: '100%',
        transition: transitions.base,
    },
};

export const dropdownVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -10,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: transitions.fast,
    },
    exit: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: transitions.fast,
    },
};

/* ============================================
   NOTIFICATION & TOAST ANIMATIONS
   ============================================ */

export const toastVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -100,
        scale: 0.6,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: transitions.springBouncy,
    },
    exit: {
        opacity: 0,
        scale: 0.6,
        transition: transitions.fast,
    },
};

export const slideFromRightVariants: Variants = {
    hidden: {
        x: 100,
        opacity: 0,
    },
    visible: {
        x: 0,
        opacity: 1,
        transition: transitions.springGentle,
    },
    exit: {
        x: 100,
        opacity: 0,
        transition: transitions.base,
    },
};

/* ============================================
   SCROLL-TRIGGERED ANIMATIONS
   ============================================ */

export const fadeInUpVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: easings.premium,
        },
    },
};

export const fadeInLeftVariants: Variants = {
    hidden: {
        opacity: 0,
        x: -30,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: easings.premium,
        },
    },
};

export const fadeInRightVariants: Variants = {
    hidden: {
        opacity: 0,
        x: 30,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: easings.premium,
        },
    },
};

export const scaleInVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: easings.premium,
        },
    },
};

/* ============================================
   LOADING & SPINNER ANIMATIONS
   ============================================ */

export const spinnerVariants: Variants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const pulseVariants: Variants = {
    animate: {
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: easings.easeInOut,
        },
    },
};

export const dotsVariants: Variants = {
    animate: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: easings.easeInOut,
        },
    },
};

/* ============================================
   MICRO-INTERACTIONS
   ============================================ */

export const buttonTapVariants: Variants = {
    rest: {
        scale: 1,
    },
    hover: {
        scale: 1.02,
        transition: transitions.fast,
    },
    tap: {
        scale: 0.98,
        transition: transitions.fast,
    },
};

export const iconHoverVariants: Variants = {
    rest: {
        rotate: 0,
    },
    hover: {
        rotate: 360,
        transition: {
            duration: 0.5,
            ease: easings.easeOut,
        },
    },
};

export const heartBeatVariants: Variants = {
    rest: {
        scale: 1,
    },
    loved: {
        scale: [1, 1.3, 1],
        transition: {
            duration: 0.4,
            ease: easings.bounce,
        },
    },
};

export const shakeVariants: Variants = {
    shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: {
            duration: 0.5,
        },
    },
};

/* ============================================
   BACKGROUND & OVERLAY EFFECTS
   ============================================ */

export const gradientShiftVariants: Variants = {
    animate: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

export const glowPulseVariants: Variants = {
    animate: {
        boxShadow: [
            '0 0 20px rgba(200, 138, 4, 0.4)',
            '0 0 40px rgba(236, 164, 19, 0.6)',
            '0 0 20px rgba(200, 138, 4, 0.4)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: easings.easeInOut,
        },
    },
};

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Creates a stagger delay based on index
 */
export const staggerDelay = (index: number, baseDelay = 0.1): number => {
    return index * baseDelay;
};

/**
 * Creates viewport animation options for scroll-triggered animations
 */
export const viewportOptions = {
    once: true,
    amount: 0.2,
    margin: '-80px',
};

/**
 * Creates a spring transition with custom params
 */
export const createSpringTransition = (
    stiffness = 300,
    damping = 30
): Transition => ({
    type: 'spring',
    stiffness,
    damping,
});

/**
 * Creates a duration-based transition with custom ease
 */
export const createTransition = (
    duration = 0.3,
    ease: readonly number[] | string = easings.easeInOut
): Transition => ({
    duration,
    ease: ease as any,
});

/* ============================================
   USAGE EXAMPLES
   ============================================ */

/*
// Page Transition Example
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
      <h1>Page Content</h1>
    </motion.div>
  );
}

// Card Hover Example
import { motion } from 'framer-motion';
import { cardHoverVariants, imageZoomVariants } from '@/lib/animations';

function ProductCard() {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
    >
      <motion.img
        src="/product.jpg"
        variants={imageZoomVariants}
      />
    </motion.div>
  );
}

// Stagger Children Example
import { motion } from 'framer-motion';
import { 
  staggerContainerVariants, 
  staggerItemVariants 
} from '@/lib/animations';

function ProductGrid({ products }) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map(product => (
        <motion.div
          key={product.id}
          variants={staggerItemVariants}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// Modal Example
import { motion, AnimatePresence } from 'framer-motion';
import { 
  modalOverlayVariants, 
  modalContentVariants 
} from '@/lib/animations';

function Modal({ isOpen, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
          <motion.div
            className="modal-content"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Scroll Animation Example
import { motion } from 'framer-motion';
import { fadeInUpVariants, viewportOptions } from '@/lib/animations';

function Section() {
  return (
    <motion.section
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
    >
      <h2>Section Title</h2>
      <p>Section content...</p>
    </motion.section>
  );
}
*/
