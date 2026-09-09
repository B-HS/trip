'use client'

import type { FC } from 'react'
import { useUpdateTripBasics } from '@/entities/trip/trip.query'
import type { TripBasicsValues } from '@/entities/trip/trip.validate'
import { BasicsForm } from '@/features/trip-editor/basics-form'
import { toBasicsDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

export const BasicsTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const updateBasics = useUpdateTripBasics(tripId)

    const handleSubmit = async (values: TripBasicsValues) => {
        try {
            await updateBasics.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return <BasicsForm defaultValues={toBasicsDefaults(detail)} onSubmit={handleSubmit} isPending={updateBasics.isPending} />
}
