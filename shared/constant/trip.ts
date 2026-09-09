export const SCHEDULE_KIND_COLOR_TOKENS = [
    'muted',
    'success',
    'warning',
    'destructive',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
] as const
export type ScheduleKindColorToken = (typeof SCHEDULE_KIND_COLOR_TOKENS)[number]

export const SCHEDULE_KIND_KEY_MAX_LENGTH = 40
export const SCHEDULE_KIND_LABEL_MAX_LENGTH = 40
export const SCHEDULE_KIND_LEGEND_LABEL_MAX_LENGTH = 80
export const SCHEDULE_KIND_BUFFER_LABEL_MAX_LENGTH = 80
export const SCHEDULE_KIND_MIN_COUNT = 1
export const SCHEDULE_KIND_MAX_COUNT = 12

export const SCHEDULE_KIND_KEY_PATTERN = /^[a-z0-9-]+$/

export type ScheduleKindDefinition = {
    key: string
    label: string
    legendLabel: string
    colorToken: ScheduleKindColorToken
    bufferLabel: string | null
}

export const DEFAULT_SCHEDULE_KINDS: ScheduleKindDefinition[] = [
    { key: 'planned', label: '계획', legendLabel: '계획 일정', colorToken: 'muted', bufferLabel: '마지막 10분 여유' },
    { key: 'confirmed', label: '확정 시각', legendLabel: '항공편·공식 셔틀', colorToken: 'success', bufferLabel: '전후 여유 10분' },
    { key: 'target', label: '예매 목표', legendLabel: '예매 목표·미확정', colorToken: 'warning', bufferLabel: '마지막 10분 여유' },
]

export const DEFAULT_SCHEDULE_KIND_KEY = 'planned'

export const SCHEDULE_KIND_COLOR_TOKEN_LABEL = {
    'muted': '기본 회색',
    'success': '초록',
    'warning': '노랑',
    'destructive': '빨강',
    'chart-1': '강조 1',
    'chart-2': '강조 2',
    'chart-3': '강조 3',
    'chart-4': '강조 4',
    'chart-5': '강조 5',
} as const satisfies Record<ScheduleKindColorToken, string>

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

export const TRIP_LENGTH_MIN = 0

export const TRIP_LENGTH_MAX = 365
