'use client'

import type { FC } from 'react'
import { useSaveTripBasics } from '@/entities/trip/trip.query'
import type { TripDetail } from '@/entities/trip/trip.type'
import type { DestinationInput, TripBasicsFormValues } from '@/entities/trip/trip.validate'
import { BasicsForm } from '@/features/trip-editor/basics-form'
import { isCountryCode } from '@/shared/constant/countries'
import { toBasicsDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const toDestinationDefaults = (detail: TripDetail) =>
    detail.destinations.flatMap((destination) =>
        isCountryCode(destination.countryCode)
            ? [{ id: destination.id, countryCode: destination.countryCode, city: destination.city } satisfies DestinationInput]
            : [],
    )

export const BasicsTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveBasics = useSaveTripBasics(tripId)

    const handleSubmit = async (values: TripBasicsFormValues) => {
        try {
            await saveBasics.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return (
        <BasicsForm
            defaultValues={{ ...toBasicsDefaults(detail), destinations: toDestinationDefaults(detail) }}
            onSubmit={handleSubmit}
            isPending={saveBasics.isPending}
        />
    )
}
