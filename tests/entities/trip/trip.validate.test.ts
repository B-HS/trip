import { describe, expect, test } from 'bun:test'
import {
    bookingListSchema,
    dayIdListSchema,
    dayInputSchema,
    dayMemoSchema,
    destinationListSchema,
    flightListSchema,
    infoSectionListSchema,
    memberInviteSchema,
    memberRoleSchema,
    scheduleKindListSchema,
    shareSettingsSchema,
    sidebarSchema,
    tripBasicsFormSchema,
    tripBasicsSchema,
    tripCreateSchema,
    tripIdSchema,
} from '@/entities/trip/trip.validate'

const TRIP_ID = '3f1a2b6c-4d5e-4f70-8a9b-0c1d2e3f4a5b'
const KIND_ID = '8c7d6e5f-4a3b-4c2d-9e8f-1a2b3c4d5e6f'
const UPLOAD_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
const DAY_MEMO_MAX_LENGTH = 4000
const CITY_MAX_LENGTH = 80

const basics = {
    title: '오사카 여행 노트',
    destination: '오사카',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
}

const flight = {
    direction: 'outbound',
    label: '10.01 목 · 출국',
    departCode: 'ICN',
    departTime: '16:10',
    arriveCode: 'KIX',
    arriveTime: '17:55',
}

describe('tripBasicsSchema', () => {
    test('필수 항목만으로 파싱되고 선택 항목은 null 로 채워진다', () => {
        const parsed = tripBasicsSchema.parse(basics)
        expect(parsed.title).toBe('오사카 여행 노트')
        expect(parsed.eyebrow).toBeNull()
        expect(parsed.verifiedOn).toBeNull()
    })

    test('종료일이 시작일보다 빠르면 실패한다', () => {
        expect(() => tripBasicsSchema.parse({ ...basics, endDate: '2026-09-30' })).toThrow()
    })

    test('시작일과 종료일이 같으면 통과한다', () => {
        expect(tripBasicsSchema.parse({ ...basics, endDate: basics.startDate }).endDate).toBe(basics.startDate)
    })

    test('날짜 형식이 어긋나면 실패한다', () => {
        expect(() => tripBasicsSchema.parse({ ...basics, startDate: '2026/10/01' })).toThrow()
    })

    test('제목이 비어 있으면 실패한다', () => {
        expect(() => tripBasicsSchema.parse({ ...basics, title: '' })).toThrow()
    })
})

describe('destinationListSchema', () => {
    test('나라 코드만으로 파싱하고 도시는 null 로 채운다', () => {
        const parsed = destinationListSchema.parse([{ countryCode: 'JP' }])
        expect(parsed[0]?.countryCode).toBe('JP')
        expect(parsed[0]?.city).toBeNull()
        expect(parsed[0]?.id).toBeUndefined()
    })

    test('나라 코드가 목록에 없으면 실패한다', () => {
        expect(() => destinationListSchema.parse([{ countryCode: 'ZZ' }])).toThrow()
        expect(() => destinationListSchema.parse([{ countryCode: 'jp' }])).toThrow()
    })

    test('기존 항목은 uuid id 를 유지한다', () => {
        expect(destinationListSchema.parse([{ countryCode: 'JP', id: TRIP_ID }])[0]?.id).toBe(TRIP_ID)
    })

    test('도시가 80자를 넘으면 실패한다', () => {
        expect(() => destinationListSchema.parse([{ countryCode: 'JP', city: 'ㅁ'.repeat(CITY_MAX_LENGTH + 1) }])).toThrow()
    })

    test('빈 목록도 허용한다', () => {
        expect(destinationListSchema.parse([])).toEqual([])
    })
})

describe('tripCreateSchema / tripBasicsFormSchema', () => {
    test('생성 입력은 목적지를 한 곳 이상 요구한다', () => {
        expect(() => tripCreateSchema.parse({ ...basics, destinations: [] })).toThrow()
        expect(tripCreateSchema.parse({ ...basics, destinations: [{ countryCode: 'JP', city: '오사카' }] }).destinations).toHaveLength(1)
    })

    test('편집 폼 입력은 목적지가 비어도 통과한다', () => {
        expect(tripBasicsFormSchema.parse({ ...basics, destinations: [] }).destinations).toEqual([])
    })

    test('편집 폼 입력도 기간 순서를 검사한다', () => {
        expect(() => tripBasicsFormSchema.parse({ ...basics, endDate: '2026-09-30', destinations: [] })).toThrow()
    })
})

