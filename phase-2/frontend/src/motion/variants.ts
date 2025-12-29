import { Variants } from 'framer-motion';

// Fade In Up Animation - Signature entrance for headings and content
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // Editorial ease
    },
  },
};

// Stagger Container - For lists and grids
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 0.1s delay between items
      delayChildren: 0.1,
    },
  },
};

// Scale Animation - For checkboxes and interactive elements
export const scaleIn: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30, // High damping for precision, no overshoot
    },
  },
};

// Fade Out - For deletions and removals
export const fadeOut: Variants = {
  visible: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Line Draw - For technical dividers and underlines
export const lineDraw: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Hover Scale - Minimal interaction
export const hoverScale = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
};
