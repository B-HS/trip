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
    onReplyOpen: (commentId: string) => void
    onReplyCancel: () => void
    onReplySubmit: (parentId: string, body: string) => void
    onDelete: (commentId: string) => void
    onAccept: (commentId: string) => void
}

export const CommentList: FC<CommentListProps> = ({
    nodes,
    emptyLabel,
    canReply,
    replyTargetId,
    replyPlaceholder,
    isReplyPending,
    onReplyOpen,
    onReplyCancel,
    onReplySubmit,
    onDelete,
    onAccept,
}) => {
    if (nodes.length === 0) return <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{emptyLabel}</p>

    return (
        <ul className='flex flex-col gap-px bg-background'>
            {nodes.map((node) => (
                <li key={node.id} className='flex flex-col gap-px'>
                    <CommentItem
                        comment={node}
                        onDelete={() => onDelete(node.id)}
                        onAccept={() => onAccept(node.id)}
                        onReply={canReply ? () => onReplyOpen(node.id) : undefined}
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
                                    <CommentItem comment={reply} onDelete={() => onDelete(reply.id)} onAccept={() => onAccept(reply.id)} />
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    )
}
