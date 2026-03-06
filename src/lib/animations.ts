// Framer Motion animation variants for TAMADA v2
import type { Easing, Variants, Transition } from "framer-motion";

const ease: Easing = [0.25, 0.1, 0.25, 1];
const easeOut: Easing = [0, 0, 0.2, 1];

// ─── Basic transitions ───────────────────────────
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease },
};

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease },
};

export const spring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 24,
};

// ─── Stagger containers ──────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

// ─── Page transitions ────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease },
  },
};

// ─── Hero-specific ───────────────────────────────
export const heroBadgeReveal: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const heroHeadlineReveal: Variants = {
  initial: { opacity: 0, y: 48 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
};

export const heroSubReveal: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const heroCTAReveal: Variants = {
  initial: { opacity: 0, x: -20, y: 12 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const heroTestimonialReveal: Variants = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const heroReveal: Variants = {
  initial: { opacity: 0, y: 36 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const heroStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.3,
    },
  },
};

export const heroMockupReveal: Variants = {
  initial: { opacity: 0, y: 50, rotateX: 12, scale: 0.92 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 1.0, ease: easeOut, delay: 0.5 },
  },
};

// ─── Card interactions ───────────────────────────
export const cardHover = {
  rest: {
    y: 0,
    boxShadow: "var(--shadow-sm)",
    transition: { duration: 0.2, ease },
  },
  hover: {
    y: -2,
    boxShadow: "var(--shadow-md)",
    transition: { duration: 0.2, ease },
  },
};

// ─── List item stagger ───────────────────────────
export const listStagger: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const listItem: Variants = {
  initial: { opacity: 0, x: -8 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
};

// ─── Scroll-triggered reveal ─────────────────────
export const scrollReveal: Variants = {
  offscreen: { opacity: 0, y: 40 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const scrollRevealScale: Variants = {
  offscreen: { opacity: 0, y: 30, scale: 0.96 },
  onscreen: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

// ─── Modal / overlay ─────────────────────────────
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.15, ease },
  },
};

// ─── Landing page: reveal from left ─────────────
export const revealFromLeft: Variants = {
  offscreen: { opacity: 0, x: -40 },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

export const revealFromRight: Variants = {
  offscreen: { opacity: 0, x: 40 },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

// ─── Landing page: mockup perspective lift ──────
export const mockupReveal: Variants = {
  offscreen: { opacity: 0, y: 60, rotateX: 8 },
  onscreen: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.8, ease: easeOut },
  },
};

// ─── Landing page: timeline step ────────────────
export const timelineStep = (i: number): Variants => ({
  offscreen: { opacity: 0, x: -20 },
  onscreen: {
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: easeOut },
  },
});
