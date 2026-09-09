import dayjs from 'dayjs'
import { cacheLife } from 'next/cache'
import type { PropsWithChildren } from 'react'
import { PublicFooter } from '@/features/app-shell/public-footer'
import { PublicHeader } from '@/features/app-shell/public-header'
import { PublicHeaderActions } from '@/widgets/app-shell/public-header-actions'

const getCurrentYear = async () => {
    'use cache'
    cacheLife('days')
    return dayjs().format('YYYY')
}

const PublicLayout = async ({ children }: PropsWithChildren) => {
    const year = await getCurrentYear()

    return (
        <div className='surface-public flex min-h-dvh flex-col bg-background text-foreground'>
            <PublicHeader actions={<PublicHeaderActions />} />
            <main className='flex-1'>{children}</main>
            <PublicFooter year={year} />
        </div>
    )
}

export default PublicLayout
