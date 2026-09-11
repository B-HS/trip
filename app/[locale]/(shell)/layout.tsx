import dayjs from 'dayjs'
import type { PropsWithChildren } from 'react'
import { PublicFrame } from '@/features/app-shell/public-frame'
import { getServerSession } from '@/shared/lib/session'
import { AppFrame } from '@/widgets/app-shell/app-frame'
import { PublicHeaderActions } from '@/widgets/app-shell/public-header-actions'

const ShellLayout = async ({ children }: PropsWithChildren) => {
    const session = await getServerSession()

    if (!session)
        return (
            <PublicFrame actions={<PublicHeaderActions />} year={dayjs().format('YYYY')}>
                {children}
            </PublicFrame>
        )

    const { user } = session

    return (
        <AppFrame user={{ id: user.id, name: user.name, email: user.email, username: user.username ?? null, image: user.image ?? null }}>
            {children}
        </AppFrame>
    )
}

export default ShellLayout
