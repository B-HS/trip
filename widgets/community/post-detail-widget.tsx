'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
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

export type PostDetailWidgetProps = {
    post: PostDetailView
    html: SanitizedRichTextHtml
    viewer: CommunityViewer | null
}

export const PostDetailWidget: FC<PostDetailWidgetProps> = ({ post, html, viewer }) => {
    const t = useTranslations('community.post')
    const tMod = useTranslations('community.moderation')
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
                        <Link href={`/boards/${post.boardKey}/${post.id}/edit`}>{t('edit')}</Link>
                    </Button>
                )}
                {canManagePost(viewer, post.author.id) && (
                    <Button type='button' variant='cellDestructive' size='cell' onClick={() => setIsDeleteOpen(true)}>
                        {t('delete')}
                    </Button>
                )}
                {canModerate && (
                    <Button type='button' variant='cell' size='cell' onClick={() => setIsReportOpen(true)}>
                        {tMod('report')}
                    </Button>
                )}
                {canModerate && (
                    <Button type='button' variant='cell' size='cell' onClick={() => setIsBlockOpen(true)}>
                        {tMod('block')}
                    </Button>
                )}
                <Button variant='cell' size='cell' asChild>
                    <Link href={`/boards/${post.boardKey}`}>{t('list')}</Link>
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={deletePost.isPending}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellDestructive' size='cell' disabled={deletePost.isPending} onClick={handleDelete}>
                            {deletePost.isPending ? t('deleting') : t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ReportDialog open={isReportOpen} isPending={submitReport.isPending} onClose={() => setIsReportOpen(false)} onSubmit={handleReport} />
            <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('blockTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('blockDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={blockUser.isPending}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellDestructive' size='cell' disabled={blockUser.isPending} onClick={handleBlock}>
                            {blockUser.isPending ? tMod('blocking') : tMod('block')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </article>
    )
}
