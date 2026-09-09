export const GLOBE_VARIANTS = ['hero', 'panel', 'mini'] as const

export type GlobeVariant = (typeof GLOBE_VARIANTS)[number]

export type GlobeVariantConfig = {
    heightClassName: string
    cameraDistance: number
    cameraFov: number
    sphereDetail: number
    markerRadius: number
    arcRadius: number
    travellerRadius: number
    parallaxStrength: number
    showLabels: boolean
    antialias: boolean
}

export const GLOBE_VARIANT_CONFIG = {
    hero: {
        heightClassName: 'h-80 sm:h-96 lg:h-[28rem]',
        cameraDistance: 3,
        cameraFov: 38,
        sphereDetail: 2,
        markerRadius: 0.022,
        arcRadius: 0.006,
        travellerRadius: 0.018,
        parallaxStrength: 0.32,
        showLabels: true,
        antialias: true,
    },
    panel: {
        heightClassName: 'h-56',
        cameraDistance: 3.2,
        cameraFov: 38,
        sphereDetail: 2,
        markerRadius: 0.028,
        arcRadius: 0.008,
        travellerRadius: 0.022,
        parallaxStrength: 0.22,
        showLabels: false,
        antialias: true,
    },
    mini: {
        heightClassName: 'h-28',
        cameraDistance: 3.4,
        cameraFov: 38,
        sphereDetail: 1,
        markerRadius: 0.042,
        arcRadius: 0.012,
        travellerRadius: 0.032,
        parallaxStrength: 0.16,
        showLabels: false,
        antialias: false,
    },
} as const satisfies Record<GlobeVariant, GlobeVariantConfig>
