export const MESSAGE_KEY_PREFIXES = [
    'validation.',
    'error.',
    'auth.errors.',
    'trip.toast.',
    'community.toast.',
    'profile.toast.',
    'userState.toast.',
] as const

export const isMessageKey = (value: string) => MESSAGE_KEY_PREFIXES.some((prefix) => value.startsWith(prefix))

export type Translator = (key: string, values?: Record<string, string | number | Date>) => string

export const translateMessage = (t: Translator, message: string) => (isMessageKey(message) ? t(message) : message)
