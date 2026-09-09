import 'server-only'
import { canAccess, resolveTripRole } from '@/entities/trip/trip.role'
import type { TripAccessLevel } from '@/entities/trip/trip.type'
import type { MemberRole } from '@/shared/constant/trip'
import { getDb } from '@/shared/db/client'
import { ApiError } from '@/shared/lib/api-response'

const readTripRole = async (tripId: string, userId: string) => {
    const row = await getDb().query.trip.findFirst({
        where: (fields, { eq }) => eq(fields.id, tripId),
        columns: { ownerId: true },
        with: { members: { where: (fields, { eq }) => eq(fields.userId, userId), columns: { role: true } } },
    })
    if (!row) return { exists: false, role: null } as const
    return { exists: true, role: resolveTripRole({ ownerId: row.ownerId, memberRole: row.members[0]?.role ?? null }, userId) } as const
}

export const getTripRole = async (tripId: string, userId: string): Promise<MemberRole | null> => (await readTripRole(tripId, userId)).role

export const assertTripAccess = async (tripId: string, userId: string, level: TripAccessLevel) => {
    const { exists, role } = await readTripRole(tripId, userId)
    if (!exists || role === null) throw new ApiError('NOT_FOUND', '여행을 찾을 수 없습니다.')
    if (!canAccess(role, level)) throw new ApiError('FORBIDDEN')
    return role
}
