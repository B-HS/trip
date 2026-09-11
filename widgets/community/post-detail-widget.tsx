'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FC, type MouseEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useBlockUser, useComments, useDeletePost, usePostLike, useSubmitReport, useTogglePostLike } from '@/entities/community/community.query'
import { canEditPost, canManagePost } from '@/entities/community/community.role'
import type { CommunityViewer, PostDetailView } from '@/entities/community/community.type'
import { LikeCell } from '@/features/community/like-cell'
import { PostHeader } from '@/features/community/post-header'
import { ReportDialog, type ReportFormValues } from '@/features/community/report-dialog'
import { RichTextContent } from '@/features/editor/rich-text-content'
import { QUERY_KEY } from '@/shared/constant/query-key'
import { LOGIN_PATH } from '@/shared/constant/route'
import type { SanitizedRichTextHtml } from '@/shared/lib/rich-text-sanitize'
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

const EDIT_LABEL = '수정'
const DELETE_LABEL = '삭제'
const DELETING_LABEL = '삭제 중…'
const CANCEL_LABEL = '취소'
const LIST_LABEL = '목록'
const REPORT_LABEL = '신고'
const BLOCK_LABEL = '차단'
const BLOCKING_LABEL = '차단 중…'
const DELETE_TITLE = '글을 삭제할까요?'
const DELETE_DESCRIPTION = '이 글과 댓글이 함께 삭제되어 목록에서 숨겨집니다.'
const BLOCK_TITLE = '이 사용자를 차단할까요?'
const BLOCK_DESCRIPTION = '차단하면 이 사용자의 글과 댓글을 더 이상 볼 수 없습니다.'

export type PostDetailWidgetProps = {
    post: PostDetailView
    html: SanitizedRichTextHtml
    viewer: CommunityViewer | null
}

export const PostDetailWidget: FC<PostDetailWidgetProps> = ({ post, html, viewer }) => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [isBlockOpen, setIsBlockOpen] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    const comments = useComments(post.id)
    const postLike = usePostLike(post.id)
    const togglePostLike = useTogglePostLike(post.id)
    const deletePost = useDeletePost()
    const submitReport = useSubmitReport()
    const blockUser = useBlockUser()

    const likeCount = postLike.data?.count ?? post.likeCount
    const isLiked = postLike.data?.liked ?? false
    const commentCount = comments.data === undefined ? post.commentCount : comments.data.filter((item) => !item.isDeleted).length
    const canModerate = viewer !== null && viewer.id !== post.author.id
    const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        deletePost.mutate(post.id, { onSuccess: ({ boardKey }) => router.push(`/boards/${boardKey}`) })
    }
    const handleReport = (values: ReportFormValues) => {
        submitReport.mutate({ kind: 'post', targetId: post.id, ...values }, { onSuccess: () => setIsReportOpen(false) })
    }
    const handleBlock = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        blockUser.mutate(post.author.id, {
            onSuccess: () => {
                setIsBlockOpen(false)
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.COMMUNITY.COMMENTS(post.id) })
                router.refresh()
            },
        })
    }

    return (
        <article className='flex flex-col gap-px'>
            <PostHeader post={post} likeCount={likeCount} commentCount={commentCount} />
            <RichTextContent className='bg-card p-3' html={html} />
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <LikeCell
                    count={likeCount}
                    isLiked={isLiked}
                    isPending={togglePostLike.isPending}
                    loginHref={viewer === null ? `${LOGIN_PATH}?next=/boards/${post.boardKey}/${post.id}` : null}
                    onToggle={() => togglePostLike.mutate(!isLiked)}
                />
                {canEditPost(viewer, post.author.id) && (
                    <Button variant='cell' size='cell' asChild>
                        <Link href={`/boards/${post.boardKey}/${post.id}/edit`}>{EDIT_LABEL}</Link>
                    </Button>
                )}
                {canManagePost(viewer, post.author.id) && (
                    <Button type='button' variant='cellDestructive' size='cell' onClick={() => setIsDeleteOpen(true)}>
                        {DELETE_LABEL}
                    </Button>
                )}
                {canModerate && (
                    <Button type='button' variant='cell' size='cell' onClick={() => setIsReportOpen(true)}>
                        {REPORT_LABEL}
                    </Button>
                )}
                {canModerate && (
                    <Button type='button' variant='cell' size='cell' onClick={() => setIsBlockOpen(true)}>
                        {BLOCK_LABEL}
                    </Button>
                )}
                <Button variant='cell' size='cell' asChild>
                    <Link href={`/boards/${post.boardKey}`}>{LIST_LABEL}</Link>
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{DELETE_TITLE}</AlertDialogTitle>
                        <AlertDialogDescription>{DELETE_DESCRIPTION}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={deletePost.isPending}>
                            {CANCEL_LABEL}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellDestructive' size='cell' disabled={deletePost.isPending} onClick={handleDelete}>
                            {deletePost.isPending ? DELETING_LABEL : DELETE_LABEL}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ReportDialog open={isReportOpen} isPending={submitReport.isPending} onClose={() => setIsReportOpen(false)} onSubmit={handleReport} />
            <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
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
        </article>
    )
}
