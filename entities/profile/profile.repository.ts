import 'server-only'
import { and, eq, inArray, isNotNull, sum } from 'drizzle-orm'
import type { ProfileSettings, PublicProfile } from '@/entities/profile/profile.type'
import type { ProfileUpdateValues } from '@/entities/profile/profile.validate'
import { findPublicTripCardPage, publicTripCondition } from '@/entities/trip/trip.repository.explore'
import type { UploadKind } from '@/shared/constant/upload'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { tripLike, tripPointLedger } from '@/shared/db/schema/community'
import { trip, tripUpload } from '@/shared/db/schema/trip'
import { ApiError } from '@/shared/lib/api-response'

const NO_POINTS = 0
const AVATAR_KIND: UploadKind = 'avatar'
const BANNER_KIND: UploadKind = 'banner'
const PROFILE_NOT_FOUND = 'error.profileNotFound'
const UPLOAD_NOT_FOUND = 'error.uploadNotFound'

const profileSettingsColumns = { name: user.name, username: user.username, image: user.image, bannerUrl: user.bannerUrl, bio: user.bio }

const findPoints = async (userId: string) => {
    const [row] = await getDb()
        .select({ value: sum(tripPointLedger.delta) })
        .from(tripPointLedger)
        .where(eq(tripPointLedger.userId, userId))
    return Number(row?.value ?? NO_POINTS)
}

const resolveUploadUrl = async (uploadId: string | null | undefined, ownerId: string, kind: UploadKind) => {
    if (uploadId === undefined || uploadId === null) return null
    const [row] = await getDb()
        .select({ url: tripUpload.url })
        .from(tripUpload)
        .where(and(eq(tripUpload.id, uploadId), eq(tripUpload.ownerId, ownerId), eq(tripUpload.kind, kind)))
        .limit(1)
    if (!row) throw new ApiError('VALIDATION_ERROR', UPLOAD_NOT_FOUND)
    return row.url
}

export const findProfileByUsername = async (username: string) => {
    const [row] = await getDb()
        .select({ id: user.id, ...profileSettingsColumns, createdAt: user.createdAt })
        .from(user)
        .where(eq(user.username, username))
        .limit(1)
    if (!row) return null
    const { createdAt, ...rest } = row
    return { ...rest, points: await findPoints(row.id), createdAt: createdAt.toISOString() } satisfies PublicProfile
}

export const findProfileSettings = async (userId: string) => {
    const [row] = await getDb().select(profileSettingsColumns).from(user).where(eq(user.id, userId)).limit(1)
    return row === undefined ? null : (row satisfies ProfileSettings)
}

export const updateProfile = async (userId: string, values: ProfileUpdateValues) => {
    const [image, bannerUrl] = await Promise.all([
        resolveUploadUrl(values.avatarUploadId, userId, AVATAR_KIND),
        resolveUploadUrl(values.bannerUploadId, userId, BANNER_KIND),
    ])
    const avatarChange = values.avatarUploadId === undefined ? {} : { image }
    const bannerChange = values.bannerUploadId === undefined ? {} : { bannerUrl, bannerUploadId: values.bannerUploadId }
    await getDb()
        .update(user)
        .set({ name: values.name, bio: values.bio, ...avatarChange, ...bannerChange })
        .where(eq(user.id, userId))
    const settings = await findProfileSettings(userId)
    if (settings === null) throw new ApiError('NOT_FOUND', PROFILE_NOT_FOUND)
    return settings
}

export const isUsernameTaken = async (username: string) => {
    const [row] = await getDb().select({ id: user.id }).from(user).where(eq(user.username, username)).limit(1)
    return row !== undefined
}

export const changeUsername = async (userId: string, username: string) => {
    await getDb().update(user).set({ username }).where(eq(user.id, userId))
    const settings = await findProfileSettings(userId)
    if (settings === null) throw new ApiError('NOT_FOUND', PROFILE_NOT_FOUND)
    return settings
}

export const findPublicTripsByOwner = async (userId: string, page: number) =>
    findPublicTripCardPage(and(publicTripCondition(), eq(trip.ownerId, userId)), page)

/** Public profile records used by the cached sitemap. Banned or username-less users are omitted. */
export const findPublicProfilesForSitemap = async () =>
    getDb()
        .select({ username: user.username, updatedAt: user.updatedAt })
        .from(user)
        .where(and(isNotNull(user.username), eq(user.banned, false)))
        .orderBy(user.updatedAt)

export const findLikedTrips = async (userId: string, page: number) =>
    findPublicTripCardPage(
        and(publicTripCondition(), inArray(trip.id, getDb().select({ tripId: tripLike.tripId }).from(tripLike).where(eq(tripLike.userId, userId)))),
        page,
    )
