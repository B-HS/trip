import dayjs from 'dayjs'
import type { PropsWithChildren } from 'react'
import { PublicFooter } from '@/features/app-shell/public-footer'
import { PublicHeader } from '@/features/app-shell/public-header'
import { PublicHeaderActions } from '@/widgets/app-shell/public-header-actions'

const PublicLayout = ({ children }: PropsWithChildren) => (
    <div className='surface-public flex min-h-dvh flex-col bg-background text-foreground'>
        <PublicHeader actions={<PublicHeaderActions />} />
        <main className='flex-1'>{children}</main>
        <PublicFooter year={dayjs().format('YYYY')} />
    </div>
)

export default PublicLayout
