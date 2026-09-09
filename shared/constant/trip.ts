export const SCHEDULE_KINDS = ['planned', 'confirmed', 'target'] as const
export type ScheduleKind = (typeof SCHEDULE_KINDS)[number]

export const SCHEDULE_KIND_LABEL = {
    planned: '계획',
    confirmed: '확정 시각',
    target: '예매 목표',
} as const satisfies Record<ScheduleKind, string>

export const SCHEDULE_BUFFER_LABEL = {
    planned: '마지막 10분 여유',
    confirmed: '전후 여유 10분',
    target: '마지막 10분 여유',
} as const satisfies Record<ScheduleKind, string>

export const BOOKING_PRIORITIES = ['p1', 'p2', 'p3', 'onsite'] as const
export type BookingPriority = (typeof BOOKING_PRIORITIES)[number]

export const BOOKING_PRIORITY_LABEL = {
    p1: '우선순위 1',
    p2: '우선순위 2',
    p3: '우선순위 3',
    onsite: '우선순위 현장',
} as const satisfies Record<BookingPriority, string>

export const INFO_BLOCK_KINDS = ['paragraph', 'bullet', 'heading', 'day_table'] as const
export type InfoBlockKind = (typeof INFO_BLOCK_KINDS)[number]

export const INFO_BLOCK_KIND_LABEL = {
    paragraph: '문단',
    bullet: '목록 항목',
    heading: '소제목',
    day_table: '전체 일정 표',
} as const satisfies Record<InfoBlockKind, string>

export const MEMBER_ROLES = ['owner', 'editor', 'viewer'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const MEMBER_ROLE_LABEL = {
    owner: '소유자',
    editor: '편집자',
    viewer: '열람자',
} as const satisfies Record<MemberRole, string>

export const FLIGHT_DIRECTIONS = ['outbound', 'inbound'] as const
export type FlightDirection = (typeof FLIGHT_DIRECTIONS)[number]

export const FLIGHT_DIRECTION_LABEL = {
    outbound: '출국',
    inbound: '귀국',
} as const satisfies Record<FlightDirection, string>

export const TRIP_VIEWS = ['itinerary', 'bookings', 'info'] as const
export type TripView = (typeof TRIP_VIEWS)[number]

export const TRIP_VIEW_LABEL = {
    itinerary: '날짜별 일정',
    bookings: '예매 체크',
    info: '여행 정보',
} as const satisfies Record<TripView, string>

export const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query='

export const buildMapUrl = (query: string) => `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(query)}`

export const HOME_AIRPORT_CODE = 'ICN'

export const TRIP_DESTINATION_MIN_COUNT = 1

export const TRIP_DESTINATION_CITY_MAX_LENGTH = 80
