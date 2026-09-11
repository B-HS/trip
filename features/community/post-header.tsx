import { MapIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PostDetailView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { BoardBadge } from '@/features/community/board-badge'
import { Button } from '@/shared/ui/button'

export type PostHeaderProps = {
    post: PostDetailView
    likeCount: number
    commentCount: number
}

export const PostHeader: FC<PostHeaderProps> = ({ post, likeCount, commentCount }) => {
    const t = useTranslations('community')

    return (
        <header className='flex flex-col gap-px'>
            <div className='flex flex-col gap-2 bg-card p-3'>
                <BoardBadge kind={post.boardKind} />
                <h1 className='text-2xl font-semibold tracking-tight break-keep'>{post.title}</h1>
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                    <AuthorChip author={post.author} createdAt={post.createdAt} />
                    <span className='tabular-nums'>
                        {t('counts.view')} {post.viewCount} · {t('counts.like')} {likeCount} · {t('counts.comment')} {commentCount}
                    </span>
                    {post.updatedAt !== post.createdAt && <span>{t('post.edited')}</span>}
                </div>
            </div>
            {post.trip !== null && (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    {post.trip.shareSlug === null ? (
                        <p className='flex min-h-10 min-w-0 items-center gap-1.5 bg-card px-4 text-xs text-muted-foreground'>
                            <MapIcon className='size-4 shrink-0' aria-hidden />
                            <span className='sr-only'>{t('post.linkedTrip')}</span>
                            <span className='truncate'>{post.trip.title}</span>
                        </p>
                    ) : (
                        <Button variant='cell' size='cell' asChild>
                            <Link href={`/s/${post.trip.shareSlug}`}>
                                <MapIcon aria-hidden />
                                <span className='sr-only'>{t('post.linkedTrip')}</span>
                                <span className='truncate'>{post.trip.title}</span>
                            </Link>
                        </Button>
                    )}
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </div>
            )}
        </header>
    )
}
