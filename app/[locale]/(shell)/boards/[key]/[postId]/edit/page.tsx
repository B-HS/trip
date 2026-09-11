import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { getPostDetail } from '@/entities/community/community.cache'
import { canEditPost } from '@/entities/community/community.role'
import { prefetchTripList } from '@/entities/trip/trip.prefetch'
import { getQueryClient } from '@/shared/lib/query-client'
import { getUploadConfig } from '@/shared/lib/r2'
import { requireUser } from '@/shared/lib/session'
import { PostFormWidget } from '@/widgets/community/post-form-widget'

type EditPostPageProps = {
    params: Promise<{ locale: string; key: string; postId: string }>
}

export const generateMetadata = async ({ params }: EditPostPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.postEdit' })
    return { title: t('title'), description: t('description') }
}

const EditPostPage = async ({ params }: EditPostPageProps) => {
    const { key, postId } = await params
    const user = await requireUser()
    const post = await getPostDetail(postId)
    if (post === null || post.boardKey !== key || !canEditPost(user, post.author.id)) notFound()

    const queryClient = getQueryClient()
    await prefetchTripList(queryClient, user.id)

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostFormWidget mode='edit' post={post} isUploadEnabled={getUploadConfig() !== null} />
        </HydrationBoundary>
    )
}

export default EditPostPage
