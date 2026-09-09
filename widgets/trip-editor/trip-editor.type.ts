import type { TripDetail } from '@/entities/trip/trip.type'

export type TripEditorTabProps = {
    tripId: string
    detail: TripDetail
    isUploadEnabled: boolean
    onSaved: () => void
}
