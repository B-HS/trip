'use client'

import { motion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'

export const PageTransition: FC<PropsWithChildren> = ({ children }) => (
    <motion.div
        className='flex min-h-0 flex-1 flex-col'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}>
        {children}
    </motion.div>
)
