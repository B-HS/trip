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

const DEFAULT_SCHEDULE_KINDS_BY_LOCALE = {
    en: [
        { key: 'planned', label: 'Planned', legendLabel: 'Planned schedule', colorToken: 'muted', bufferLabel: '10-minute buffer at the end' },
        {
            key: 'confirmed',
            label: 'Confirmed time',
            legendLabel: 'Flights and official shuttles',
            colorToken: 'success',
            bufferLabel: '10-minute buffer before and after',
        },
        {
            key: 'target',
            label: 'Booking target',
            legendLabel: 'Booking target · unconfirmed',
            colorToken: 'warning',
            bufferLabel: '10-minute buffer at the end',
        },
    ],
    ja: [
        { key: 'planned', label: '予定', legendLabel: '予定行程', colorToken: 'muted', bufferLabel: '最後に10分の余裕' },
        { key: 'confirmed', label: '確定時刻', legendLabel: '航空便・公式シャトル', colorToken: 'success', bufferLabel: '前後に10分の余裕' },
        { key: 'target', label: '予約目標', legendLabel: '予約目標・未確定', colorToken: 'warning', bufferLabel: '最後に10分の余裕' },
    ],
    ko: DEFAULT_SCHEDULE_KINDS,
} as const satisfies Record<'en' | 'ja' | 'ko', readonly ScheduleKindDefinition[]>

export const getDefaultScheduleKinds = (locale: string): ScheduleKindDefinition[] =>
    DEFAULT_SCHEDULE_KINDS_BY_LOCALE[locale === 'en' || locale === 'ja' ? locale : 'ko'].map((kind) => ({ ...kind }))

export const DEFAULT_SCHEDULE_KIND_KEY = 'planned'

export const BOOKING_PRIORITIES = ['p1', 'p2', 'p3', 'onsite'] as const
export type BookingPriority = (typeof BOOKING_PRIORITIES)[number]

export const INFO_BLOCK_KINDS = ['paragraph', 'bullet', 'heading', 'day_table'] as const
export type InfoBlockKind = (typeof INFO_BLOCK_KINDS)[number]

export const MEMBER_ROLES = ['owner', 'editor', 'viewer'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const FLIGHT_DIRECTIONS = ['outbound', 'inbound'] as const
export type FlightDirection = (typeof FLIGHT_DIRECTIONS)[number]

export const TRIP_VIEWS = ['itinerary', 'bookings', 'info'] as const
export type TripView = (typeof TRIP_VIEWS)[number]

export const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query='

export const buildMapUrl = (query: string) => `${GOOGLE_MAPS_SEARCH_URL}${encodeURIComponent(query)}`

export const HOME_AIRPORT_CODE = 'ICN'

export const TRIP_DESTINATION_MIN_COUNT = 1

export const TRIP_DESTINATION_CITY_MAX_LENGTH = 80

export const TRIP_LENGTH_MIN = 0

export const TRIP_LENGTH_MAX = 365
