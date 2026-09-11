'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { useState, type FC, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
    useAcceptComment,
    useBlockUser,
    useComments,
    useCreateComment,
    useDeleteComment,
    useSubmitReport,
} from '@/entities/community/community.query'
import { canAcceptComment, canManageComment } from '@/entities/community/community.role'
import type { CommentView, CommunityViewer, PostAuthor, PostDetail } from '@/entities/community/community.type'
import { ReportDialog, type ReportFormValues } from '@/features/community/report-dialog'
import type { CommentItemView } from '@/features/community/comment-item'
import { CommentForm } from '@/features/community/comment-form'
import { CommentList, type CommentNode } from '@/features/community/comment-list'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { LOGIN_PATH } from '@/shared/constant/route'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'

const FIRST_FORM_KEY = 0
const FORM_KEY_STEP = 1

export type CommentsPost = Pick<PostDetail, 'boardKey' | 'boardKind' | 'hasAcceptedComment'> & {
    authorId: PostAuthor['id']
}

export type CommentsWidgetProps = {
    postId: string
    post: CommentsPost
    viewer: CommunityViewer | null
}

const toItemView = (comment: CommentView, post: CommentsPost, viewer: CommunityViewer | null) =>
    ({
        ...comment,
        canManage: canManageComment(viewer, comment.author.id),
        canAccept: canAcceptComment(
            viewer,
            { authorId: post.authorId, boardKind: post.boardKind },
            { authorId: comment.author.id, parentId: comment.parentId, isAccepted: comment.isAccepted },
        ),
    }) satisfies CommentItemView

const buildNodes = (comments: CommentView[], post: CommentsPost, viewer: CommunityViewer | null) => {
    const replies = comments.reduce(
        (groups, comment) =>
            comment.parentId === null
                ? groups
                : groups.set(comment.parentId, [...(groups.get(comment.parentId) ?? []), toItemView(comment, post, viewer)]),
        new Map<string, CommentItemView[]>(),
    )

    return comments
        .filter((comment) => comment.parentId === null)
        .map((comment) => ({ ...toItemView(comment, post, viewer), replies: replies.get(comment.id) ?? [] }) satisfies CommentNode)
}

