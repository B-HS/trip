import { describe, expect, test } from 'bun:test'
import {
    GLOBE_ARC_STYLE,
    GLOBE_TOOLTIP_EDGE_MARGIN,
    GLOBE_TOOLTIP_POINTER_OFFSET,
    placeGlobeTooltip,
    resolveGlobeArcEmphasis,
} from '@/shared/ui/three/globe-interaction'

const CONTAINER = { width: 400, height: 224 }
const TOOLTIP = { width: 200, height: 48 }

describe('placeGlobeTooltip', () => {
    test('자리가 남으면 포인터 오른쪽 아래에 붙인다', () => {
        expect(placeGlobeTooltip({ x: 40, y: 40 }, TOOLTIP, CONTAINER)).toEqual({
            left: 40 + GLOBE_TOOLTIP_POINTER_OFFSET,
            top: 40 + GLOBE_TOOLTIP_POINTER_OFFSET,
        })
    })

    test('오른쪽·아래로 넘치면 포인터 반대편으로 뒤집는다', () => {
        expect(placeGlobeTooltip({ x: 380, y: 210 }, TOOLTIP, CONTAINER)).toEqual({
            left: 380 - GLOBE_TOOLTIP_POINTER_OFFSET - TOOLTIP.width,
            top: 210 - GLOBE_TOOLTIP_POINTER_OFFSET - TOOLTIP.height,
        })
    })

    test('뒤집어도 왼쪽·위로 넘치면 여백만큼 띄워 붙인다', () => {
        expect(placeGlobeTooltip({ x: 4, y: 4 }, { width: 396, height: 220 }, CONTAINER)).toEqual({
            left: GLOBE_TOOLTIP_EDGE_MARGIN,
            top: GLOBE_TOOLTIP_EDGE_MARGIN,
        })
    })

    test('컨테이너보다 큰 툴팁도 여백 위치로 잡는다', () => {
        expect(placeGlobeTooltip({ x: 200, y: 100 }, { width: 600, height: 400 }, CONTAINER)).toEqual({
            left: GLOBE_TOOLTIP_EDGE_MARGIN,
            top: GLOBE_TOOLTIP_EDGE_MARGIN,
        })
    })
})

describe('resolveGlobeArcEmphasis', () => {
    test('선택도 호버도 없으면 기본 강조다', () => {
        expect(resolveGlobeArcEmphasis('ICN-KIX', null, null)).toBe('idle')
    })

    test('호버 중인 경로만 강조한다', () => {
        expect(resolveGlobeArcEmphasis('ICN-KIX', 'ICN-KIX', null)).toBe('hovered')
        expect(resolveGlobeArcEmphasis('ICN-FUK', 'ICN-KIX', null)).toBe('idle')
    })

    test('선택한 경로는 호버보다 앞선다', () => {
        expect(resolveGlobeArcEmphasis('ICN-KIX', 'ICN-KIX', 'ICN-KIX')).toBe('selected')
    })

    test('선택이 있으면 나머지 경로는 흐려진다', () => {
        expect(resolveGlobeArcEmphasis('ICN-FUK', null, 'ICN-KIX')).toBe('muted')
        expect(resolveGlobeArcEmphasis('ICN-FUK', 'ICN-FUK', 'ICN-KIX')).toBe('hovered')
    })
})

describe('GLOBE_ARC_STYLE', () => {
    test('강조한 경로일수록 더 굵고 진하다', () => {
        expect(GLOBE_ARC_STYLE.selected.radiusScale).toBeGreaterThan(GLOBE_ARC_STYLE.hovered.radiusScale)
        expect(GLOBE_ARC_STYLE.hovered.radiusScale).toBeGreaterThan(GLOBE_ARC_STYLE.idle.radiusScale)
        expect(GLOBE_ARC_STYLE.idle.opacity).toBeGreaterThan(GLOBE_ARC_STYLE.muted.opacity)
    })

    test('흐려진 경로만 보조 색 토큰을 쓴다', () => {
        expect(GLOBE_ARC_STYLE.muted.colorToken).toBe('mutedForeground')
        expect(GLOBE_ARC_STYLE.idle.colorToken).toBe('foreground')
        expect(GLOBE_ARC_STYLE.selected.colorToken).toBe('foreground')
    })
})
