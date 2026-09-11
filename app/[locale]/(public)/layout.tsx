import dayjs from 'dayjs'
import type { PropsWithChildren } from 'react'
import { PublicFrame } from '@/features/app-shell/public-frame'
import { PublicHeaderActions } from '@/widgets/app-shell/public-header-actions'

const PublicLayout = ({ children }: PropsWithChildren) => (
    <PublicFrame actions={<PublicHeaderActions />} year={dayjs().format('YYYY')}>
        {children}
    </PublicFrame>
)

export default PublicLayout
