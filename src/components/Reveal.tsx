import { motion, useReducedMotion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'

/** Fades content up gently the first time it enters the viewport. */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  id,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  id?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
