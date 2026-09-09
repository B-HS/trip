export const EDITOR_TABS = ['basics', 'travel', 'days', 'bookings', 'info', 'share'] as const

export type EditorTab = (typeof EDITOR_TABS)[number]

export const EDITOR_TAB_PARAM = 'tab'

export const DEFAULT_EDITOR_TAB = 'basics' satisfies EditorTab

export const EDITOR_TAB_LABEL = {
    basics: '기본 정보',
    travel: '항공·숙소',
    days: '날짜별 일정',
    bookings: '예매',
    info: '여행 정보',
    share: '멤버·공유',
} as const satisfies Record<EditorTab, string>

export const EDITOR_EXPORT_TAB_LABEL = '내보내기'

export const resolveEditorTab = (value: string | null) => EDITOR_TABS.find((tab) => tab === value) ?? DEFAULT_EDITOR_TAB
