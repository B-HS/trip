'use client'

import type { FC } from 'react'
import { useSaveInfoSections } from '@/entities/trip/trip.query'
import type { InfoSectionValues } from '@/entities/trip/trip.validate'
import { InfoSectionsForm } from '@/features/trip-editor/info-sections-form'
import { toInfoSectionDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

export const InfoTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveInfoSections = useSaveInfoSections(tripId)

    const handleSubmit = async (values: InfoSectionValues[]) => {
        try {
            await saveInfoSections.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return <InfoSectionsForm defaultValues={toInfoSectionDefaults(detail)} onSubmit={handleSubmit} isPending={saveInfoSections.isPending} />
}
