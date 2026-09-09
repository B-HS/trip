'use client'

import type { FC } from 'react'
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from '@/shared/constant/countries'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/shared/ui/combobox'

type CountryOption = { value: CountryCode; label: string; nameEn: string }

const COUNTRY_OPTIONS: CountryOption[] = COUNTRY_CODES.map((code) => ({
    value: code,
    label: `${COUNTRIES[code].name} (${code})`,
    nameEn: COUNTRIES[code].nameEn,
}))

const matchesQuery = (option: CountryOption, query: string) => {
    const needle = query.trim().toLowerCase()
    if (needle.length === 0) return true
    return option.value.toLowerCase().includes(needle) || option.label.toLowerCase().includes(needle) || option.nameEn.toLowerCase().includes(needle)
}

type CountryComboboxProps = {
    id: string
    value: string
    isInvalid?: boolean
    className?: string
    onChange: (code: CountryCode) => void
}

export const CountryCombobox: FC<CountryComboboxProps> = ({ id, value, isInvalid = false, className, onChange }) => (
    <Combobox
        items={COUNTRY_OPTIONS}
        value={COUNTRY_OPTIONS.find((option) => option.value === value) ?? null}
        filter={matchesQuery}
        onValueChange={(option) => option !== null && onChange(option.value)}>
        <ComboboxInput id={id} className={className} placeholder='나라 검색' aria-invalid={isInvalid} />
        <ComboboxContent>
            <ComboboxEmpty>일치하는 나라가 없습니다.</ComboboxEmpty>
            <ComboboxList>
                {(option: CountryOption) => (
                    <ComboboxItem key={option.value} value={option}>
                        <span className='w-6 shrink-0 font-mono text-xs text-muted-foreground'>{option.value}</span>
                        <span className='truncate'>{COUNTRIES[option.value].name}</span>
                    </ComboboxItem>
                )}
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
)