export const CommentsWidget: FC<CommentsWidgetProps> = ({ postId, post, viewer }) => {
    const t = useTranslations('community')
    const EMPTY_COMMENT_LABEL = t('comments.empty')
    const LOADING_COMMENT_LABEL = t('comments.loading')
    const ERROR_COMMENT_LABEL = t('comments.error')
    const RETRY_LABEL = t('comments.retry')
    const COMMENT_PLACEHOLDER = t('comments.placeholder')
    const REPLY_PLACEHOLDER = t('comments.replyPlaceholder')
    const SIGNED_OUT_LABEL = t('comments.signedOut')
    const CANCEL_LABEL = t('comments.cancel')
    const DELETE_LABEL = t('comments.delete')
    const DELETING_LABEL = t('comments.deleting')
    const DELETE_TITLE = t('comments.deleteTitle')
    const DELETE_DESCRIPTION = t('comments.deleteDescription')
    const ACCEPT_LABEL = t('comments.accept')
    const ACCEPTING_LABEL = t('comments.accepting')
    const ACCEPT_TITLE = t('comments.acceptTitle')
    const ACCEPT_DESCRIPTION = t('comments.acceptDescription')
    const BLOCK_LABEL = t('moderation.block')
    const BLOCKING_LABEL = t('moderation.blocking')
    const BLOCK_TITLE = t('moderation.blockTitle')
    const BLOCK_DESCRIPTION = t('moderation.blockDescription')
    const [replyTargetId, setReplyTargetId] = useState<string | null>(null)
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
    const [acceptTargetId, setAcceptTargetId] = useState<string | null>(null)
    const [blockTargetId, setBlockTargetId] = useState<string | null>(null)
    const [reportTargetId, setReportTargetId] = useState<string | null>(null)
    const [formKey, setFormKey] = useState(FIRST_FORM_KEY)
    const comments = useComments(postId)
    const createComment = useCreateComment(postId)
    const deleteComment = useDeleteComment(postId)
    const acceptComment = useAcceptComment(postId)
    const submitReport = useSubmitReport()
    const blockUser = useBlockUser()
    const queryClient = useQueryClient()
    const router = useRouter()

    const items = comments.data ?? []
    const visibleCount = items.filter((item) => !item.isDeleted).length
    const nodes = buildNodes(items, post, viewer)
    const handleCreate = (body: string) =>
        createComment.mutate({ parentId: null, body }, { onSuccess: () => setFormKey((key) => key + FORM_KEY_STEP) })
    const handleReply = (parentId: string, body: string) => createComment.mutate({ parentId, body }, { onSuccess: () => setReplyTargetId(null) })
    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (deleteTargetId === null) return
        deleteComment.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) })
    }
    const handleAccept = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (acceptTargetId === null) return
        acceptComment.mutate(acceptTargetId, { onSuccess: () => setAcceptTargetId(null) })
    }
    const handleReport = (values: ReportFormValues) => {
        if (reportTargetId === null) return
        submitReport.mutate({ kind: 'comment', targetId: reportTargetId, ...values }, { onSuccess: () => setReportTargetId(null) })
    }
    const handleBlock = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (blockTargetId === null) return
        blockUser.mutate(blockTargetId, {
            onSuccess: () => {
                setBlockTargetId(null)
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(postId) })
                router.refresh()
            },
        })
    }

    return (
        <section className='flex flex-col gap-px'>
            <h2 className='bg-card p-3 text-sm font-medium'>
                {t('counts.comment')} <span className='font-mono tabular-nums'>{visibleCount}</span>
            </h2>
            {comments.isError ? (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <p className='flex min-h-10 min-w-0 flex-1 items-center bg-card px-4 text-xs text-destructive'>{ERROR_COMMENT_LABEL}</p>
                    <Button type='button' variant='cell' size='cell' onClick={() => comments.refetch()}>
                        {RETRY_LABEL}
                    </Button>
                </div>
            ) : (
                <CommentList
                    nodes={nodes}
                    emptyLabel={comments.isPending ? LOADING_COMMENT_LABEL : EMPTY_COMMENT_LABEL}
                    canReply={viewer !== null}
                    replyTargetId={replyTargetId}
                    replyPlaceholder={REPLY_PLACEHOLDER}
                    isReplyPending={createComment.isPending}
                    onReplyOpen={setReplyTargetId}
                    onReplyCancel={() => setReplyTargetId(null)}
                    onReplySubmit={handleReply}
                    onDelete={setDeleteTargetId}
                    onAccept={setAcceptTargetId}
                    viewerId={viewer?.id ?? null}
                    onReport={setReportTargetId}
                    onBlock={setBlockTargetId}
                />
            )}
            {viewer === null ? (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <Button variant='cell' size='cell' asChild>
                        <Link href={`${LOGIN_PATH}?next=/boards/${post.boardKey}/${postId}`}>{SIGNED_OUT_LABEL}</Link>
                    </Button>
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </div>
            ) : (
                <CommentForm key={formKey} placeholder={COMMENT_PLACEHOLDER} isPending={createComment.isPending} onSubmit={handleCreate} />
            )}
            <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{DELETE_TITLE}</AlertDialogTitle>
                        <AlertDialogDescription>{DELETE_DESCRIPTION}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={deleteComment.isPending}>
                            {CANCEL_LABEL}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellDestructive' size='cell' disabled={deleteComment.isPending} onClick={handleDelete}>
                            {deleteComment.isPending ? DELETING_LABEL : DELETE_LABEL}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={acceptTargetId !== null} onOpenChange={(open) => !open && setAcceptTargetId(null)}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{ACCEPT_TITLE}</AlertDialogTitle>
                        <AlertDialogDescription>{ACCEPT_DESCRIPTION}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={acceptComment.isPending}>
                            {CANCEL_LABEL}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellPrimary' size='cell' disabled={acceptComment.isPending} onClick={handleAccept}>
                            {acceptComment.isPending ? ACCEPTING_LABEL : ACCEPT_LABEL}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={blockTargetId !== null} onOpenChange={(open) => !open && setBlockTargetId(null)}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{BLOCK_TITLE}</AlertDialogTitle>
                        <AlertDialogDescription>{BLOCK_DESCRIPTION}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={blockUser.isPending}>
                            {CANCEL_LABEL}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellDestructive' size='cell' disabled={blockUser.isPending} onClick={handleBlock}>
                            {blockUser.isPending ? BLOCKING_LABEL : BLOCK_LABEL}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ReportDialog
                open={reportTargetId !== null}
                isPending={submitReport.isPending}
                onClose={() => setReportTargetId(null)}
                onSubmit={handleReport}
            />
        </section>
    )
}
