'use client'

import { Canvas } from '@react-three/fiber'
import { useTranslations } from 'next-intl'
import { type FC, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/utils'
import {
    type GlobeBoxSize,
    GLOBE_TOOLTIP_FALLBACK_HEIGHT,
    GLOBE_TOOLTIP_FALLBACK_WIDTH,
    type GlobePointerPosition,
    placeGlobeTooltip,
} from '@/shared/ui/three/globe-interaction'
import { formatGlobeRouteLabel, type GlobeRouteInput, resolveGlobeRoutes } from '@/shared/ui/three/globe-math'
import { GLOBE_VARIANT_CONFIG, type GlobeVariant } from '@/shared/ui/three/globe-variant'
import { TripGlobeScene } from '@/shared/ui/three/trip-globe-scene'
import { useReducedMotionPreference } from '@/shared/hooks/use-motion-preference'
import { useFinePointer } from '@/shared/hooks/use-pointer'

const DPR_RANGE: [number, number] = [1, 1.5]
const CAMERA_POSITION_X = 0
const CAMERA_POSITION_Y = 0

const measureBoxSize = (node: HTMLElement | null) => (node === null ? null : { width: node.offsetWidth, height: node.offsetHeight })

export type TripGlobeProps = {
    routes: readonly GlobeRouteInput[]
    variant?: GlobeVariant
    interactive?: boolean
    dragRotate?: boolean
    autoRotate?: boolean
    showTooltip?: boolean
    selectedKey?: string | null
    onRouteSelect?: (key: string) => void
    className?: string
}

export const TripGlobe: FC<TripGlobeProps> = ({
    routes,
    variant = 'hero',
    interactive = true,
    dragRotate = false,
    autoRotate = true,
    showTooltip = false,
    selectedKey = null,
    onRouteSelect,
    className,
}) => {
    const t = useTranslations('tripViewer')
    const containerRef = useRef<HTMLDivElement>(null)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const containerSizeRef = useRef<GlobeBoxSize | null>(null)
    const tooltipSizeRef = useRef<GlobeBoxSize>({ width: GLOBE_TOOLTIP_FALLBACK_WIDTH, height: GLOBE_TOOLTIP_FALLBACK_HEIGHT })
    const pointerRef = useRef<{ x: number; y: number } | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [isHovered, setIsHovered] = useState(false)
    const [hoveredKey, setHoveredKey] = useState<string | null>(null)
    const config = GLOBE_VARIANT_CONFIG[variant]
    const resolvedRoutes = resolveGlobeRoutes(routes)
    const prefersReducedMotion = useReducedMotionPreference()
    const isFinePointer = useFinePointer()
    const isAnimated = !prefersReducedMotion && isVisible
    const frameloop = prefersReducedMotion ? 'demand' : isVisible ? 'always' : 'never'
    const isRouteInteractive = interactive && (showTooltip || onRouteSelect !== undefined)
    const isDragRotated = dragRotate && isFinePointer
    const tooltipRoute = hoveredKey === null ? null : (resolvedRoutes.find((route) => route.key === hoveredKey) ?? null)

    const applyTooltipPlacement = () => {
        const tooltip = tooltipRef.current
        const pointer = pointerRef.current
        const containerSize = containerSizeRef.current ?? measureBoxSize(containerRef.current)
        containerSizeRef.current = containerSize
        if (tooltip === null || pointer === null || containerSize === null) return
        const placement = placeGlobeTooltip(pointer, tooltipSizeRef.current, containerSize)
        tooltip.style.transform = `translate3d(${placement.left}px, ${placement.top}px, 0)`
    }

    const attachTooltip = (node: HTMLDivElement | null) => {
        tooltipRef.current = node
        if (node === null) return
        tooltipSizeRef.current = { width: node.offsetWidth, height: node.offsetHeight }
        applyTooltipPlacement()
    }

    const handleRouteHover = (key: string, pointer: GlobePointerPosition | null) => {
        if (pointer === null) {
            setHoveredKey((current) => (current === key ? null : current))
            return
        }
        pointerRef.current = { x: pointer.offsetX, y: pointer.offsetY }
        applyTooltipPlacement()
        setHoveredKey(key)
    }

    const handlePointerEnter = () => {
        containerSizeRef.current = measureBoxSize(containerRef.current)
        setIsHovered(true)
    }

    const handlePointerLeave = () => {
        pointerRef.current = null
        setIsHovered(false)
        setHoveredKey(null)
    }

    useEffect(() => {
        const node = containerRef.current
        if (!node) return
        const observer = new IntersectionObserver((entries) => setIsVisible(entries.some((entry) => entry.isIntersecting)))
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative w-full',
                config.heightClassName,
                isDragRotated && 'cursor-grab active:cursor-grabbing',
                onRouteSelect !== undefined && hoveredKey !== null && 'cursor-pointer',
                className,
            )}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}>
            <Canvas
                aria-hidden
                className={cn(!interactive && 'pointer-events-none')}
                dpr={DPR_RANGE}
                frameloop={frameloop}
                camera={{ position: [CAMERA_POSITION_X, CAMERA_POSITION_Y, config.cameraDistance], fov: config.cameraFov }}
                gl={{ alpha: true, antialias: config.antialias, powerPreference: 'low-power' }}>
                <TripGlobeScene
                    routes={resolvedRoutes}
                    variant={variant}
                    interactive={interactive}
                    dragRotate={isDragRotated}
                    autoRotate={autoRotate && !isHovered}
                    animated={isAnimated}
                    selectedKey={selectedKey}
                    hoveredKey={hoveredKey}
                    onRouteHover={isRouteInteractive ? handleRouteHover : null}
                    onRouteSelect={isRouteInteractive ? (onRouteSelect ?? null) : null}
                />
            </Canvas>
            {showTooltip && tooltipRoute !== null && (
                <div
                    ref={attachTooltip}
                    aria-hidden
                    className='pointer-events-none absolute top-0 left-0 z-10 flex max-w-56 flex-col gap-0.5 bg-foreground px-3 py-1.5 text-xs text-background'>
                    <span>{formatGlobeRouteLabel(tooltipRoute)}</span>
                    {tooltipRoute.description !== null && <span className='font-mono text-2xs text-background/70'>{tooltipRoute.description}</span>}
                </div>
            )}
            {config.showLabels && resolvedRoutes.length > 0 && (
                <ul
                    aria-hidden
                    className='pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap justify-center gap-x-6 gap-y-1 px-4 text-2xs font-medium tracking-wide text-muted-foreground'>
                    {resolvedRoutes.map((route) => (
                        <li key={route.key}>{formatGlobeRouteLabel(route)}</li>
                    ))}
                </ul>
            )}
            <p className='sr-only'>
                {resolvedRoutes.length === 0
                    ? t('globeEmpty')
                    : t('globeDescription', {
                          routes: resolvedRoutes.map((route) => t('globeRoute', { from: route.from.label, to: route.to.label })).join(', '),
                      })}
            </p>
        </div>
    )
}
