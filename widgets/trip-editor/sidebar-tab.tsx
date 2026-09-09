'use client'

import type { FC } from 'react'
import { useSaveSidebar } from '@/entities/trip/trip.query'
import type { SidebarValues } from '@/entities/trip/trip.validate'
import { SidebarForm } from '@/features/trip-editor/sidebar-form'
import { toSidebarDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

export const SidebarTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const saveSidebar = useSaveSidebar(tripId)

    const handleSubmit = async (values: SidebarValues) => {
        try {
            await saveSidebar.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return <SidebarForm defaultValues={toSidebarDefaults(detail)} onSubmit={handleSubmit} isPending={saveSidebar.isPending} />
}
