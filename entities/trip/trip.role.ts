import type { TripAccessLevel } from '@/entities/trip/trip.type'
import type { MemberRole } from '@/shared/constant/trip'

export const resolveTripRole = ({ ownerId, memberRole }: { ownerId: string; memberRole: MemberRole | null }, userId: string): MemberRole | null =>
    ownerId === userId ? 'owner' : memberRole

export const canView = (role: MemberRole | null) => role !== null

export const canEdit = (role: MemberRole | null) => role === 'owner' || role === 'editor'

export const canManage = (role: MemberRole | null) => role === 'owner'

export const canAccess = (role: MemberRole | null, level: TripAccessLevel) => {
    if (level === 'own') return canManage(role)
    if (level === 'edit') return canEdit(role)
    return canView(role)
}
