// Shared Framer Motion variants for CB 5 Connect.
// Use these from any component instead of inlining transitions, so motion
// feels consistent across the whole app.

export const ease = [0.22, 1, 0.36, 1] // out-expo-ish, snappy enter, soft exit

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
}

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
}

// Parent that staggers its motion children.
// Use with whileInView for scroll-triggered group reveals.
export const stagger = (gap = 0.06, delay = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
})

// Default whileInView config used by section wrappers.
export const inView = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '0px 0px -80px 0px' },
}
