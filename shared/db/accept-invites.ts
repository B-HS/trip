import 'server-only'
import { and, eq, isNull } from 'drizzle-orm'
import { getDb } from '@/shared/db/client'
import { trip, tripInvite, tripMember } from '@/shared/db/schema/trip'
import { touchTrip } from '@/entities/trip/trip.repository.days'

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const acceptPendingInvitesForUser = async (invitedUser: { id: string; email: string }) => {
    const db = getDb()
    const normalized = normalizeEmail(invitedUser.email)
    const invites = await db
        .select({ id: tripInvite.id, tripId: tripInvite.tripId, role: tripInvite.role })
        .from(tripInvite)
        .where(and(eq(tripInvite.email, normalized), isNull(tripInvite.acceptedAt)))
    if (invites.length === 0) return { accepted: 0 }
    await db.transaction(async (tx) => {
        const acceptedAt = new Date()
        for (const invite of invites) {
            const [lockedTrip] = await tx.select({ id: trip.id }).from(trip).where(eq(trip.id, invite.tripId)).for('update')
            if (!lockedTrip) continue
            await tx
                .insert(tripMember)
                .values({ tripId: invite.tripId, userId: invitedUser.id, role: invite.role })
                .onDuplicateKeyUpdate({ set: { role: invite.role } })
            await tx.update(tripInvite).set({ acceptedAt }).where(eq(tripInvite.id, invite.id))
            await touchTrip(tx, invite.tripId)
        }
    })
    return { accepted: invites.length }
}
