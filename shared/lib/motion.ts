export const MOTION_EASE_STANDARD = [0.4, 0, 0.2, 1] as const
export const MOTION_FADE_DURATION = 0.18
export const MOTION_BAR_DURATION = 0.24
export const MOTION_HERO_DURATION = 0.6
export const MOTION_STAGGER = 0.06
export const MOTION_STAGGER_HERO = 0.12

export const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD },
} as const

export const FADE_UP = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD },
} as const

export const HERO_FADE_UP = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: MOTION_HERO_DURATION, ease: MOTION_EASE_STANDARD },
} as const

export const STAGGER_CONTAINER = {
    initial: {},
    animate: { transition: { staggerChildren: MOTION_STAGGER } },
} as const

export const STAGGER_CONTAINER_HERO = {
    initial: {},
    animate: { transition: { staggerChildren: MOTION_STAGGER_HERO } },
} as const
