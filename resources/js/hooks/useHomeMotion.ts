import { useReducedMotion, type MotionProps } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export function useHomeMotion(enabled = true) {
  const reducedMotion = useReducedMotion()
  const shouldAnimate = enabled && !reducedMotion
  const enter = (index = 0): MotionProps => ({
    initial: shouldAnimate ? { opacity: 0, y: 22 } : false,
    animate: { opacity: 1, y: 0 },
    transition: { duration: shouldAnimate ? 0.6 : 0, delay: shouldAnimate ? index * 0.07 : 0, ease },
  })
  const reveal = (index = 0): MotionProps => {
    if (!shouldAnimate || typeof IntersectionObserver === 'undefined') {
      return { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    }

    return {
      ...enter(Math.min(index, 5)),
      animate: undefined,
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.15 },
    }
  }

  return {
    enter,
    reveal,
    reducedMotion: !shouldAnimate,
    interactive: {
      whileHover: shouldAnimate ? { y: -4 } : undefined,
      whileTap: shouldAnimate ? { scale: 0.98 } : undefined,
    },
  }
}
