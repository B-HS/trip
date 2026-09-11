import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { CommentView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

export type CommentItemView = CommentView & {
    canManage: boolean
    canAccept: boolean
}

export type CommentItemProps = {
    comment: CommentItemView
    onDelete: () => void
    onAccept: () => void
    onReply?: () => void
    onReport?: () => void
    onBlock?: () => void
}

export const CommentItem: FC<CommentItemProps> = ({ comment, onDelete, onAccept, onReply, onReport, onBlock }) => {
    const t = useTranslations('community')
    const hasActions =
        !comment.isDeleted && (onReply !== undefined || comment.canAccept || comment.canManage || onReport !== undefined || onBlock !== undefined)

    return (
        <article className='flex flex-col gap-px'>
            <div className='flex flex-col gap-1 bg-card p-3'>
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                    <AuthorChip author={comment.author} createdAt={comment.createdAt} />
                    {comment.isAccepted && <Badge variant='secondary'>{t('counts.accepted')}</Badge>}
                </div>
                {comment.isDeleted ? (
                    <p className='text-sm text-muted-foreground italic'>{t('counts.deletedComment')}</p>
                ) : (
                    <p className='text-sm break-keep whitespace-pre-wrap'>{comment.body}</p>
                )}
            </div>
            {hasActions && (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    {onReply !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onReply}>
                            {t('comments.reply')}
                        </Button>
                    )}
                    {comment.canAccept && (
                        <Button type='button' variant='cellPrimary' size='cell' onClick={onAccept}>
                            {t('comments.accept')}
                        </Button>
                    )}
                    {onReport !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onReport}>
                            {t('moderation.report')}
                        </Button>
                    )}
                    {onBlock !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onBlock}>
                            {t('moderation.block')}
                        </Button>
                    )}
                    {comment.canManage && (
                        <Button type='button' variant='cellDestructive' size='cell' onClick={onDelete}>
                            {t('comments.delete')}
                        </Button>
                    )}
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </div>
            )}
        </article>
    )
}
