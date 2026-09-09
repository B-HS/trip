'use client'

import type { FC } from 'react'
import { useSaveBookings } from '@/entities/trip/trip.query'
import type { BookingValues } from '@/entities/trip/trip.validate'
import { useUploadImage } from '@/entities/upload/upload.query'
import { BookingsForm } from '@/features/trip-editor/bookings-form'
import { toBookingDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const UPLOAD_KIND = 'booking'

export const BookingsTab: FC<TripEditorTabProps> = ({ tripId, detail, isUploadEnabled, onSaved }) => {
    const saveBookings = useSaveBookings(tripId)
    const uploadImage = useUploadImage(UPLOAD_KIND)

    const handleSubmit = async (values: BookingValues[]) => {
        try {
            await saveBookings.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    const handleUploadImage = async (file: File) => {
        try {
            return await uploadImage.mutateAsync(file)
        } catch {
            return null
        }
    }

    return (
        <BookingsForm
            defaultValues={toBookingDefaults(detail)}
            onSubmit={handleSubmit}
            isPending={saveBookings.isPending}
            isUploadEnabled={isUploadEnabled}
            isUploading={uploadImage.isPending}
            onUploadImage={handleUploadImage}
        />
    )
}
