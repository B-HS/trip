export const GLOBE_TOOLTIP_POINTER_OFFSET = 14
export const GLOBE_TOOLTIP_EDGE_MARGIN = 8
export const GLOBE_TOOLTIP_FALLBACK_WIDTH = 216
export const GLOBE_TOOLTIP_FALLBACK_HEIGHT = 56

export const GLOBE_ARC_EMPHASES = ['idle', 'hovered', 'selected', 'muted'] as const

export type GlobeArcEmphasis = (typeof GLOBE_ARC_EMPHASES)[number]

export type GlobeArcColorToken = 'foreground' | 'mutedForeground'

export type GlobeArcStyle = { colorToken: GlobeArcColorToken; opacity: number; glowOpacity: number; radiusScale: number }

export type GlobePointerPosition = { offsetX: number; offsetY: number }

export type GlobeBoxSize = { width: number; height: number }

export type GlobeTooltipPlacement = { left: number; top: number }

export const GLOBE_ARC_STYLE = {
    idle: { colorToken: 'foreground', opacity: 0.85, glowOpacity: 0.16, radiusScale: 1 },
    hovered: { colorToken: 'foreground', opacity: 1, glowOpacity: 0.34, radiusScale: 1.8 },
    selected: { colorToken: 'foreground', opacity: 1, glowOpacity: 0.42, radiusScale: 2.2 },
    muted: { colorToken: 'mutedForeground', opacity: 0.4, glowOpacity: 0.08, radiusScale: 1 },
} as const satisfies Record<GlobeArcEmphasis, GlobeArcStyle>

export const resolveGlobeArcEmphasis = (routeKey: string, hoveredKey: string | null, selectedKey: string | null): GlobeArcEmphasis => {
    if (routeKey === selectedKey) return 'selected'
    if (routeKey === hoveredKey) return 'hovered'
    return selectedKey === null ? 'idle' : 'muted'
}

const clampAxis = (value: number, size: number, limit: number) =>
    Math.max(GLOBE_TOOLTIP_EDGE_MARGIN, Math.min(value, limit - size - GLOBE_TOOLTIP_EDGE_MARGIN))

const placeAxis = (pointer: number, size: number, limit: number) => {
    const after = pointer + GLOBE_TOOLTIP_POINTER_OFFSET
    const fitsAfter = after + size + GLOBE_TOOLTIP_EDGE_MARGIN <= limit
    return clampAxis(fitsAfter ? after : pointer - GLOBE_TOOLTIP_POINTER_OFFSET - size, size, limit)
}

/**
 * Places the tooltip next to the pointer, flipping to the other side when it would overflow
 * and clamping so that it never leaves the globe container.
 */
export const placeGlobeTooltip = (pointer: { x: number; y: number }, tooltip: GlobeBoxSize, container: GlobeBoxSize): GlobeTooltipPlacement => ({
    left: placeAxis(pointer.x, tooltip.width, container.width),
    top: placeAxis(pointer.y, tooltip.height, container.height),
})
