'use client'

import type { FC, MouseEvent } from 'react'
import { useDeleteTrip } from '@/entities/trip/trip.query'
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

export type TripDeleteTarget = { id: string; title: string }

type TripDeleteDialogProps = {
    target: TripDeleteTarget | null
    onOpenChange: (open: boolean) => void
}

export const TripDeleteDialog: FC<TripDeleteDialogProps> = ({ target, onOpenChange }) => {
    const deleteTrip = useDeleteTrip()

    const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (target === null) return
        deleteTrip.mutate(target.id, { onSuccess: () => onOpenChange(false) })
    }

    return (
        <AlertDialog open={target !== null} onOpenChange={onOpenChange}>
            <AlertDialogContent className='rounded-none'>
                <AlertDialogHeader>
                    <AlertDialogTitle>트립을 삭제할까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {target?.title ?? ''}의 날짜별 일정과 예매 목록, 멤버가 함께 삭제됩니다. 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteTrip.isPending}>취소</AlertDialogCancel>
                    <AlertDialogAction variant='destructive' disabled={deleteTrip.isPending} onClick={handleConfirm}>
                        {deleteTrip.isPending ? '삭제 중…' : '삭제'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
