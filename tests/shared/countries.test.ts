import { describe, expect, test } from 'bun:test'
import { COUNTRIES, COUNTRY_CODES, countryName, isCountryCode } from '@/shared/constant/countries'

const MIN_COUNTRY_COUNT = 80
const MAX_LATITUDE = 90
const MAX_LONGITUDE = 180
const ALPHA2_PATTERN = /^[A-Z]{2}$/

describe('COUNTRY_CODES', () => {
    test('80개 이상의 나라를 담는다', () => {
        expect(COUNTRY_CODES.length).toBeGreaterThanOrEqual(MIN_COUNTRY_COUNT)
    })

    test('코드가 중복되지 않는다', () => {
        expect(new Set(COUNTRY_CODES).size).toBe(COUNTRY_CODES.length)
    })

    test('모든 코드는 ISO 3166-1 alpha-2 형식이다', () => {
        COUNTRY_CODES.forEach((code) => expect(ALPHA2_PATTERN.test(code)).toBe(true))
    })

    test('한국어 이름과 영어 이름이 비어 있지 않다', () => {
        COUNTRY_CODES.forEach((code) => {
            expect(COUNTRIES[code].name.length).toBeGreaterThan(0)
            expect(COUNTRIES[code].nameEn.length).toBeGreaterThan(0)
        })
    })

    test('아시아·유럽·아메리카·오세아니아·중동·아프리카를 모두 포함한다', () => {
        expect(COUNTRY_CODES).toContain('JP')
        expect(COUNTRY_CODES).toContain('FR')
        expect(COUNTRY_CODES).toContain('US')
        expect(COUNTRY_CODES).toContain('AU')
        expect(COUNTRY_CODES).toContain('AE')
        expect(COUNTRY_CODES).toContain('EG')
    })
})

describe('좌표', () => {
    test('위도는 -90 에서 90 사이다', () => {
        COUNTRY_CODES.forEach((code) => {
            expect(Number.isFinite(COUNTRIES[code].lat)).toBe(true)
            expect(Math.abs(COUNTRIES[code].lat)).toBeLessThanOrEqual(MAX_LATITUDE)
        })
    })

    test('경도는 -180 에서 180 사이다', () => {
        COUNTRY_CODES.forEach((code) => {
            expect(Number.isFinite(COUNTRIES[code].lng)).toBe(true)
            expect(Math.abs(COUNTRIES[code].lng)).toBeLessThanOrEqual(MAX_LONGITUDE)
        })
    })

    test('같은 좌표를 쓰는 나라가 없다', () => {
        const points = COUNTRY_CODES.map((code) => `${COUNTRIES[code].lat},${COUNTRIES[code].lng}`)
        expect(new Set(points).size).toBe(points.length)
    })
})

describe('isCountryCode / countryName', () => {
    test('목록에 있는 코드만 통과한다', () => {
        expect(isCountryCode('JP')).toBe(true)
        expect(isCountryCode('ZZ')).toBe(false)
        expect(isCountryCode('jp')).toBe(false)
    })

    test('객체 프로토타입 키는 코드로 보지 않는다', () => {
        expect(isCountryCode('toString')).toBe(false)
        expect(isCountryCode('constructor')).toBe(false)
    })

    test('모르는 코드는 코드를 그대로 돌려준다', () => {
        expect(countryName('JP')).toBe('일본')
        expect(countryName('ZZ')).toBe('ZZ')
    })

    test('현재 locale에 맞는 국가명을 돌려준다', () => {
        expect(countryName('JP', 'en')).toBe('Japan')
        expect(countryName('JP', 'ja')).toBe('日本')
    })
})
