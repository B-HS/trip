'use client'

import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AIRPORT_CODES, AIRPORTS, type AirportCode } from '@/shared/constant/airports'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/shared/ui/combobox'

type AirportOption = { value: AirportCode; label: string; name: string; city: string }

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

export const AirportCombobox: FC<AirportComboboxProps> = ({ id, value, isInvalid = false, className, onChange }) => {
    const t = useTranslations('tripEditor')
    const locale = useLocale()
    const options: AirportOption[] = AIRPORT_CODES.map((code) => {
        const airport = AIRPORTS[code]
        const localizedName = locale === 'ko' ? airport.name : t('airportCode', { code })
        const localizedCity = locale === 'ko' ? airport.city : ''
        const label = locale === 'ko' ? `${code} · ${airport.name}(${airport.city})` : `${code} · ${localizedName}`
        return { value: code, label, name: localizedName, city: localizedCity }
    })
    return (
        <Combobox
            items={options}
            value={options.find((option) => option.value === value) ?? null}
            filter={matchesQuery}
            onValueChange={(option) => onChange(option?.value ?? null)}>
            <ComboboxInput id={id} className={className} placeholder={t('airportSearch')} aria-invalid={isInvalid} showClear />
            <ComboboxContent>
                <ComboboxEmpty>{t('airportEmpty')}</ComboboxEmpty>
                <ComboboxList>
                    {(option: AirportOption) => (
                        <ComboboxItem key={option.value} value={option}>
                            <span className='w-8 shrink-0 font-mono text-xs text-muted-foreground'>{option.value}</span>
                            <span className='truncate'>{option.city === '' ? option.name : `${option.name}(${option.city})`}</span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
