import { describe, expect, test } from 'bun:test'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { tripTemplateSchema } from '@/shared/lib/trip-template'

const SCHEDULE_ITEM_COUNT = 65
const ROUTE_COUNT = 16
const MAP_LINK_COUNT = 38
const DAY_NOTE_COUNT = 35
const INFO_BLOCK_COUNT = 26

const parsed = tripTemplateSchema.parse(OSAKA_TRIP_TEMPLATE)

const scheduleItems = parsed.days.flatMap((day) => day.scheduleItems)

describe('오사카 템플릿 스키마', () => {
    test('tripTemplateSchema 로 파싱된다', () => {
        expect(tripTemplateSchema.safeParse(OSAKA_TRIP_TEMPLATE).success).toBe(true)
    })

    test('여행 기본 정보가 원본과 일치한다', () => {
        expect(parsed.title).toBe('오사카 여행 노트')
        expect(parsed.eyebrow).toBe('KANSAI / OCTOBER 2026')
        expect(parsed.destination).toBe('오사카')
        expect(parsed.departureAirportCode).toBe('ICN')
        expect(parsed.startDate).toBe('2026-10-01')
        expect(parsed.endDate).toBe('2026-10-07')
        expect(parsed.customNights).toBe(6)
        expect(parsed.customDays).toBe(7)
        expect(parsed.periodNote).toBe('예비일 하루')
        expect(parsed.verifiedOn).toBe('2026-09-09')
    })

    test('기본 일정 종류 3가지를 담는다', () => {
        expect(parsed.scheduleKinds.map((kind) => kind.key)).toEqual(['planned', 'confirmed', 'target'])
        expect(parsed.scheduleKinds.map((kind) => kind.colorToken)).toEqual(['muted', 'success', 'warning'])
        expect(parsed.scheduleKinds[1]?.legendLabel).toBe('항공편·공식 셔틀')
    })

    test('모든 일정 항목이 종류 목록의 키를 가리킨다', () => {
        const keys = new Set(parsed.scheduleKinds.map((kind) => kind.key))
        expect(scheduleItems.every((item) => keys.has(item.kind))).toBe(true)
    })

    test('사이드바 소개 문구와 링크는 비어 있다', () => {
        expect(parsed.sidebarNote).toBeNull()
        expect(parsed.sidebarLinks).toEqual([])
    })
})

describe('오사카 템플릿 전수 이식 수량', () => {
    test('항공편 2건, 숙소 1건이다', () => {
        expect(parsed.flights).toHaveLength(2)
        expect(parsed.lodgings).toHaveLength(1)
    })

    test('날짜는 7일이며 10/1~10/7 순서다', () => {
        expect(parsed.days).toHaveLength(7)
        expect(parsed.days.map((day) => day.date)).toEqual([
            '2026-10-01',
            '2026-10-02',
            '2026-10-03',
            '2026-10-04',
            '2026-10-05',
            '2026-10-06',
            '2026-10-07',
        ])
    })

    test('일정 행은 65건이다', () => {
        expect(scheduleItems).toHaveLength(SCHEDULE_ITEM_COUNT)
    })

    test('이동 경로는 16건이다', () => {
        expect(parsed.days.flatMap((day) => day.routes)).toHaveLength(ROUTE_COUNT)
    })

    test('지도 질의를 가진 일정은 38건이다', () => {
        expect(scheduleItems.filter((item) => item.mapQuery !== null)).toHaveLength(MAP_LINK_COUNT)
    })

    test('참고 목록은 35건이다', () => {
        expect(parsed.days.flatMap((day) => day.notes)).toHaveLength(DAY_NOTE_COUNT)
    })

    test('예매 항목은 9건이다', () => {
        expect(parsed.bookings).toHaveLength(9)
    })

    test('정보 섹션은 4개, 블록은 26개다', () => {
        expect(parsed.infoSections).toHaveLength(4)
        expect(parsed.infoSections.flatMap((section) => section.blocks)).toHaveLength(INFO_BLOCK_COUNT)
    })
})

describe('오사카 템플릿 주요 값', () => {
    test('첫날 첫 일정은 확정 항공 구간이다', () => {
        const first = parsed.days[0]?.scheduleItems[0]
        expect(first?.title).toBe('인천 제2터미널 → 칸사이 제1터미널')
        expect(first?.kind).toBe('confirmed')
        expect(first?.timeLabel).toBe('16:10~18:05')
        expect(first?.bufferNote).toBeNull()
    })

    test('예비일에는 일정 행이 없다', () => {
        expect(parsed.days[5]?.shortLabel).toBe('예비일')
        expect(parsed.days[5]?.scheduleItems).toHaveLength(0)
    })

    test('첫 예매 항목은 우선순위 1이다', () => {
        expect(parsed.bookings[0]?.title).toBe('키린 코베공장')
        expect(parsed.bookings[0]?.priority).toBe('p1')
    })

    test('정보 섹션 순서와 기본 열림 상태가 원본과 같다', () => {
        expect(parsed.infoSections.map((section) => section.title)).toEqual([
            '일정의 기준',
            '전체 일정',
            '숙소와 교통 거점',
            '아직 확정되지 않은 항목',
        ])
        expect(parsed.infoSections.map((section) => section.isDefaultOpen)).toEqual([false, false, false, true])
    })

    test('전체 일정 요약이 날짜별로 채워진다', () => {
        expect(parsed.days[1]?.morningSummary).toBe('히메지성')
        expect(parsed.days[6]?.eveningSummary).toBeNull()
    })
})
