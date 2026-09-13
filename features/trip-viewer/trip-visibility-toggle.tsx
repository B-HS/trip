'use client'

import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Switch } from '@/shared/ui/switch'

type TripVisibilityToggleProps = {
    isPublic: boolean
    isPending: boolean
    onChange: (isPublic: boolean) => void
}

export const TripVisibilityToggle: FC<TripVisibilityToggleProps> = ({ isPublic, isPending, onChange }) => {
    const t = useTranslations('tripViewer')
    const state = t(isPublic ? 'visibilityPublic' : 'visibilityPrivate')

    return (
        <div className='flex min-h-10 items-center gap-2 bg-card px-3' data-visibility={isPublic ? 'public' : 'private'}>
            <Switch
                id='trip-visibility-toggle'
                size='sm'
                checked={isPublic}
                disabled={isPending}
                aria-label={t('visibilityToggleAria', { state })}
                onCheckedChange={onChange}
            />
            <span aria-live='polite' className='text-xs font-medium whitespace-nowrap'>
                {t('visibilityLabel')}: {state}
            </span>
        </div>
    )
}
