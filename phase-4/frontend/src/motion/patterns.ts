// Animation Patterns - Modern Technical Editorial
// Optimized for clean, surgical precision animations

import { Variants } from 'framer-motion';

// ✨ PRECISION EASING CURVE - Editorial Feel
// According to UI Animation Skill: [0.22, 1, 0.36, 1]
// Starts quick, lands very softly - premium feel
const SMOOTH_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ✨ SPRING PHYSICS - For interactive elements
// High damping (30+) to prevent bounce per skill requirements
const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5
};

// 🎯 CLEAN ENTRANCE ANIMATIONS (Standardized timing)

// Main container with stagger
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Standard fade up (0.8s)
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Line draw (0.8s)
export const lineDraw: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Card/item entrance (0.8s)
export const itemEntrance: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Card entrance (legacy support)
export const cardEntrance: Variants = {
  initial: { opacity: 0, y: 25, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// 🎯 INTERACTIVE STATES (Micro-interactions)

// Hover - Subtle scale only
export const hoverScale = {
  scale: 1.01,
  transition: SPRING_CONFIG
};

// Tap - Precise feedback
export const tapScale = {
  scale: 0.99,
  transition: SPRING_CONFIG
};

// Color transition
export const colorTransition = {
  color: '#FF6B4A',
  transition: { duration: 0.3, ease: SMOOTH_EASE }
};

// 🚀 LEGACY SUPPORT (For existing components)

// Stagger Container (maintained for compatibility)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Tech item entrance (legacy)
export const techItemEntrance: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE }
  }
};

// Viewport stagger (legacy)
export const viewportStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};