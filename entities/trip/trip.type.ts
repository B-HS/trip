import type { MemberRole } from '@/shared/constant/trip'
import type { Database } from '@/shared/db/client'
import type { user } from '@/shared/db/schema/auth'
import type {
    trip,
    tripBooking,
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
} from '@/shared/db/schema/trip'

export type Trip = typeof trip.$inferSelect
export type TripInsert = typeof trip.$inferInsert
export type TripDestination = typeof tripDestination.$inferSelect
export type TripFlight = typeof tripFlight.$inferSelect
export type TripLodging = typeof tripLodging.$inferSelect
export type TripDay = typeof tripDay.$inferSelect
export type TripDayFact = typeof tripDayFact.$inferSelect
export type TripRoute = typeof tripRoute.$inferSelect
export type TripScheduleItem = typeof tripScheduleItem.$inferSelect
export type TripDayNote = typeof tripDayNote.$inferSelect
export type TripBooking = typeof tripBooking.$inferSelect
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

export type TripRecord = Omit<Trip, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }

export type TripDestinationView = Pick<TripDestination, 'countryCode' | 'city'>

export type PublicTrip = TripRecord & {
    owner: TripOwner
    destinations: TripDestination[]
    flights: TripFlight[]
    lodgings: TripLodging[]
    days: TripDayDetail[]
    bookings: TripBooking[]
    infoSections: TripInfoSectionDetail[]
}

export type TripDetail = PublicTrip & { viewerRole: MemberRole | null }

export type TripSummary = Pick<Trip, 'id' | 'title' | 'eyebrow' | 'destination' | 'startDate' | 'endDate' | 'periodNote'> & {
    role: MemberRole
    dayCount: number
    scheduleCount: number
    bookingCount: number
    updatedAt: string
    isFavorite: boolean
    destinations: TripDestinationView[]
    flights: Array<Pick<TripFlight, 'direction' | 'departCode' | 'arriveCode'>>
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
