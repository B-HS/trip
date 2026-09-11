'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { COMMENT_COUNT_LABEL } from '@/features/community/community.constant'
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
const EMPTY_COMMENT_LABEL = '아직 댓글이 없습니다.'
const LOADING_COMMENT_LABEL = '댓글을 불러오는 중입니다.'
const ERROR_COMMENT_LABEL = '댓글을 불러오지 못했습니다.'
const RETRY_LABEL = '다시 시도'
const COMMENT_PLACEHOLDER = '댓글을 입력해 주세요.'
const REPLY_PLACEHOLDER = '답글을 입력해 주세요.'
const SIGNED_OUT_LABEL = '로그인 후 댓글 쓰기'
const CANCEL_LABEL = '취소'
const DELETE_LABEL = '삭제'
const DELETING_LABEL = '삭제 중…'
const DELETE_TITLE = '댓글을 삭제할까요?'
const DELETE_DESCRIPTION = '이 댓글과 답글이 함께 삭제되어 목록에서 숨겨집니다.'
const ACCEPT_LABEL = '채택'
const ACCEPTING_LABEL = '채택 중…'
const ACCEPT_TITLE = '이 답변을 채택할까요?'
const ACCEPT_DESCRIPTION = '다른 답변이 채택되어 있으면 채택이 이 답변으로 이동합니다.'
const BLOCK_LABEL = '차단'
const BLOCKING_LABEL = '차단 중…'
const BLOCK_TITLE = '이 사용자를 차단할까요?'
const BLOCK_DESCRIPTION = '차단하면 이 사용자의 글과 댓글을 더 이상 볼 수 없습니다.'

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
                {COMMENT_COUNT_LABEL} <span className='font-mono tabular-nums'>{visibleCount}</span>
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
