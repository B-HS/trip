'use client'

import type { FC } from 'react'
import { useSaveBookings } from '@/entities/trip/trip.query'
import type { BookingValues } from '@/entities/trip/trip.validate'
import { BookingsForm } from '@/features/trip-editor/bookings-form'
import { toBookingDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

export const BookingsTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveBookings = useSaveBookings(tripId)

    const handleSubmit = async (values: BookingValues[]) => {
        try {
            await saveBookings.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return <BookingsForm defaultValues={toBookingDefaults(detail)} onSubmit={handleSubmit} isPending={saveBookings.isPending} />
}
