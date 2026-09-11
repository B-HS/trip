'use client'

import { useRouter } from 'next/navigation'
import { useState, type FC, type MouseEvent } from 'react'
import { useBlockUser, useSubmitReport, useUnblockUser } from '@/entities/community/community.query'
import { ReportDialog, type ReportFormValues } from '@/features/community/report-dialog'
import { BLOCK_LABEL, BLOCKING_LABEL, REPORT_LABEL, UNBLOCK_LABEL } from '@/features/community/community.constant'
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

const BLOCK_TITLE = '이 사용자를 차단할까요?'
const BLOCK_DESCRIPTION = '차단하면 이 사용자의 글과 댓글을 더 이상 볼 수 없습니다.'
const CANCEL_LABEL = '취소'

export type ProfileModerationWidgetProps = {
    userId: string
    isBlocked: boolean
}

export const ProfileModerationWidget: FC<ProfileModerationWidgetProps> = ({ userId, isBlocked }) => {
    const [isBlockOpen, setIsBlockOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const router = useRouter()
    const blockUser = useBlockUser()
    const unblockUser = useUnblockUser()
    const submitReport = useSubmitReport()

    const handleBlock = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        blockUser.mutate(userId, {
            onSuccess: () => {
                setIsBlockOpen(false)
                router.refresh()
            },
        })
    }

    const handleReport = (values: ReportFormValues) => {
        submitReport.mutate({ kind: 'user', targetId: userId, ...values }, { onSuccess: () => setIsReportOpen(false) })
    }

    return (
        <>
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                {isBlocked ? (
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        disabled={unblockUser.isPending}
                        onClick={() => unblockUser.mutate(userId, { onSuccess: () => router.refresh() })}>
                        {UNBLOCK_LABEL}
                    </Button>
                ) : (
                    <Button type='button' variant='cell' size='cell' onClick={() => setIsBlockOpen(true)}>
                        {BLOCK_LABEL}
                    </Button>
                )}
                <Button type='button' variant='cell' size='cell' onClick={() => setIsReportOpen(true)}>
                    {REPORT_LABEL}
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
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
            <ReportDialog open={isReportOpen} isPending={submitReport.isPending} onClose={() => setIsReportOpen(false)} onSubmit={handleReport} />
        </>
    )
}
