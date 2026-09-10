'use client'

import type { FC } from 'react'
import { AIRPORT_CODES, AIRPORTS, type AirportCode } from '@/shared/constant/airports'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/shared/ui/combobox'

type AirportOption = { value: AirportCode; label: string; name: string; city: string }

const AIRPORT_OPTIONS: AirportOption[] = AIRPORT_CODES.map((code) => ({
    value: code,
    label: `${code} · ${AIRPORTS[code].name}(${AIRPORTS[code].city})`,
    name: AIRPORTS[code].name,
    city: AIRPORTS[code].city,
}))

const matchesQuery = (option: AirportOption, query: string) => {
    const needle = query.trim().toLowerCase()
    if (needle.length === 0) return true
    return option.value.toLowerCase().includes(needle) || option.name.toLowerCase().includes(needle) || option.city.toLowerCase().includes(needle)
}

type AirportComboboxProps = {
    id: string
    value: string | null
    isInvalid?: boolean
    className?: string
    onChange: (code: AirportCode | null) => void
}

export const AirportCombobox: FC<AirportComboboxProps> = ({ id, value, isInvalid = false, className, onChange }) => (
    <Combobox
        items={AIRPORT_OPTIONS}
        value={AIRPORT_OPTIONS.find((option) => option.value === value) ?? null}
        filter={matchesQuery}
        onValueChange={(option) => onChange(option?.value ?? null)}>
        <ComboboxInput id={id} className={className} placeholder='공항 검색' aria-invalid={isInvalid} showClear />
        <ComboboxContent>
            <ComboboxEmpty>일치하는 공항이 없습니다.</ComboboxEmpty>
            <ComboboxList>
                {(option: AirportOption) => (
                    <ComboboxItem key={option.value} value={option}>
                        <span className='w-8 shrink-0 font-mono text-xs text-muted-foreground'>{option.value}</span>
                        <span className='truncate'>{`${option.name}(${option.city})`}</span>
                    </ComboboxItem>
                )}
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
)
