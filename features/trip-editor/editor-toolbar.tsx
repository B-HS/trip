'use client'

import type { FC, ReactNode } from 'react'

type EditorToolbarProps = {
    title: string
    description?: string
    count?: number
    action?: ReactNode
}

export const EditorToolbar: FC<EditorToolbarProps> = ({ title, description, count, action }) => (
    <div className='flex flex-wrap items-center justify-between gap-2 bg-card p-3'>
        <div className='flex min-w-0 flex-col gap-0.5'>
            <h2 className='flex items-center gap-2 text-sm font-medium'>
                {title}
                {count !== undefined && <span className='font-mono text-xs text-muted-foreground tabular-nums'>{count}</span>}
            </h2>
            {description !== undefined && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>
        {action}
    </div>
)
