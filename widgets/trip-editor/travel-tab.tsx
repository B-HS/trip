'use client'

import type { FC } from 'react'
import { useSaveFlights, useSaveLodgings } from '@/entities/trip/trip.query'
import type { FlightValues, LodgingValues } from '@/entities/trip/trip.validate'
import { FlightsForm } from '@/features/trip-editor/flights-form'
import { LodgingsForm } from '@/features/trip-editor/lodgings-form'
import { toFlightDefaults, toLodgingDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

export const TravelTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveFlights = useSaveFlights(tripId)
    const saveLodgings = useSaveLodgings(tripId)

    const handleSaveFlights = async (values: FlightValues[]) => {
        try {
            await saveFlights.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }
    const handleSaveLodgings = async (values: LodgingValues[]) => {
        try {
            await saveLodgings.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return (
        <div className='flex flex-col gap-px bg-background'>
            <FlightsForm defaultValues={toFlightDefaults(detail)} onSubmit={handleSaveFlights} isPending={saveFlights.isPending} />
            <LodgingsForm defaultValues={toLodgingDefaults(detail)} onSubmit={handleSaveLodgings} isPending={saveLodgings.isPending} />
        </div>
    )
}
