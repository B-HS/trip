'use client'

import { useState, type FC } from 'react'
import { useDeleteDay, useReorderDays, useSaveDay } from '@/entities/trip/trip.query'
import type { DayValues } from '@/entities/trip/trip.validate'
import { DayForm } from '@/features/trip-editor/day-form'
import { DayList } from '@/features/trip-editor/day-list'
import { toDayDefaults, toDayDraft, toDayHeading } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const DRAFT_KEY = 'new'
const DRAFT_HEADING = '새 날짜'
const NOT_FOUND_INDEX = -1
const DRAFT_SEQ_STEP = 1

export const DaysTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const [editingDayId, setEditingDayId] = useState<string | null>(detail.days[0]?.id ?? null)
    const [draftSeq, setDraftSeq] = useState(0)
    const saveDay = useSaveDay(tripId)
    const deleteDay = useDeleteDay(tripId)
    const reorderDays = useReorderDays(tripId)

    const selectedIndex = detail.days.findIndex((day) => day.id === editingDayId)
    const selectedDay = selectedIndex === NOT_FOUND_INDEX ? undefined : detail.days[selectedIndex]
    const heading = selectedDay === undefined ? DRAFT_HEADING : toDayHeading(selectedDay, selectedIndex)
    const defaultValues = selectedDay === undefined ? toDayDraft(detail) : toDayDefaults(selectedDay)
    const formKey = selectedDay?.id ?? `${DRAFT_KEY}-${draftSeq}`

    const startDraft = () => {
        setEditingDayId(null)
        setDraftSeq(draftSeq + DRAFT_SEQ_STEP)
    }
    const handleDelete = async (dayId: string) => {
        await deleteDay.mutateAsync(dayId).catch(() => null)
        if (dayId === editingDayId) startDraft()
    }
    const handleSubmit = async (values: DayValues) => {
        try {
            const saved = await saveDay.mutateAsync(values)
            onSaved()
            setEditingDayId(saved.id)
            return saved.id
        } catch {
            return null
        }
    }

    return (
        <div className='grid gap-px bg-background lg:grid-cols-[18rem_minmax(0,1fr)]'>
            <DayList
                days={detail.days}
                selectedDayId={editingDayId}
                onSelect={setEditingDayId}
                onCreate={startDraft}
                onDelete={handleDelete}
                onReorder={(dayIds) => reorderDays.mutate(dayIds)}
                isPending={deleteDay.isPending || reorderDays.isPending}
            />
            <DayForm key={formKey} heading={heading} defaultValues={defaultValues} onSubmit={handleSubmit} isPending={saveDay.isPending} />
        </div>
    )
}
