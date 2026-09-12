'use client'

import type { FC, MouseEvent } from 'react'
import { useTranslations } from 'next-intl'
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
    const t = useTranslations('trips.deleteDialog')
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
                    <AlertDialogTitle>{t('title')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('description', { title: target?.title ?? '' })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                    <AlertDialogCancel variant='cell' size='cell' disabled={deleteTrip.isPending}>
                        {t('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction variant='cellDestructive' size='cell' disabled={deleteTrip.isPending} onClick={handleConfirm}>
                        {deleteTrip.isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
