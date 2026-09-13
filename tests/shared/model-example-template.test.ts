import { describe, expect, test } from 'bun:test'
import { MODEL_EXAMPLE_TRIP_TEMPLATE } from '@/shared/constant/template/model-example'
import { tripTemplateSchema } from '@/shared/lib/trip-template'

const SCHEDULE_ITEM_COUNT = 41
const ROUTE_COUNT = 13
const MAP_LINK_COUNT = 36
const DAY_NOTE_COUNT = 6
const INFO_BLOCK_COUNT = 12

const parsed = tripTemplateSchema.parse(MODEL_EXAMPLE_TRIP_TEMPLATE)
const scheduleItems = parsed.days.flatMap((day) => day.scheduleItems)

describe('모델 예시 템플릿 스키마', () => {
    test('tripTemplateSchema 로 파싱된다', () => {
        expect(tripTemplateSchema.safeParse(MODEL_EXAMPLE_TRIP_TEMPLATE).success).toBe(true)
    })

    test('타이베이 기본 정보와 현실적인 기간을 담는다', () => {
        expect(parsed.title).toBe('타이베이 모델 일정')
        expect(parsed.destination).toBe('타이베이')
        expect(parsed.departureAirportCode).toBe('ICN')
        expect(parsed.startDate).toBe('2026-11-05')
        expect(parsed.endDate).toBe('2026-11-09')
        expect(parsed.customNights).toBe(4)
        expect(parsed.customDays).toBe(5)
        expect(parsed.periodNote).toBe('도시 3일 + 근교 1일')
        expect(parsed.verifiedOn).toBeNull()
        expect(parsed.disclaimer).toContain('계획값')
    })

    test('다중 목적지와 출발·귀국 항공편을 담는다', () => {
        expect(parsed.destinations).toEqual([
            { countryCode: 'TW', city: '타이베이' },
            { countryCode: 'TW', city: '지우펀' },
        ])
        expect(parsed.flights.map((flight) => [flight.direction, flight.departCode, flight.arriveCode])).toEqual([
            ['outbound', 'ICN', 'TPE'],
            ['inbound', 'TPE', 'ICN'],
        ])
    })

    test('기본 일정 종류와 사용자 정의 여유 종류가 범례를 구성한다', () => {
        expect(parsed.scheduleKinds.map((kind) => kind.key)).toEqual(['planned', 'confirmed', 'target', 'flexible'])
        expect(parsed.scheduleKinds.map((kind) => kind.colorToken)).toEqual(['muted', 'success', 'warning', 'chart-2'])
        expect(parsed.scheduleKinds[3]?.legendLabel).toBe('식사·휴식·대안 일정')
        expect(new Set(scheduleItems.map((item) => item.kind))).toEqual(new Set(parsed.scheduleKinds.map((kind) => kind.key)))
    })

    test('사이드바 메모·공식 링크와 링크 전용 첨부를 포함한다', () => {
        expect(parsed.sidebarNote).toContain('예시')
        expect(parsed.sidebarLinks).toHaveLength(3)
        expect(parsed.sidebarLinks.every((link) => link.url.startsWith('https://'))).toBe(true)
        expect(parsed.bookings.flatMap((booking) => booking.attachments)).toHaveLength(2)
        expect(parsed.bookings.flatMap((booking) => booking.attachments).every((attachment) => attachment.kind === 'link')).toBe(true)
    })
})

describe('모델 예시 템플릿 전수 커버리지', () => {
    test('날짜는 5일이며 11/5~11/9 순서다', () => {
        expect(parsed.days).toHaveLength(5)
        expect(parsed.days.map((day) => day.date)).toEqual(['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'])
    })

    test('인쇄 레이아웃을 고려한 일정·경로·지도 질의 수량이다', () => {
        expect(scheduleItems).toHaveLength(SCHEDULE_ITEM_COUNT)
        expect(Math.max(...parsed.days.map((day) => day.scheduleItems.length))).toBeLessThanOrEqual(9)
        expect(parsed.days.flatMap((day) => day.routes)).toHaveLength(ROUTE_COUNT)
        expect(scheduleItems.filter((item) => item.mapQuery !== null)).toHaveLength(MAP_LINK_COUNT)
    })

    test('날짜 메모·예매 체크리스트·정보 섹션을 채운다', () => {
        expect(parsed.days.flatMap((day) => day.notes)).toHaveLength(DAY_NOTE_COUNT)
        expect(parsed.bookings).toHaveLength(8)
        expect(parsed.bookings.filter((booking) => booking.priority === 'p1')).toHaveLength(2)
        expect(parsed.bookings.some((booking) => booking.priority === 'onsite')).toBe(true)
        expect(parsed.infoSections).toHaveLength(4)
        expect(parsed.infoSections.flatMap((section) => section.blocks)).toHaveLength(INFO_BLOCK_COUNT)
        expect(parsed.infoSections.flatMap((section) => section.blocks).some((block) => block.kind === 'day_table')).toBe(true)
    })
})
