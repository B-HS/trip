import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PostListItem } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { BoardBadge } from '@/features/community/board-badge'
import { QNA_BOARD_KIND } from '@/shared/constant/community'
import { Badge } from '@/shared/ui/badge'

export type PostRowProps = {
    post: PostListItem
    showBoard?: boolean
}

export const PostRow: FC<PostRowProps> = ({ post, showBoard = false }) => {
    const t = useTranslations('community.counts')

    return (
        <article className='flex flex-col gap-1 bg-card p-3'>
            {showBoard && <BoardBadge kind={post.boardKind} />}
            <div className='flex min-w-0 items-center gap-1.5'>
                <Link className='min-w-0 truncate text-sm font-medium hover:underline' href={`/boards/${post.boardKey}/${post.id}`}>
                    {post.title}
                </Link>
                {post.boardKind === QNA_BOARD_KIND && post.hasAcceptedComment && <Badge variant='secondary'>{t('accepted')}</Badge>}
            </div>
            <p className='truncate text-xs text-muted-foreground'>{post.excerpt}</p>
            <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                <AuthorChip author={post.author} createdAt={post.createdAt} />
                <span className='tabular-nums'>
                    {t('view')} {post.viewCount} · {t('like')} {post.likeCount} · {t('comment')} {post.commentCount}
                </span>
            </div>
        </article>
    )
}
