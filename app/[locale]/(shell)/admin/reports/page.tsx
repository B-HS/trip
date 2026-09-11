import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isAdminRole } from '@/entities/auth/auth.role'
import { prefetchOpenReports } from '@/entities/community/community.prefetch'
import { pageSchema } from '@/entities/community/community.validate'
import { PAGE_PARAM } from '@/shared/constant/community'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { AdminReportsWidget } from '@/widgets/community/admin-reports-widget'

type AdminReportsPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata: Metadata = {
    title: '신고 관리',
}

const AdminReportsPage = async ({ searchParams }: AdminReportsPageProps) => {
    const user = await requireUser()
    if (!isAdminRole(user.role)) notFound()

    const page = pageSchema.parse((await searchParams)[PAGE_PARAM])
    const queryClient = getQueryClient()
    await prefetchOpenReports(queryClient, page)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminReportsWidget initialPage={page} />
        </HydrationBoundary>
    )
}

export default AdminReportsPage
