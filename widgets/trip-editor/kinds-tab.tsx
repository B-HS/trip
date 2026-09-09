'use client'

import type { FC } from 'react'
import { useSaveScheduleKinds } from '@/entities/trip/trip.query'
import type { ScheduleKindsSaveValues } from '@/entities/trip/trip.validate'
import { KindsForm } from '@/features/trip-editor/kinds-form'
import { toKindsDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const FIRST_USAGE = 1

export const KindsTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveScheduleKinds = useSaveScheduleKinds(tripId)

    const usageByKindId = detail.days
        .flatMap((day) => day.scheduleItems)
        .reduce<Record<string, number>>((usage, item) => ({ ...usage, [item.kindId]: (usage[item.kindId] ?? 0) + FIRST_USAGE }), {})
    const formKey = detail.scheduleKinds.map((kind) => kind.id).join('|')
    const handleSubmit = async (values: ScheduleKindsSaveValues) => {
        try {
            await saveScheduleKinds.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return (
        <KindsForm
            key={formKey}
            defaultValues={toKindsDefaults(detail)}
            usageByKindId={usageByKindId}
            onSubmit={handleSubmit}
            isPending={saveScheduleKinds.isPending}
        />
    )
}
