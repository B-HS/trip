'use client'

import dynamic from 'next/dynamic'
import type { ComponentType, FC } from 'react'
import { cn } from '@/shared/lib/utils'
import { GLOBE_VARIANT_CONFIG, type GlobeVariant } from '@/shared/ui/three/globe-variant'
import { Skeleton } from '@/shared/ui/skeleton'
import type { TripGlobeProps } from '@/shared/ui/three/trip-globe'

const createLazyGlobe = (variant: GlobeVariant) => {
    const GlobePlaceholder = () => <Skeleton className={cn('w-full rounded-md', GLOBE_VARIANT_CONFIG[variant].heightClassName)} />
    return dynamic(() => import('@/shared/ui/three/trip-globe').then((module) => module.TripGlobe), { ssr: false, loading: GlobePlaceholder })
}

const LAZY_GLOBE_BY_VARIANT = {
    hero: createLazyGlobe('hero'),
    panel: createLazyGlobe('panel'),
    mini: createLazyGlobe('mini'),
} as const satisfies Record<GlobeVariant, ComponentType<TripGlobeProps>>

export const TripGlobeLazy: FC<TripGlobeProps> = ({ variant = 'hero', ...props }) => {
    const LazyGlobe = LAZY_GLOBE_BY_VARIANT[variant]
    return <LazyGlobe variant={variant} {...props} />
}
