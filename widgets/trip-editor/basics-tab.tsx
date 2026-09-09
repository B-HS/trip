'use client'

import type { FC } from 'react'
import { useSaveDestinations, useUpdateTripBasics } from '@/entities/trip/trip.query'
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

const isSameDestinations = (next: TripBasicsFormValues['destinations'], current: DestinationInput[]) =>
    next.length === current.length &&
    next.every((item, index) => item.id === current[index].id && item.countryCode === current[index].countryCode && item.city === current[index].city)

export const BasicsTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const updateBasics = useUpdateTripBasics(tripId)
    const saveDestinations = useSaveDestinations(tripId)

    const destinations = toDestinationDefaults(detail)

    const handleSubmit = async ({ destinations: nextDestinations, ...basics }: TripBasicsFormValues) => {
        try {
            await updateBasics.mutateAsync(basics)
            if (!isSameDestinations(nextDestinations, destinations)) await saveDestinations.mutateAsync(nextDestinations)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return (
        <BasicsForm
            defaultValues={{ ...toBasicsDefaults(detail), destinations }}
            onSubmit={handleSubmit}
            isPending={updateBasics.isPending || saveDestinations.isPending}
        />
    )
}
