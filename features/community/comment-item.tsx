import type { FC } from 'react'
import type { CommentView } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'
import { ACCEPTED_LABEL, DELETED_COMMENT_LABEL } from '@/features/community/community.constant'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

const REPLY_LABEL = '답글'
const DELETE_LABEL = '삭제'
const ACCEPT_LABEL = '채택'
const REPORT_LABEL = '신고'
const BLOCK_LABEL = '차단'

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
    const hasActions =
        !comment.isDeleted && (onReply !== undefined || comment.canAccept || comment.canManage || onReport !== undefined || onBlock !== undefined)

    return (
        <article className='flex flex-col gap-px'>
            <div className='flex flex-col gap-1 bg-card p-3'>
                <div className='flex flex-wrap items-center gap-1.5 font-mono text-2xs text-muted-foreground'>
                    <AuthorChip author={comment.author} createdAt={comment.createdAt} />
                    {comment.isAccepted && <Badge variant='secondary'>{ACCEPTED_LABEL}</Badge>}
                </div>
                {comment.isDeleted ? (
                    <p className='text-sm text-muted-foreground italic'>{DELETED_COMMENT_LABEL}</p>
                ) : (
                    <p className='text-sm break-keep whitespace-pre-wrap'>{comment.body}</p>
                )}
            </div>
            {hasActions && (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    {onReply !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onReply}>
                            {REPLY_LABEL}
                        </Button>
                    )}
                    {comment.canAccept && (
                        <Button type='button' variant='cellPrimary' size='cell' onClick={onAccept}>
                            {ACCEPT_LABEL}
                        </Button>
                    )}
                    {onReport !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onReport}>
                            {REPORT_LABEL}
                        </Button>
                    )}
                    {onBlock !== undefined && (
                        <Button type='button' variant='cell' size='cell' onClick={onBlock}>
                            {BLOCK_LABEL}
                        </Button>
                    )}
                    {comment.canManage && (
                        <Button type='button' variant='cellDestructive' size='cell' onClick={onDelete}>
                            {DELETE_LABEL}
                        </Button>
                    )}
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </div>
            )}
        </article>
    )
}
