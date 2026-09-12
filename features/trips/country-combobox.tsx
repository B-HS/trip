'use client'

import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { COUNTRIES, COUNTRY_CODES, countryName, type CountryCode } from '@/shared/constant/countries'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/shared/ui/combobox'

type CountryOption = { value: CountryCode; label: string; nameEn: string }

const buildCountryOptions = (locale: string): CountryOption[] =>
    COUNTRY_CODES.map((code) => ({
        value: code,
        label: `${countryName(code, locale)} (${code})`,
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

export const CountryCombobox: FC<CountryComboboxProps> = ({ id, value, isInvalid = false, className, onChange }) => {
    const locale = useLocale()
    const t = useTranslations('trips.create.labels')
    const countryOptions = buildCountryOptions(locale)
    return (
        <Combobox
            items={countryOptions}
            value={countryOptions.find((option) => option.value === value) ?? null}
            filter={matchesQuery}
            onValueChange={(option) => option !== null && onChange(option.value)}>
            <ComboboxInput id={id} className={className} placeholder={t('countrySearch')} aria-invalid={isInvalid} />
            <ComboboxContent>
                <ComboboxEmpty>{t('countryEmpty')}</ComboboxEmpty>
                <ComboboxList>
                    {(option: CountryOption) => (
                        <ComboboxItem key={option.value} value={option}>
                            <span className='w-6 shrink-0 font-mono text-xs text-muted-foreground'>{option.value}</span>
                            <span className='truncate'>{countryName(option.value, locale)}</span>
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}
