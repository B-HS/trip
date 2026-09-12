export const EDITOR_TABS = ['basics', 'sidebar', 'travel', 'kinds', 'days', 'bookings', 'info', 'share'] as const

export type EditorTab = (typeof EDITOR_TABS)[number]

export const EDITOR_TAB_PARAM = 'tab'

export const DEFAULT_EDITOR_TAB = 'basics' satisfies EditorTab

export const resolveEditorTab = (value: string | null) => EDITOR_TABS.find((tab) => tab === value) ?? DEFAULT_EDITOR_TAB