describe('flightListSchema', () => {
    test('id 없이 새 항목을 파싱한다', () => {
        const parsed = flightListSchema.parse([flight])
        expect(parsed[0]?.id).toBeUndefined()
        expect(parsed[0]?.departTerminal).toBeNull()
    })

    test('기존 항목은 uuid id 를 유지한다', () => {
        expect(flightListSchema.parse([{ ...flight, id: TRIP_ID }])[0]?.id).toBe(TRIP_ID)
    })

    test('uuid 가 아닌 id 는 실패한다', () => {
        expect(() => flightListSchema.parse([{ ...flight, id: 'not-a-uuid' }])).toThrow()
    })

    test('방향 값이 목록에 없으면 실패한다', () => {
        expect(() => flightListSchema.parse([{ ...flight, direction: 'roundtrip' }])).toThrow()
    })
})

describe('dayInputSchema', () => {
    test('하위 목록이 없으면 빈 배열로 채운다', () => {
        const parsed = dayInputSchema.parse({ date: '2026-10-01', shortLabel: '1일차', title: '도착' })
        expect(parsed.facts).toEqual([])
        expect(parsed.routes).toEqual([])
        expect(parsed.scheduleItems).toEqual([])
        expect(parsed.notes).toEqual([])
    })

    test('일정 항목은 종류 id 를 그대로 담는다', () => {
        const parsed = dayInputSchema.parse({
            date: '2026-10-01',
            shortLabel: '1일차',
            title: '도착',
            scheduleItems: [{ timeLabel: '16:10', title: '인천 출발', kindId: KIND_ID }],
        })
        expect(parsed.scheduleItems[0]?.kindId).toBe(KIND_ID)
    })

    test('일정 항목의 종류 id 가 uuid 가 아니면 실패한다', () => {
        expect(() =>
            dayInputSchema.parse({
                date: '2026-10-01',
                shortLabel: '1일차',
                title: '도착',
                scheduleItems: [{ timeLabel: '16:10', title: '인천 출발', kindId: 'planned' }],
            }),
        ).toThrow()
    })

    test('이동 시간이 음수면 실패한다', () => {
        expect(() =>
            dayInputSchema.parse({
                date: '2026-10-01',
                shortLabel: '1일차',
                title: '도착',
                routes: [{ origin: '난바', destination: '우메다', minutes: -1 }],
            }),
        ).toThrow()
    })
})

describe('infoSectionListSchema / bookingListSchema', () => {
    test('정보 섹션의 블록 기본값을 채운다', () => {
        const parsed = infoSectionListSchema.parse([{ title: '교통' }])
        expect(parsed[0]?.blocks).toEqual([])
        expect(parsed[0]?.isDefaultOpen).toBe(false)
    })

    test('예매 항목의 기본 우선순위는 p2 다', () => {
        expect(bookingListSchema.parse([{ title: '키린 공장 견학' }])[0]?.priority).toBe('p2')
    })

    test('링크가 URL 이 아니면 실패한다', () => {
        expect(() => bookingListSchema.parse([{ title: '키린 공장 견학', linkUrl: 'kirin' }])).toThrow()
    })

    test('첨부가 없으면 빈 배열로 채운다', () => {
        expect(bookingListSchema.parse([{ title: '키린 공장 견학' }])[0]?.attachments).toEqual([])
    })

    test('이미지 첨부의 업로드 id 와 라벨을 파싱한다', () => {
        const parsed = bookingListSchema.parse([
            {
                title: '키린 공장 견학',
                attachments: [{ kind: 'image', url: 'https://cdn.example.com/uploads/booking/2026/a.jpg', uploadId: UPLOAD_ID }],
            },
        ])
        expect(parsed[0]?.attachments[0]?.kind).toBe('image')
        expect(parsed[0]?.attachments[0]?.uploadId).toBe(UPLOAD_ID)
        expect(parsed[0]?.attachments[0]?.label).toBeNull()
    })

    test('첨부 종류를 지정하지 않으면 링크로 본다', () => {
        const parsed = bookingListSchema.parse([{ title: '키린 공장 견학', attachments: [{ url: 'https://ticket.example.com' }] }])
        expect(parsed[0]?.attachments[0]?.kind).toBe('link')
        expect(parsed[0]?.attachments[0]?.uploadId).toBeNull()
    })

    test('첨부 주소가 http 가 아니면 실패한다', () => {
        expect(() => bookingListSchema.parse([{ title: '키린 공장 견학', attachments: [{ url: 'javascript:alert(1)' }] }])).toThrow()
    })
})

