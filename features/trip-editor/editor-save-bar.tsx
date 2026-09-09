'use client'

import type { FC } from 'react'
import { Button } from '@/shared/ui/button'
import { Kbd } from '@/shared/ui/kbd'

const SAVE_SHORTCUT_HINT = '⌘S'

type EditorSaveBarProps = {
    isDirty: boolean
    isPending: boolean
    onReset: () => void
    hint?: string
}

export const EditorSaveBar: FC<EditorSaveBarProps> = ({ isDirty, isPending, onReset, hint }) => (
    <div className='sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card p-3'>
        <p className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Kbd>{SAVE_SHORTCUT_HINT}</Kbd>
            {hint ?? '변경한 내용은 탭별로 저장합니다.'}
        </p>
        <div className='flex items-center gap-2'>
            <Button type='button' variant='ghost' size='sm' disabled={!isDirty || isPending} onClick={onReset}>
                되돌리기
            </Button>
            <Button type='submit' size='sm' disabled={!isDirty || isPending}>
                {isPending ? '저장 중…' : '저장'}
            </Button>
        </div>
    </div>
)
