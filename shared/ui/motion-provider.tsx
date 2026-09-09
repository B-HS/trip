'use client'

import { MotionConfig } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'

export const MotionProvider: FC<PropsWithChildren> = ({ children }) => <MotionConfig reducedMotion='never'>{children}</MotionConfig>
