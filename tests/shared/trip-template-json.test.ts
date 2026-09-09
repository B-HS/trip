import { describe, expect, test } from 'bun:test'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { parseTripTemplateJson } from '@/shared/lib/trip-template'

const JSON_INDENT = 4

describe('parseTripTemplateJson', () => {
    test('내보낸 형식의 JSON 을 템플릿으로 파싱한다', () => {
        const parsed = parseTripTemplateJson(JSON.stringify(OSAKA_TRIP_TEMPLATE, null, JSON_INDENT))
        expect(parsed?.title).toBe('오사카 여행 노트')
        expect(parsed?.days.length).toBe(OSAKA_TRIP_TEMPLATE.days.length)
    })

    test('사이드바 링크가 http 주소가 아니면 null 을 반환한다', () => {
        const template = { ...OSAKA_TRIP_TEMPLATE, sidebarLinks: [{ label: '안내', url: 'javascript:alert(1)', description: null }] }
        expect(parseTripTemplateJson(JSON.stringify(template))).toBeNull()
    })

    test('사이드바 소개 문구와 링크를 함께 파싱한다', () => {
        const template = {
            ...OSAKA_TRIP_TEMPLATE,
            sidebarNote: '예매 링크를 모아 두었습니다.',
            sidebarLinks: [{ label: '공식 예매', url: 'https://ticket.example.com', description: null }],
        }
        const parsed = parseTripTemplateJson(JSON.stringify(template))
        expect(parsed?.sidebarNote).toBe('예매 링크를 모아 두었습니다.')
        expect(parsed?.sidebarLinks[0]?.label).toBe('공식 예매')
    })

    test('JSON 이 아니면 null 을 반환한다', () => {
        expect(parseTripTemplateJson('트립 아님')).toBeNull()
    })

    test('스키마에 맞지 않으면 null 을 반환한다', () => {
        expect(parseTripTemplateJson(JSON.stringify({ title: '제목만 있는 JSON' }))).toBeNull()
    })

    test('배열이나 원시값이면 null 을 반환한다', () => {
        expect(parseTripTemplateJson('[]')).toBeNull()
        expect(parseTripTemplateJson('42')).toBeNull()
    })
})
