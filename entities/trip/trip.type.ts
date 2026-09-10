import type { MemberRole } from '@/shared/constant/trip'
import type { Database } from '@/shared/db/client'
import type { user } from '@/shared/db/schema/auth'
import type {
    trip,
    tripBooking,
    tripBookingAttachment,
    tripDay,
    tripDayFact,
    tripDayNote,
    tripDestination,
    tripFlight,
    tripInfoBlock,
    tripInfoSection,
    tripInvite,
    tripLodging,
    tripMember,
    tripRoute,
    tripScheduleItem,
    tripScheduleKind,
    tripSidebarLink,
    tripUpload,
} from '@/shared/db/schema/trip'
import type { LikeState } from '@/shared/lib/like-mutation'

export type Trip = typeof trip.$inferSelect
export type TripInsert = typeof trip.$inferInsert
export type TripDestination = typeof tripDestination.$inferSelect
export type TripFlight = typeof tripFlight.$inferSelect
export type TripLodging = typeof tripLodging.$inferSelect
export type TripSidebarLink = typeof tripSidebarLink.$inferSelect
export type TripDay = typeof tripDay.$inferSelect
export type TripDayFact = typeof tripDayFact.$inferSelect
export type TripRoute = typeof tripRoute.$inferSelect
export type TripScheduleItem = typeof tripScheduleItem.$inferSelect
export type TripScheduleKind = typeof tripScheduleKind.$inferSelect
export type TripDayNote = typeof tripDayNote.$inferSelect
export type TripBooking = typeof tripBooking.$inferSelect
export type TripBookingAttachment = typeof tripBookingAttachment.$inferSelect
export type TripUpload = typeof tripUpload.$inferSelect
export type TripInfoSection = typeof tripInfoSection.$inferSelect
export type TripInfoBlock = typeof tripInfoBlock.$inferSelect
export type TripMember = typeof tripMember.$inferSelect
export type TripInvite = typeof tripInvite.$inferSelect
export type TripUser = typeof user.$inferSelect

export type TripOwner = Pick<TripUser, 'id' | 'name' | 'username' | 'image'>

export type TripDayDetail = TripDay & {
    facts: TripDayFact[]
    routes: TripRoute[]
    scheduleItems: TripScheduleItem[]
    notes: TripDayNote[]
}

export type TripInfoSectionDetail = TripInfoSection & { blocks: TripInfoBlock[] }

export type TripBookingDetail = TripBooking & { attachments: TripBookingAttachment[] }

export type TripRecord = Omit<Trip, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }

export type TripDestinationView = Pick<TripDestination, 'countryCode' | 'city'>

export type PublicTrip = TripRecord & {
    owner: TripOwner
    destinations: TripDestination[]
    flights: TripFlight[]
    lodgings: TripLodging[]
    sidebarLinks: TripSidebarLink[]
    scheduleKinds: TripScheduleKind[]
    days: TripDayDetail[]
    bookings: TripBookingDetail[]
    infoSections: TripInfoSectionDetail[]
}

export type TripDetail = PublicTrip & { viewerRole: MemberRole | null }

export type TripSummary = Pick<
    Trip,
    'id' | 'title' | 'eyebrow' | 'destination' | 'departureAirportCode' | 'startDate' | 'endDate' | 'customNights' | 'customDays' | 'periodNote'
> & {
    role: MemberRole
    dayCount: number
    scheduleCount: number
    bookingCount: number
    updatedAt: string
    isFavorite: boolean
    destinations: TripDestinationView[]
    flights: Array<Pick<TripFlight, 'direction' | 'departCode' | 'arriveCode'>>
}

export type PublicTripCard = Pick<
    Trip,
    'id' | 'title' | 'eyebrow' | 'destination' | 'startDate' | 'endDate' | 'customNights' | 'customDays' | 'periodNote' | 'likeCount'
> & {
    shareSlug: string
    owner: TripOwner
    destinations: TripDestinationView[]
    flights: Array<Pick<TripFlight, 'direction' | 'departCode' | 'arriveCode'>>
    updatedAt: string
}

export type PublicTripCardPage = {
    items: PublicTripCard[]
    page: number
    pageSize: number
    total: number
    pageCount: number
}

export type TripLikeState = LikeState

export type HomeTrips = {
    thisWeek: PublicTripCard[]
    thisMonth: PublicTripCard[]
    recent: PublicTripCard[]
    popular: PublicTripCard[]
}

export type TripMemberView = Pick<TripUser, 'name' | 'email' | 'username' | 'image'> & { userId: string; role: MemberRole }

export type TripInviteView = Pick<TripInvite, 'id' | 'email' | 'role'> & { createdAt: string }

export type TripMembersView = { members: TripMemberView[]; invites: TripInviteView[] }

export type TripAccessLevel = 'view' | 'edit' | 'own'

export type AssignableRole = Exclude<MemberRole, 'owner'>

export type InviteResult = { kind: 'member'; userId: string } | { kind: 'invite'; inviteId: string }

export type ShareSettings = { slug: string; isPublic: boolean }

export type CreatedTrip = { id: string }

export type SavedRow = { id: string }

export type SavedDay = SavedRow & { facts: SavedRow[]; routes: SavedRow[]; scheduleItems: SavedRow[]; notes: SavedRow[] }

export type TripTransaction = Parameters<Parameters<Database['transaction']>[0]>[0]
