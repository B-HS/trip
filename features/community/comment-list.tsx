import type { FC } from 'react'
import { CommentForm } from '@/features/community/comment-form'
import { CommentItem, type CommentItemView } from '@/features/community/comment-item'

export type CommentNode = CommentItemView & {
    replies: CommentItemView[]
}

export type CommentListProps = {
    nodes: CommentNode[]
    emptyLabel: string
    canReply: boolean
    replyTargetId: string | null
    replyPlaceholder: string
    isReplyPending: boolean
    viewerId: string | null
    onReplyOpen: (commentId: string) => void
    onReplyCancel: () => void
    onReplySubmit: (parentId: string, body: string) => void
    onDelete: (commentId: string) => void
    onAccept: (commentId: string) => void
    onReport?: (commentId: string) => void
    onBlock?: (authorId: string) => void
}

export const CommentList: FC<CommentListProps> = ({
    nodes,
    emptyLabel,
    canReply,
    replyTargetId,
    replyPlaceholder,
    isReplyPending,
    viewerId,
    onReplyOpen,
    onReplyCancel,
    onReplySubmit,
    onDelete,
    onAccept,
    onReport,
    onBlock,
}) => {
    if (nodes.length === 0) return <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{emptyLabel}</p>

    const canModerateTarget = (comment: CommentItemView) => viewerId !== null && viewerId !== comment.author.id && !comment.isDeleted

    return (
        <ul className='flex flex-col gap-px bg-background'>
            {nodes.map((node) => (
                <li key={node.id} className='flex flex-col gap-px'>
                    <CommentItem
                        comment={node}
                        onDelete={() => onDelete(node.id)}
                        onAccept={() => onAccept(node.id)}
                        onReply={canReply && !node.isDeleted ? () => onReplyOpen(node.id) : undefined}
                        onReport={onReport !== undefined && canModerateTarget(node) ? () => onReport(node.id) : undefined}
                        onBlock={onBlock !== undefined && canModerateTarget(node) ? () => onBlock(node.author.id) : undefined}
                    />
                    {replyTargetId === node.id && (
                        <CommentForm
                            placeholder={replyPlaceholder}
                            isPending={isReplyPending}
                            onSubmit={(body) => onReplySubmit(node.id, body)}
                            onCancel={onReplyCancel}
                        />
                    )}
                    {node.replies.length > 0 && (
                        <ul className='flex flex-col gap-px'>
                            {node.replies.map((reply) => (
                                <li key={reply.id} className='pl-3 sm:pl-6'>
                                    <CommentItem
                                        comment={reply}
                                        onDelete={() => onDelete(reply.id)}
                                        onAccept={() => onAccept(reply.id)}
                                        onReport={onReport !== undefined && canModerateTarget(reply) ? () => onReport(reply.id) : undefined}
                                        onBlock={onBlock !== undefined && canModerateTarget(reply) ? () => onBlock(reply.author.id) : undefined}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    )
}