describe('sidebarSchema', () => {
    test('소개 문구가 없으면 null 로 채우고 링크는 그대로 파싱한다', () => {
        const parsed = sidebarSchema.parse({ links: [{ label: '공식 예매', url: 'https://ticket.example.com' }] })
        expect(parsed.sidebarNote).toBeNull()
        expect(parsed.links[0]?.label).toBe('공식 예매')
        expect(parsed.links[0]?.description).toBeNull()
        expect(parsed.links[0]?.id).toBeUndefined()
    })

    test('http 와 https 주소만 허용한다', () => {
        expect(sidebarSchema.parse({ links: [{ label: '안내', url: 'http://example.com' }] }).links).toHaveLength(1)
        expect(() => sidebarSchema.parse({ links: [{ label: '안내', url: 'javascript:alert(1)' }] })).toThrow()
        expect(() => sidebarSchema.parse({ links: [{ label: '안내', url: 'mailto:guest@example.com' }] })).toThrow()
        expect(() => sidebarSchema.parse({ links: [{ label: '안내', url: 'example.com' }] })).toThrow()
    })

    test('라벨이 비어 있으면 실패한다', () => {
        expect(() => sidebarSchema.parse({ links: [{ label: '', url: 'https://example.com' }] })).toThrow()
    })

    test('기본 정보 스키마에는 사이드바 값이 섞이지 않는다', () => {
        const parsed = tripBasicsSchema.parse({ ...basics, sidebarNote: '섞이면 안 됩니다.' })
        expect('sidebarNote' in parsed).toBe(false)
        expect('sidebarLinks' in parsed).toBe(false)
    })
})

describe('memberInviteSchema / memberRoleSchema', () => {
    test('이메일과 역할을 파싱한다', () => {
        expect(memberInviteSchema.parse({ email: 'guest@example.com', role: 'viewer' }).role).toBe('viewer')
    })

    test('이메일 형식이 아니면 실패한다', () => {
        expect(() => memberInviteSchema.parse({ email: 'guest', role: 'viewer' })).toThrow()
    })

    test('owner 역할로는 초대할 수 없다', () => {
        expect(() => memberInviteSchema.parse({ email: 'guest@example.com', role: 'owner' })).toThrow()
        expect(() => memberRoleSchema.parse('owner')).toThrow()
    })
})

describe('shareSettingsSchema', () => {
    test('slug 없이 공개 여부만 보낼 수 있다', () => {
        expect(shareSettingsSchema.parse({ isPublic: true }).slug).toBeUndefined()
    })

    test('소문자·숫자·하이픈 slug 를 허용한다', () => {
        expect(shareSettingsSchema.parse({ isPublic: true, slug: 'osaka-2026' }).slug).toBe('osaka-2026')
    })

    test('대문자나 공백이 있으면 실패한다', () => {
        expect(() => shareSettingsSchema.parse({ isPublic: true, slug: 'Osaka 2026' })).toThrow()
    })

    test('3자 미만이면 실패한다', () => {
        expect(() => shareSettingsSchema.parse({ isPublic: true, slug: 'ab' })).toThrow()
    })
})

describe('dayMemoSchema / tripIdSchema / dayIdListSchema', () => {
    test('메모는 4000자까지 허용한다', () => {
        expect(dayMemoSchema.parse({ content: 'ㅁ'.repeat(DAY_MEMO_MAX_LENGTH) }).content.length).toBe(DAY_MEMO_MAX_LENGTH)
    })

    test('메모가 4000자를 넘으면 실패한다', () => {
        expect(() => dayMemoSchema.parse({ content: 'ㅁ'.repeat(DAY_MEMO_MAX_LENGTH + 1) })).toThrow()
    })

    test('여행 id 는 uuid 여야 한다', () => {
        expect(tripIdSchema.parse(TRIP_ID)).toBe(TRIP_ID)
        expect(() => tripIdSchema.parse('trip-1')).toThrow()
    })

    test('날짜 순서 목록은 비어 있을 수 없다', () => {
        expect(() => dayIdListSchema.parse([])).toThrow()
        expect(dayIdListSchema.parse([TRIP_ID])).toEqual([TRIP_ID])
    })
})

describe('scheduleKindListSchema', () => {
    const kind = { key: 'planned', label: '계획', legendLabel: '계획 일정', bufferLabel: null }

    test('색 토큰이 없으면 muted 로 채운다', () => {
        expect(scheduleKindListSchema.parse([kind])[0]?.colorToken).toBe('muted')
    })

    test('목록이 비어 있으면 실패한다', () => {
        expect(() => scheduleKindListSchema.parse([])).toThrow()
    })

    test('키가 중복되면 실패한다', () => {
        expect(() => scheduleKindListSchema.parse([kind, { ...kind, label: '계획 2' }])).toThrow()
    })

    test('키에 대문자가 들어가면 실패한다', () => {
        expect(() => scheduleKindListSchema.parse([{ ...kind, key: 'Planned' }])).toThrow()
    })

    test('색 토큰이 팔레트에 없으면 실패한다', () => {
        expect(() => scheduleKindListSchema.parse([{ ...kind, colorToken: 'pink' }])).toThrow()
    })
})
