'use client'

import { Canvas } from '@react-three/fiber'
import { type FC, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { describeGlobeRoutes, formatGlobeRouteLabel, type GlobeRouteInput, resolveGlobeRoutes } from '@/shared/ui/three/globe-math'
import { GLOBE_VARIANT_CONFIG, type GlobeVariant } from '@/shared/ui/three/globe-variant'
import { TripGlobeScene } from '@/shared/ui/three/trip-globe-scene'
import { useReducedMotionPreference } from '@/shared/hooks/use-motion-preference'

const DPR_RANGE: [number, number] = [1, 1.5]
const CAMERA_POSITION_X = 0
const CAMERA_POSITION_Y = 0

export type TripGlobeProps = {
    routes: readonly GlobeRouteInput[]
    variant?: GlobeVariant
    interactive?: boolean
    autoRotate?: boolean
    className?: string
}

export const TripGlobe: FC<TripGlobeProps> = ({ routes, variant = 'hero', interactive = true, autoRotate = true, className }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(true)
    const config = GLOBE_VARIANT_CONFIG[variant]
    const resolvedRoutes = resolveGlobeRoutes(routes)
    const prefersReducedMotion = useReducedMotionPreference()
    const isAnimated = !prefersReducedMotion && isVisible
    const frameloop = prefersReducedMotion ? 'demand' : isVisible ? 'always' : 'never'

    useEffect(() => {
        const node = containerRef.current
        if (!node) return
        const observer = new IntersectionObserver((entries) => setIsVisible(entries.some((entry) => entry.isIntersecting)))
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className={cn('relative w-full', config.heightClassName, className)}>
            <Canvas
                aria-hidden
                className={cn(!interactive && 'pointer-events-none')}
                dpr={DPR_RANGE}
                frameloop={frameloop}
                camera={{ position: [CAMERA_POSITION_X, CAMERA_POSITION_Y, config.cameraDistance], fov: config.cameraFov }}
                gl={{ alpha: true, antialias: config.antialias, powerPreference: 'low-power' }}>
                <TripGlobeScene routes={resolvedRoutes} variant={variant} interactive={interactive} autoRotate={autoRotate} animated={isAnimated} />
            </Canvas>
            {config.showLabels && resolvedRoutes.length > 0 && (
                <ul
                    aria-hidden
                    className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-x-6 gap-y-1 px-4 text-2xs font-medium tracking-wide text-muted-foreground'>
                    {resolvedRoutes.map((route) => (
                        <li key={route.key}>{formatGlobeRouteLabel(route)}</li>
                    ))}
                </ul>
            )}
            <p className='sr-only'>{describeGlobeRoutes(resolvedRoutes)}</p>
        </div>
    )
}
