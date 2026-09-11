import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostDetail } from '@/entities/community/community.cache'
import { prefetchComments, prefetchPostLike } from '@/entities/community/community.prefetch'
import { incrementPostView } from '@/entities/community/community.repository'
import type { CommunityViewer } from '@/entities/community/community.type'
import { getQueryClient } from '@/shared/lib/query-client'
import { renderRichTextHtml } from '@/shared/lib/rich-text-html'
import { getServerSession } from '@/shared/lib/session'
import { CommentsWidget } from '@/widgets/community/comments-widget'
import { PostDetailWidget } from '@/widgets/community/post-detail-widget'
import { cn } from 'cn'

type PostPageProps = {
    params: Promise<{ key: string; postId: string }>
}

const NOT_FOUND_TITLE = '글을 찾을 수 없습니다'

export const generateMetadata = async ({ params }: PostPageProps): Promise<Metadata> => {
    const { key, postId } = await params
    const session = await getServerSession()
    const post = await getPostDetail(postId, session?.user.id ?? null)
    return { title: post === null || post.boardKey !== key ? NOT_FOUND_TITLE : post.title }
}

const PostPage = async ({ params }: PostPageProps) => {
    const { key, postId } = await params
    const session = await getServerSession()
    const viewerId = session?.user.id ?? null
    const post = await getPostDetail(postId, viewerId)
    if (post === null || post.boardKey !== key) notFound()

    const viewer: CommunityViewer | null = session === null ? null : { id: session.user.id, role: session.user.role }
    if (viewer?.id !== post.author.id) await incrementPostView(post.id)

    const { body, ...postView } = post
    const html = renderRichTextHtml(body)
    const queryClient = getQueryClient()
    await Promise.all([prefetchComments(queryClient, post.id, viewerId), prefetchPostLike(queryClient, post.id, viewerId)])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className={cn('flex flex-1 flex-col gap-px', !session?.user.id && 'mx-auto max-w-7xl')}>
                <PostDetailWidget post={postView} html={html} viewer={viewer} />
                <CommentsWidget
                    postId={post.id}
                    post={{
                        authorId: post.author.id,
                        boardKey: post.boardKey,
                        boardKind: post.boardKind,
                        hasAcceptedComment: post.hasAcceptedComment,
                    }}
                    viewer={viewer}
                />
                <div aria-hidden className='min-h-0 flex-1 bg-card' />
            </div>
        </HydrationBoundary>
    )
}

export default PostPage
