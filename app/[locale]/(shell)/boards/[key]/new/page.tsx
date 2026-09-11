import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBoardByKey } from '@/entities/community/community.cache'
import { prefetchTripList } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { PostFormWidget } from '@/widgets/community/post-form-widget'

type NewPostPageProps = {
    params: Promise<{ key: string }>
}

export const metadata: Metadata = {
    title: '새 글 쓰기',
}

const NewPostPage = async ({ params }: NewPostPageProps) => {
    const { key } = await params
    const user = await requireUser()
    const board = await getBoardByKey(key)
    if (board === null) notFound()

    const queryClient = getQueryClient()
    await prefetchTripList(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostFormWidget mode='create' board={{ key: board.key, name: board.name }} isUploadEnabled={getUploadConfig() !== null} />
        </HydrationBoundary>
    )
}

export default NewPostPage
