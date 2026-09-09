import type { FC, PropsWithChildren, ReactNode } from 'react'
import { PublicFooter } from '@/features/app-shell/public-footer'
import { PublicHeader } from '@/features/app-shell/public-header'

export type PublicFrameProps = PropsWithChildren<{
    actions: ReactNode
    year: string
}>

export const PublicFrame: FC<PublicFrameProps> = ({ actions, year, children }) => (
    <div className='surface-public flex min-h-dvh flex-col bg-background text-foreground'>
        <PublicHeader actions={actions} />
        <main className='flex-1'>{children}</main>
        <PublicFooter year={year} />
    </div>
)
