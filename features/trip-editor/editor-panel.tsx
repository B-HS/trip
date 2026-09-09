'use client'

import type { FC, PropsWithChildren, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type EditorPanelProps = PropsWithChildren<{
    title: string
    description?: string
    count?: number
    action?: ReactNode
    contentClassName?: string
}>

export const EditorPanel: FC<EditorPanelProps> = ({ title, description, count, action, contentClassName, children }) => (
    <section className='flex flex-col gap-3 bg-card p-3'>
        <header className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex min-w-0 flex-col gap-0.5'>
                <h2 className='flex items-center gap-2 text-sm font-medium'>
                    {title}
                    {count !== undefined && <span className='font-mono text-xs text-muted-foreground tabular-nums'>{count}</span>}
                </h2>
                {description !== undefined && <p className='text-xs text-muted-foreground'>{description}</p>}
            </div>
            {action}
        </header>
        <div className={cn('flex flex-col gap-3', contentClassName)}>{children}</div>
    </section>
)
