export type EditorSubmit<TValues> = (values: TValues) => Promise<boolean>

const emptyToNull = (value: string | null) => (value === null || value.trim() === '' ? null : value)

const emptyToUndefined = (value: string | null | undefined) => (value === null || value === undefined || value.trim() === '' ? undefined : value)

const toAirportCode = (value: string | null) => (value === null ? '' : value.trim().toUpperCase())

const emptyToNullNumber = (value: string | number | null | undefined) => {
    const text = value === null || value === undefined ? '' : String(value).trim()
    return text === '' ? null : Number(text)
}

export const EMPTY_TO_NULL = { setValueAs: emptyToNull }

export const EMPTY_TO_NULL_NUMBER = { setValueAs: emptyToNullNumber }

export const EMPTY_TO_UNDEFINED = { setValueAs: emptyToUndefined }

export const AIRPORT_CODE_OPTION = { setValueAs: toAirportCode }

export const EDITOR_INPUT_CLASS = 'h-8'

export const EDITOR_TEXTAREA_CLASS = 'min-h-16'

export const EDITOR_GRID_CLASS = 'grid gap-3 sm:grid-cols-2'

export const EDITOR_LABEL_LINE_CLASS = 'leading-4'
