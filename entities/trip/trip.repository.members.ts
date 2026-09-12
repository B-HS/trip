import 'server-only'
import { and, eq, isNull } from 'drizzle-orm'
import type { AssignableRole, InviteResult, TripInviteView, TripMemberView } from '@/entities/trip/trip.type'
import type { MemberRole } from '@/shared/constant/trip'
import { normalizeEmail } from '@/shared/db/accept-invites'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { trip, tripInvite, tripMember } from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'

const ROLE_RANK = { owner: 0, editor: 1, viewer: 2 } as const satisfies Record<MemberRole, number>

const findOwnerId = async (tripId: string) => {
    const [row] = await getDb().select({ ownerId: trip.ownerId }).from(trip).where(eq(trip.id, tripId))
    if (!row) throw new ApiError('NOT_FOUND', 'error.tripNotFound')
    return row.ownerId
}

export const findTripMembers = async (tripId: string) => {
    const rows = await getDb().query.tripMember.findMany({
        where: (fields, { eq: equals }) => equals(fields.tripId, tripId),
        with: { user: { columns: { id: true, name: true, email: true, username: true, image: true } } },
    })
    return rows
        .map(
            (row) =>
                ({
                    userId: row.userId,
                    name: row.user.name,
                    email: row.user.email,
                    username: row.user.username,
                    image: row.user.image,
                    role: row.role,
                }) satisfies TripMemberView,
        )
        .sort((left, right) => ROLE_RANK[left.role] - ROLE_RANK[right.role] || left.name.localeCompare(right.name))
}

export const findTripInvites = async (tripId: string) => {
    const rows = await getDb()
        .select({ id: tripInvite.id, email: tripInvite.email, role: tripInvite.role, createdAt: tripInvite.createdAt })
        .from(tripInvite)
        .where(and(eq(tripInvite.tripId, tripId), isNull(tripInvite.acceptedAt)))
    return rows.map((row) => ({ id: row.id, email: row.email, role: row.role, createdAt: row.createdAt.toISOString() }) satisfies TripInviteView)
}

export const addMember = async (tripId: string, userId: string, role: AssignableRole) => {
    await getDb().insert(tripMember).values({ tripId, userId, role }).onDuplicateKeyUpdate({ set: { role } })
    return { kind: 'member', userId } as const
}

export const inviteMember = async (tripId: string, email: string, role: AssignableRole, invitedBy: string): Promise<InviteResult> => {
    const db = getDb()
    const normalized = normalizeEmail(email)
    const ownerId = await findOwnerId(tripId)
    const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, normalized))
    if (existingUser) {
        if (existingUser.id === ownerId) throw new ApiError('VALIDATION_ERROR', 'error.ownerAlreadyMember')
        return addMember(tripId, existingUser.id, role)
    }
    const [existingInvite] = await db
        .select({ id: tripInvite.id })
        .from(tripInvite)
        .where(and(eq(tripInvite.tripId, tripId), eq(tripInvite.email, normalized)))
    if (existingInvite) {
        await db.update(tripInvite).set({ role, invitedBy, acceptedAt: null }).where(eq(tripInvite.id, existingInvite.id))
        return { kind: 'invite', inviteId: existingInvite.id }
    }
    const inviteId = crypto.randomUUID()
    await db.insert(tripInvite).values({ id: inviteId, tripId, email: normalized, role, invitedBy })
    return { kind: 'invite', inviteId }
}

export const updateMemberRole = async (tripId: string, userId: string, role: AssignableRole) => {
    const ownerId = await findOwnerId(tripId)
    if (ownerId === userId) throw new ApiError('VALIDATION_ERROR', 'error.ownerRoleImmutable')
    await getDb()
        .update(tripMember)
        .set({ role })
        .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)))
}

export const removeMember = async (tripId: string, userId: string) => {
    const ownerId = await findOwnerId(tripId)
    if (ownerId === userId) throw new ApiError('VALIDATION_ERROR', 'error.ownerCannotRemove')
    await getDb()
        .delete(tripMember)
        .where(and(eq(tripMember.tripId, tripId), eq(tripMember.userId, userId)))
}

export const removeInvite = async (tripId: string, inviteId: string) => {
    await getDb()
        .delete(tripInvite)
        .where(and(eq(tripInvite.tripId, tripId), eq(tripInvite.id, inviteId)))
}

export const findTripMemberUserIds = async (tripId: string) => {
    const rows = await getDb().select({ userId: tripMember.userId }).from(tripMember).where(eq(tripMember.tripId, tripId))
    return rows.map((row) => row.userId)
}
