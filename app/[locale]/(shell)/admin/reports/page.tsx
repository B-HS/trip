import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { isAdminRole } from '@/entities/auth/auth.role'
import { prefetchOpenReports } from '@/entities/community/community.prefetch'
import { pageSchema } from '@/entities/community/community.validate'
import { PAGE_PARAM } from '@/shared/constant/community'
import { getQueryClient } from '@/shared/lib/query-client'
import { requireUser } from '@/shared/lib/session'
import { AdminReportsWidget } from '@/widgets/community/admin-reports-widget'

type AdminReportsPageProps = {
    params: Promise<{ locale: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async ({ params }: AdminReportsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.adminReports' })
    return { title: t('title'), description: t('description') }
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
