'use client'

import { useInView, useMotionValueEvent, useSpring } from 'motion/react'
import { type FC, useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/utils'
import { useReducedMotionPreference } from '@/shared/hooks/use-motion-preference'

const SPRING_OPTIONS = { stiffness: 120, damping: 22, mass: 0.6 } as const
const IN_VIEW_MARGIN = '0px 0px -64px 0px'
const START_VALUE = 0

export type AnimatedNumberProps = {
    value: number
    format?: (value: number) => string
    className?: string
}

const formatInteger = (value: number) => Math.round(value).toLocaleString('ko-KR')

export const AnimatedNumber: FC<AnimatedNumberProps> = ({ value, format = formatInteger, className }) => {
    const outputRef = useRef<HTMLSpanElement>(null)
    const prefersReducedMotion = useReducedMotionPreference()
    const isInView = useInView(outputRef, { once: true, margin: IN_VIEW_MARGIN })
    const spring = useSpring(START_VALUE, SPRING_OPTIONS)

    useMotionValueEvent(spring, 'change', (latest) => {
        const node = outputRef.current
        if (node) node.textContent = format(latest)
    })

    useEffect(() => {
        if (prefersReducedMotion) {
            spring.jump(value)
            return
        }
        if (!isInView) {
            spring.jump(START_VALUE)
            return
        }
        spring.set(value)
    }, [isInView, prefersReducedMotion, spring, value])

    return (
        <span ref={outputRef} className={cn('tabular-nums', className)}>
            {format(value)}
        </span>
    )
}
