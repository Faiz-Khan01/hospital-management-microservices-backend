/**
 * HospitalSync Pro Suite - Enterprise Motion Design System
 * Built on Motion for React (motion/react)
 * High-performance, GPU-accelerated variants, springs, and transitions.
 */

// Universal Spring & Easing Definitions
export const springSmooth = {
  type: 'spring',
  stiffness: 280,
  damping: 24,
  mass: 0.8
};

export const springSnappy = {
  type: 'spring',
  stiffness: 420,
  damping: 28,
  mass: 0.6
};

export const springBouncy = {
  type: 'spring',
  stiffness: 500,
  damping: 18,
  mass: 0.5
};

export const easeOutCubic = [0.215, 0.61, 0.355, 1.0];
export const easeInOutCubic = [0.645, 0.045, 0.355, 1.0];

// 1. Fade In / Out
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.28, ease: easeOutCubic } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2, ease: easeInOutCubic } 
  }
};

// 2. Fade Up (standard card/section entrance)
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: springSmooth 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: { duration: 0.18, ease: easeInOutCubic } 
  }
};

// 3. Fade Down (standard dropdown/alert entrance)
export const fadeDown = {
  initial: { opacity: 0, y: -16 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: springSmooth 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: { duration: 0.16, ease: easeInOutCubic } 
  }
};

// 4. Slide Left (panels, drawers entering from right)
export const slideLeft = {
  initial: { x: '100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: springSmooth 
  },
  exit: { 
    x: '100%', 
    opacity: 0, 
    transition: { duration: 0.22, ease: easeInOutCubic } 
  }
};

// 5. Slide Right (sidebars entering from left)
export const slideRight = {
  initial: { x: '-100%', opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1, 
    transition: springSmooth 
  },
  exit: { 
    x: '-100%', 
    opacity: 0, 
    transition: { duration: 0.22, ease: easeInOutCubic } 
  }
};

// 6. Scale In (modals, dialogs, badges)
export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: springSmooth 
  },
  exit: { 
    opacity: 0, 
    scale: 0.96, 
    transition: { duration: 0.18, ease: easeInOutCubic } 
  }
};

// 7. Stagger Containers & Items
export const staggerContainer = (staggerDelay = 0.05, delayChildren = 0.02) => ({
  initial: {},
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1
    }
  }
});

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: springSmooth 
  },
  exit: { 
    opacity: 0, 
    y: -8, 
    transition: { duration: 0.15 } 
  }
};

// 8. Page Transitions (Zero layout shift, gentle crossfade)
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.26, 
      ease: easeOutCubic 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -6, 
    transition: { 
      duration: 0.18, 
      ease: easeInOutCubic 
    } 
  }
};

// 9. Card Hover & Elevation
export const cardHover = {
  rest: { 
    y: 0, 
    scale: 1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    transition: springSmooth 
  },
  hover: { 
    y: -4, 
    scale: 1.008,
    boxShadow: '0 12px 28px rgba(14, 165, 233, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: springSmooth 
  }
};

// 10. Modal Backdrops and Dialog Animation
export const modalBackdrop = {
  initial: { opacity: 0, backdropFilter: 'blur(0px)' },
  animate: { 
    opacity: 1, 
    backdropFilter: 'blur(6px)', 
    transition: { duration: 0.22 } 
  },
  exit: { 
    opacity: 0, 
    backdropFilter: 'blur(0px)', 
    transition: { duration: 0.18 } 
  }
};

export const modalAnimation = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: springSmooth 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 12, 
    transition: { duration: 0.16, ease: easeInOutCubic } 
  }
};

// 11. Micro-Interactions
export const buttonPress = {
  whileHover: { scale: 1.025, transition: springSnappy },
  whileTap: { scale: 0.97, transition: springSnappy }
};

export const iconHover = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 3, transition: springBouncy }
};

export const badgePulse = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Validation Error Shake Feedback
export const shakeError = {
  animate: {
    x: [-6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 }
  }
};
