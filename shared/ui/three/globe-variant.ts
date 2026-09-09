export const GLOBE_VARIANTS = ['hero', 'panel', 'mini'] as const

export type GlobeVariant = (typeof GLOBE_VARIANTS)[number]

export type GlobeVariantConfig = {
    heightClassName: string
    cameraDistance: number
    cameraFov: number
    landDotStride: number
    landDotSize: number
    markerRadius: number
    markerRingScale: number
    arcRadius: number
    travellerRadius: number
    parallaxStrength: number
    showGraticule: boolean
    showLabels: boolean
    antialias: boolean
}

export const GLOBE_VARIANT_CONFIG = {
    hero: {
        heightClassName: 'h-80 sm:h-96 lg:h-[28rem]',
        cameraDistance: 3,
        cameraFov: 38,
        landDotStride: 1,
        landDotSize: 0.012,
        markerRadius: 0.018,
        markerRingScale: 2.4,
        arcRadius: 0.005,
        travellerRadius: 0.015,
        parallaxStrength: 0.32,
        showGraticule: true,
        showLabels: true,
        antialias: true,
    },
    panel: {
        heightClassName: 'h-56',
        cameraDistance: 3.2,
        cameraFov: 38,
        landDotStride: 1,
        landDotSize: 0.014,
        markerRadius: 0.024,
        markerRingScale: 2.2,
        arcRadius: 0.007,
        travellerRadius: 0.02,
        parallaxStrength: 0.22,
        showGraticule: true,
        showLabels: false,
        antialias: true,
    },
    mini: {
        heightClassName: 'h-28',
        cameraDistance: 3.4,
        cameraFov: 38,
        landDotStride: 2,
        landDotSize: 0.022,
        markerRadius: 0.038,
        markerRingScale: 2,
        arcRadius: 0.011,
        travellerRadius: 0.03,
        parallaxStrength: 0.16,
        showGraticule: false,
        showLabels: false,
        antialias: false,
    },
} as const satisfies Record<GlobeVariant, GlobeVariantConfig>
