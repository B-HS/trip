import { describe, expect, test } from 'bun:test'
import { resolveCssColor } from '@/shared/ui/three/css-color'

describe('resolveCssColor - lab()', () => {
    test('브라우저가 직렬화한 lab() 을 hex 로 변환한다', () => {
        expect(resolveCssColor('lab(100% 0 0)')).toEqual({ color: '#ffffff', alpha: 1 })
        expect(resolveCssColor('lab(0% 0 0)')).toEqual({ color: '#000000', alpha: 1 })
        expect(resolveCssColor('lab(98.26% 0 0)')).toEqual({ color: '#fafafa', alpha: 1 })
    })

    test('슬래시 알파를 분리한다', () => {
        expect(resolveCssColor('lab(100% 0 0 / .1)')).toEqual({ color: '#ffffff', alpha: 0.1 })
    })

    test('중간 명도의 무채색은 회색 hex 가 된다', () => {
        const { color } = resolveCssColor('lab(66.128% -.0000298023 .0000119209)')
        expect(color).toMatch(/^#[0-9a-f]{6}$/)
        expect(color.slice(1, 3)).toBe(color.slice(3, 5))
        expect(color.slice(3, 5)).toBe(color.slice(5, 7))
    })

    test('퍼센트 없는 명도도 같은 값으로 읽는다', () => {
        expect(resolveCssColor('lab(100 0 0)')).toEqual(resolveCssColor('lab(100% 0 0)'))
    })
})

describe('resolveCssColor - oklab() / oklch()', () => {
    test('oklab() 을 hex 로 변환한다', () => {
        expect(resolveCssColor('oklab(1 0 0)')).toEqual({ color: '#ffffff', alpha: 1 })
        expect(resolveCssColor('oklab(0% 0 0)')).toEqual({ color: '#000000', alpha: 1 })
        expect(resolveCssColor('oklab(0.628 0.2249 0.1258)')).toEqual({ color: '#ff0000', alpha: 1 })
    })

    test('oklch() 는 같은 색의 oklab() 과 일치한다', () => {
        expect(resolveCssColor('oklch(62.8% 0.2577 29.23)').color).toBe(resolveCssColor('oklab(0.628 0.2249 0.1258)').color)
    })

    test('토큰 값 oklch(0.985 0 0) 은 밝은 회색이다', () => {
        expect(resolveCssColor('oklch(0.985 0 0)')).toEqual({ color: '#fafafa', alpha: 1 })
    })
})

describe('resolveCssColor - 그 외 표기', () => {
    test('color(srgb ...) 를 hex 와 알파로 나눈다', () => {
        expect(resolveCssColor('color(srgb 1 0 0)')).toEqual({ color: '#ff0000', alpha: 1 })
        expect(resolveCssColor('color(srgb 0 0.5 1 / 0.4)')).toEqual({ color: '#0080ff', alpha: 0.4 })
    })

    test('rgb() 는 hex 로, 알파는 따로 돌려준다', () => {
        expect(resolveCssColor('rgb(255, 0, 0)')).toEqual({ color: '#ff0000', alpha: 1 })
        expect(resolveCssColor('rgba(0, 0, 0, 0.1)')).toEqual({ color: '#000000', alpha: 0.1 })
        expect(resolveCssColor('rgb(0 128 255 / 50%)')).toEqual({ color: '#0080ff', alpha: 0.5 })
    })

    test('three 가 읽을 수 있는 값은 그대로 통과시킨다', () => {
        expect(resolveCssColor('#123456')).toEqual({ color: '#123456', alpha: 1 })
        expect(resolveCssColor(' red ')).toEqual({ color: 'red', alpha: 1 })
    })

    test('읽을 수 없는 값은 안전한 기본색으로 대체한다', () => {
        expect(resolveCssColor('currentcolor').color).toBe('#808080')
        expect(resolveCssColor('').color).toBe('#808080')
        expect(resolveCssColor('color(display-p3 1 0 0)').color).toBe('#808080')
    })
})
