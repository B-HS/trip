import { MapIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PostDetailView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { BoardBadge } from '@/features/community/board-badge'
import { COMMENT_COUNT_LABEL, LIKE_COUNT_LABEL, VIEW_COUNT_LABEL } from '@/features/community/community.constant'
import { Button } from '@/shared/ui/button'

const EDITED_LABEL = '수정됨'
const TRIP_LINK_LABEL = '연결된 트립'

export type PostHeaderProps = {
    post: PostDetailView
    likeCount: number
    commentCount: number
}

export const PostHeader: FC<PostHeaderProps> = ({ post, likeCount, commentCount }) => (
    <header className='flex flex-col gap-px'>
        <div className='flex flex-col gap-2 bg-card p-3'>
            <BoardBadge kind={post.boardKind} />
            <h1 className='text-2xl font-semibold tracking-tight break-keep'>{post.title}</h1>
            <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                <AuthorChip author={post.author} createdAt={post.createdAt} />
                <span className='tabular-nums'>
                    {VIEW_COUNT_LABEL} {post.viewCount} · {LIKE_COUNT_LABEL} {likeCount} · {COMMENT_COUNT_LABEL} {commentCount}
                </span>
                {post.updatedAt !== post.createdAt && <span>{EDITED_LABEL}</span>}
            </div>
        </div>
        {post.trip !== null && (
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                {post.trip.shareSlug === null ? (
                    <p className='flex min-h-10 min-w-0 items-center gap-1.5 bg-card px-4 text-xs text-muted-foreground'>
                        <MapIcon className='size-4 shrink-0' aria-hidden />
                        <span className='sr-only'>{TRIP_LINK_LABEL}</span>
                        <span className='truncate'>{post.trip.title}</span>
                    </p>
                ) : (
                    <Button variant='cell' size='cell' asChild>
                        <Link href={`/s/${post.trip.shareSlug}`}>
                            <MapIcon aria-hidden />
                            <span className='sr-only'>{TRIP_LINK_LABEL}</span>
                            <span className='truncate'>{post.trip.title}</span>
                        </Link>
                    </Button>
                )}
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        )}
    </header>
)
