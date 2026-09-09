'use client'

import { PlusIcon } from 'lucide-react'
import { useState, type FC } from 'react'
import type { TripDay } from '@/entities/trip/trip.type'
import { EditorToolbar } from '@/features/trip-editor/editor-toolbar'
import { reorderItems } from '@/features/trip-editor/reorder'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'

type DayListItem = Pick<TripDay, 'id' | 'shortLabel' | 'title'>

type DayListProps = {
    days: DayListItem[]
    selectedDayId: string | null
    onSelect: (dayId: string) => void
    onCreate: () => void
    onDelete: (dayId: string) => void
    onReorder: (dayIds: string[]) => void
    isPending: boolean
}

export const DayList: FC<DayListProps> = ({ days, selectedDayId, onSelect, onCreate, onDelete, onReorder, isPending }) => {
    const [deletingDayId, setDeletingDayId] = useState<string | null>(null)

    const deletingDay = days.find((day) => day.id === deletingDayId)
    const handleReorder = (from: number, to: number) =>
        onReorder(
            reorderItems(
                days.map((day) => day.id),
                { from, to },
            ),
        )
    const handleDelete = () => {
        if (deletingDayId === null) return
        onDelete(deletingDayId)
        setDeletingDayId(null)
    }

    return (
        <div className='flex flex-col gap-px bg-background'>
            <EditorToolbar
                title='날짜'
                count={days.length}
                action={
                    <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={onCreate}>
                        <PlusIcon />
                        날짜 추가
                    </Button>
                }
            />
            {days.length === 0 ? (
                <p className='bg-card p-3 text-xs text-muted-foreground'>등록된 날짜가 없습니다.</p>
            ) : (
                <SortableRows ids={days.map((day) => day.id)} onReorder={handleReorder}>
                    {days.map((day, index) => (
                        <SortableRow
                            key={day.id}
                            id={day.id}
                            index={index}
                            removeLabel='날짜 삭제'
                            isActive={day.id === selectedDayId}
                            onRemove={() => setDeletingDayId(day.id)}>
                            <button
                                className='flex w-full min-w-0 items-center gap-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
                                type='button'
                                onClick={() => onSelect(day.id)}>
                                <span className='font-mono text-xs tabular-nums'>{day.shortLabel}</span>
                                <span className='min-w-0 flex-1 truncate text-xs'>{day.title}</span>
                            </button>
                        </SortableRow>
                    ))}
                </SortableRows>
            )}
            <AlertDialog open={deletingDayId !== null} onOpenChange={(isOpen) => !isOpen && setDeletingDayId(null)}>
                <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>날짜를 삭제할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deletingDay === undefined
                                ? '이 날짜의 일정과 경로가 함께 삭제됩니다.'
                                : `${deletingDay.shortLabel} ${deletingDay.title} 의 일정과 경로가 함께 삭제됩니다.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background'>
                        <AlertDialogCancel variant='cell' size='cell'>
                            취소
                        </AlertDialogCancel>
                        <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={handleDelete}>
                            삭제
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
