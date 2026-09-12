'use client'

import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/button'
import { Kbd } from '@/shared/ui/kbd'

const SAVE_SHORTCUT_HINT = '⌘S'

type EditorSaveBarProps = {
    isDirty: boolean
    isPending: boolean
    onReset: () => void
    hint?: string
}

export const EditorSaveBar: FC<EditorSaveBarProps> = ({ isDirty, isPending, onReset, hint }) => {
    const t = useTranslations('tripEditor')
    const tActions = useTranslations('common.actions')
    return (
        <div className='sticky bottom-0 z-10 flex flex-wrap items-stretch justify-between gap-px bg-background'>
            <p className='flex min-w-0 flex-1 items-center gap-2 bg-card p-3 text-xs text-muted-foreground'>
                <Kbd>{SAVE_SHORTCUT_HINT}</Kbd>
                {hint ?? t('saveHint')}
            </p>
            <div className='flex items-stretch gap-px'>
                <Button type='button' variant='cell' size='cell' disabled={!isDirty || isPending} onClick={onReset}>
                    {t('undo')}
                </Button>
                <Button type='submit' variant='cellPrimary' size='cell' disabled={!isDirty || isPending}>
                    {isPending ? tActions('saving') : tActions('save')}
                </Button>
            </div>
        </div>
    )
}
