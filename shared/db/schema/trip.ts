import { relations } from 'drizzle-orm'
import { boolean, date, index, int, mysqlEnum, primaryKey, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core'
import { user } from '@/shared/db/schema/auth'
import { tripTable } from '@/shared/db/table'
import {
    BOOKING_PRIORITIES,
    FLIGHT_DIRECTIONS,
    INFO_BLOCK_KINDS,
    MEMBER_ROLES,
    SCHEDULE_KIND_BUFFER_LABEL_MAX_LENGTH,
    SCHEDULE_KIND_COLOR_TOKENS,
    SCHEDULE_KIND_KEY_MAX_LENGTH,
    SCHEDULE_KIND_LABEL_MAX_LENGTH,
    SCHEDULE_KIND_LEGEND_LABEL_MAX_LENGTH,
} from '@/shared/constant/trip'
import { UPLOAD_ATTACHMENT_KINDS, UPLOAD_KINDS } from '@/shared/constant/upload'

const id = () =>
    varchar('id', { length: 36 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID())

const createdAt = () => timestamp('created_at', { fsp: 3 }).defaultNow().notNull()

const updatedAt = () =>
    timestamp('updated_at', { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull()

export const trip = tripTable(
    'trip',
    {
        id: id(),
        ownerId: varchar('owner_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        title: varchar('title', { length: 120 }).notNull(),
        eyebrow: varchar('eyebrow', { length: 120 }),
        destination: varchar('destination', { length: 120 }).notNull(),
        startDate: date('start_date', { mode: 'string' }).notNull(),
        endDate: date('end_date', { mode: 'string' }).notNull(),
        customNights: int('nights'),
        customDays: int('days'),
        periodNote: varchar('period_note', { length: 200 }),
        disclaimer: varchar('disclaimer', { length: 300 }),
        verifiedOn: date('verified_on', { mode: 'string' }),
        bufferPolicy: text('buffer_policy'),
        bookingNote: text('booking_note'),
        footerNote: text('footer_note'),
        sidebarNote: text('sidebar_note'),
        shareSlug: varchar('share_slug', { length: 64 }),
        isPublic: boolean('is_public').default(false).notNull(),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [index('trip_owner_id_idx').on(table.ownerId), uniqueIndex('trip_share_slug_idx').on(table.shareSlug)],
)

export const tripMember = tripTable(
    'member',
    {
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        role: mysqlEnum('role', MEMBER_ROLES).notNull(),
        createdAt: createdAt(),
    },
    (table) => [primaryKey({ columns: [table.tripId, table.userId] }), index('member_user_id_idx').on(table.userId)],
)

export const tripInvite = tripTable(
    'invite',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        email: varchar('email', { length: 255 }).notNull(),
        role: mysqlEnum('role', MEMBER_ROLES).notNull(),
        invitedBy: varchar('invited_by', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        acceptedAt: timestamp('accepted_at', { fsp: 3 }),
        createdAt: createdAt(),
    },
    (table) => [uniqueIndex('invite_trip_email_idx').on(table.tripId, table.email), index('invite_email_idx').on(table.email)],
)

export const tripDestination = tripTable(
    'destination',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        countryCode: varchar('country_code', { length: 2 }).notNull(),
        city: varchar('city', { length: 80 }),
        createdAt: createdAt(),
    },
    (table) => [index('destination_trip_id_idx').on(table.tripId)],
)

export const tripFlight = tripTable(
    'flight',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        direction: mysqlEnum('direction', FLIGHT_DIRECTIONS).notNull(),
        label: varchar('label', { length: 120 }).notNull(),
        departCode: varchar('depart_code', { length: 8 }).notNull(),
        departTime: varchar('depart_time', { length: 8 }).notNull(),
        departTerminal: varchar('depart_terminal', { length: 32 }),
        arriveCode: varchar('arrive_code', { length: 8 }).notNull(),
        arriveTime: varchar('arrive_time', { length: 8 }).notNull(),
        arriveTerminal: varchar('arrive_terminal', { length: 32 }),
        flightNumber: varchar('flight_number', { length: 32 }),
        note: varchar('note', { length: 200 }),
    },
    (table) => [index('flight_trip_id_idx').on(table.tripId)],
)

export const tripLodging = tripTable(
    'lodging',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        name: varchar('name', { length: 160 }).notNull(),
        nameLocal: varchar('name_local', { length: 160 }),
        address: varchar('address', { length: 255 }),
        accessNote: varchar('access_note', { length: 255 }),
        checkIn: varchar('check_in', { length: 8 }),
        checkOut: varchar('check_out', { length: 8 }),
        url: varchar('url', { length: 500 }),
        note: varchar('note', { length: 255 }),
    },
    (table) => [index('lodging_trip_id_idx').on(table.tripId)],
)

export const tripSidebarLink = tripTable(
    'sidebar_link',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        label: varchar('label', { length: 80 }).notNull(),
        url: varchar('url', { length: 500 }).notNull(),
        description: varchar('description', { length: 200 }),
    },
    (table) => [index('sidebar_link_trip_id_idx').on(table.tripId)],
)

export const tripDay = tripTable(
    'day',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        dayIndex: int('day_index').notNull(),
        date: date('date', { mode: 'string' }).notNull(),
        shortLabel: varchar('short_label', { length: 40 }).notNull(),
        title: varchar('title', { length: 120 }).notNull(),
        subtitle: varchar('subtitle', { length: 200 }),
        overview: text('overview'),
        planHeadline: varchar('plan_headline', { length: 255 }),
        planNote: text('plan_note'),
        closingHeadline: varchar('closing_headline', { length: 255 }),
        closingNote: text('closing_note'),
        morningSummary: varchar('morning_summary', { length: 120 }),
        afternoonSummary: varchar('afternoon_summary', { length: 120 }),
        eveningSummary: varchar('evening_summary', { length: 120 }),
    },
    (table) => [index('day_trip_id_idx').on(table.tripId), uniqueIndex('day_trip_index_idx').on(table.tripId, table.dayIndex)],
)

export const tripDayFact = tripTable(
    'day_fact',
    {
        id: id(),
        dayId: varchar('day_id', { length: 36 })
            .notNull()
            .references(() => tripDay.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        label: varchar('label', { length: 80 }).notNull(),
        value: varchar('value', { length: 255 }).notNull(),
    },
    (table) => [index('day_fact_day_id_idx').on(table.dayId)],
)

export const tripRoute = tripTable(
    'route',
    {
        id: id(),
        dayId: varchar('day_id', { length: 36 })
            .notNull()
            .references(() => tripDay.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        origin: varchar('origin', { length: 120 }).notNull(),
        destination: varchar('destination', { length: 120 }).notNull(),
        minutes: int('minutes').notNull(),
        pathText: varchar('path_text', { length: 255 }),
        formula: varchar('formula', { length: 255 }),
    },
    (table) => [index('route_day_id_idx').on(table.dayId)],
)

export const tripScheduleKind = tripTable(
    'schedule_kind',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        key: varchar('key', { length: SCHEDULE_KIND_KEY_MAX_LENGTH }).notNull(),
        label: varchar('label', { length: SCHEDULE_KIND_LABEL_MAX_LENGTH }).notNull(),
        legendLabel: varchar('legend_label', { length: SCHEDULE_KIND_LEGEND_LABEL_MAX_LENGTH }).notNull(),
        colorToken: mysqlEnum('color_token', SCHEDULE_KIND_COLOR_TOKENS).notNull().default('muted'),
        bufferLabel: varchar('buffer_label', { length: SCHEDULE_KIND_BUFFER_LABEL_MAX_LENGTH }),
        sortOrder: int('sort_order').notNull().default(0),
    },
    (table) => [index('schedule_kind_trip_id_idx').on(table.tripId), uniqueIndex('schedule_kind_trip_key_idx').on(table.tripId, table.key)],
)

export const tripScheduleItem = tripTable(
    'schedule_item',
    {
        id: id(),
        dayId: varchar('day_id', { length: 36 })
            .notNull()
            .references(() => tripDay.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        timeLabel: varchar('time_label', { length: 40 }).notNull(),
        title: varchar('title', { length: 200 }).notNull(),
        kindId: varchar('kind_id', { length: 36 })
            .notNull()
            .references(() => tripScheduleKind.id, { onDelete: 'restrict' }),
        note: varchar('note', { length: 300 }),
        bufferNote: varchar('buffer_note', { length: 80 }),
        mapQuery: varchar('map_query', { length: 200 }),
    },
    (table) => [index('schedule_item_day_id_idx').on(table.dayId), index('schedule_item_kind_id_idx').on(table.kindId)],
)

export const tripDayNote = tripTable(
    'day_note',
    {
        id: id(),
        dayId: varchar('day_id', { length: 36 })
            .notNull()
            .references(() => tripDay.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        leading: text('leading'),
        linkLabel: varchar('link_label', { length: 120 }),
        linkUrl: varchar('link_url', { length: 500 }),
        trailing: text('trailing'),
    },
    (table) => [index('day_note_day_id_idx').on(table.dayId)],
)

export const tripBooking = tripTable(
    'booking',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        title: varchar('title', { length: 120 }).notNull(),
        whenLabel: varchar('when_label', { length: 120 }),
        priority: mysqlEnum('priority', BOOKING_PRIORITIES).notNull().default('p2'),
        linkLabel: varchar('link_label', { length: 120 }),
        linkUrl: varchar('link_url', { length: 500 }),
        actionNote: varchar('action_note', { length: 200 }),
        planStatus: varchar('plan_status', { length: 80 }),
    },
    (table) => [index('booking_trip_id_idx').on(table.tripId)],
)

export const tripUpload = tripTable(
    'upload',
    {
        id: id(),
        ownerId: varchar('owner_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        kind: mysqlEnum('kind', UPLOAD_KINDS).notNull(),
        key: varchar('key', { length: 300 }).notNull(),
        url: varchar('url', { length: 500 }).notNull(),
        mime: varchar('mime', { length: 80 }).notNull(),
        size: int('size').notNull(),
        createdAt: createdAt(),
    },
    (table) => [index('upload_owner_id_idx').on(table.ownerId)],
)

export const tripBookingAttachment = tripTable(
    'booking_attachment',
    {
        id: id(),
        bookingId: varchar('booking_id', { length: 36 })
            .notNull()
            .references(() => tripBooking.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        kind: mysqlEnum('kind', UPLOAD_ATTACHMENT_KINDS).notNull().default('link'),
        url: varchar('url', { length: 500 }).notNull(),
        label: varchar('label', { length: 80 }),
        uploadId: varchar('upload_id', { length: 36 }).references(() => tripUpload.id, { onDelete: 'set null' }),
        createdBy: varchar('created_by', { length: 36 }),
    },
    (table) => [index('booking_attachment_booking_id_idx').on(table.bookingId), index('booking_attachment_upload_id_idx').on(table.uploadId)],
)

export const tripInfoSection = tripTable(
    'info_section',
    {
        id: id(),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        title: varchar('title', { length: 120 }).notNull(),
        isDefaultOpen: boolean('is_default_open').default(false).notNull(),
    },
    (table) => [index('info_section_trip_id_idx').on(table.tripId)],
)

export const tripInfoBlock = tripTable(
    'info_block',
    {
        id: id(),
        sectionId: varchar('section_id', { length: 36 })
            .notNull()
            .references(() => tripInfoSection.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        kind: mysqlEnum('kind', INFO_BLOCK_KINDS).notNull().default('paragraph'),
        emphasis: varchar('emphasis', { length: 255 }),
        text: text('text'),
        linkLabel: varchar('link_label', { length: 120 }),
        linkUrl: varchar('link_url', { length: 500 }),
    },
    (table) => [index('info_block_section_id_idx').on(table.sectionId)],
)

export const tripScheduleCheck = tripTable(
    'schedule_check',
    {
        scheduleItemId: varchar('schedule_item_id', { length: 36 })
            .notNull()
            .references(() => tripScheduleItem.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        checkedAt: timestamp('checked_at', { fsp: 3 }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.scheduleItemId, table.userId] }), index('schedule_check_user_id_idx').on(table.userId)],
)

export const tripBookingCheck = tripTable(
    'booking_check',
    {
        bookingId: varchar('booking_id', { length: 36 })
            .notNull()
            .references(() => tripBooking.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        checkedAt: timestamp('checked_at', { fsp: 3 }).defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.bookingId, table.userId] }), index('booking_check_user_id_idx').on(table.userId)],
)

export const tripDayMemo = tripTable(
    'day_memo',
    {
        dayId: varchar('day_id', { length: 36 })
            .notNull()
            .references(() => tripDay.id, { onDelete: 'cascade' }),
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        content: text('content').notNull(),
        updatedAt: updatedAt(),
    },
    (table) => [primaryKey({ columns: [table.dayId, table.userId] }), index('day_memo_user_id_idx').on(table.userId)],
)

export const tripFavorite = tripTable(
    'favorite',
    {
        userId: varchar('user_id', { length: 36 })
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        tripId: varchar('trip_id', { length: 36 })
            .notNull()
            .references(() => trip.id, { onDelete: 'cascade' }),
        sortOrder: int('sort_order').notNull().default(0),
        createdAt: createdAt(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.tripId] }), index('favorite_trip_id_idx').on(table.tripId)],
)

export const tripRelations = relations(trip, ({ one, many }) => ({
    owner: one(user, { fields: [trip.ownerId], references: [user.id] }),
    members: many(tripMember),
    invites: many(tripInvite),
    destinations: many(tripDestination),
    favorites: many(tripFavorite),
    flights: many(tripFlight),
    lodgings: many(tripLodging),
    sidebarLinks: many(tripSidebarLink),
    scheduleKinds: many(tripScheduleKind),
    days: many(tripDay),
    bookings: many(tripBooking),
    infoSections: many(tripInfoSection),
}))

export const tripMemberRelations = relations(tripMember, ({ one }) => ({
    trip: one(trip, { fields: [tripMember.tripId], references: [trip.id] }),
    user: one(user, { fields: [tripMember.userId], references: [user.id] }),
}))

export const tripInviteRelations = relations(tripInvite, ({ one }) => ({
    trip: one(trip, { fields: [tripInvite.tripId], references: [trip.id] }),
    inviter: one(user, { fields: [tripInvite.invitedBy], references: [user.id] }),
}))

export const tripDestinationRelations = relations(tripDestination, ({ one }) => ({
    trip: one(trip, { fields: [tripDestination.tripId], references: [trip.id] }),
}))

export const tripFavoriteRelations = relations(tripFavorite, ({ one }) => ({
    trip: one(trip, { fields: [tripFavorite.tripId], references: [trip.id] }),
    user: one(user, { fields: [tripFavorite.userId], references: [user.id] }),
}))

export const tripFlightRelations = relations(tripFlight, ({ one }) => ({
    trip: one(trip, { fields: [tripFlight.tripId], references: [trip.id] }),
}))

export const tripLodgingRelations = relations(tripLodging, ({ one }) => ({
    trip: one(trip, { fields: [tripLodging.tripId], references: [trip.id] }),
}))

export const tripSidebarLinkRelations = relations(tripSidebarLink, ({ one }) => ({
    trip: one(trip, { fields: [tripSidebarLink.tripId], references: [trip.id] }),
}))

export const tripDayRelations = relations(tripDay, ({ one, many }) => ({
    trip: one(trip, { fields: [tripDay.tripId], references: [trip.id] }),
    facts: many(tripDayFact),
    routes: many(tripRoute),
    scheduleItems: many(tripScheduleItem),
    notes: many(tripDayNote),
    memos: many(tripDayMemo),
}))

export const tripDayFactRelations = relations(tripDayFact, ({ one }) => ({
    day: one(tripDay, { fields: [tripDayFact.dayId], references: [tripDay.id] }),
}))

export const tripRouteRelations = relations(tripRoute, ({ one }) => ({
    day: one(tripDay, { fields: [tripRoute.dayId], references: [tripDay.id] }),
}))

export const tripScheduleKindRelations = relations(tripScheduleKind, ({ one, many }) => ({
    trip: one(trip, { fields: [tripScheduleKind.tripId], references: [trip.id] }),
    scheduleItems: many(tripScheduleItem),
}))

export const tripScheduleItemRelations = relations(tripScheduleItem, ({ one, many }) => ({
    day: one(tripDay, { fields: [tripScheduleItem.dayId], references: [tripDay.id] }),
    kind: one(tripScheduleKind, { fields: [tripScheduleItem.kindId], references: [tripScheduleKind.id] }),
    checks: many(tripScheduleCheck),
}))

export const tripDayNoteRelations = relations(tripDayNote, ({ one }) => ({
    day: one(tripDay, { fields: [tripDayNote.dayId], references: [tripDay.id] }),
}))

export const tripBookingRelations = relations(tripBooking, ({ one, many }) => ({
    trip: one(trip, { fields: [tripBooking.tripId], references: [trip.id] }),
    checks: many(tripBookingCheck),
    attachments: many(tripBookingAttachment),
}))

export const tripInfoSectionRelations = relations(tripInfoSection, ({ one, many }) => ({
    trip: one(trip, { fields: [tripInfoSection.tripId], references: [trip.id] }),
    blocks: many(tripInfoBlock),
}))

export const tripInfoBlockRelations = relations(tripInfoBlock, ({ one }) => ({
    section: one(tripInfoSection, { fields: [tripInfoBlock.sectionId], references: [tripInfoSection.id] }),
}))

export const tripScheduleCheckRelations = relations(tripScheduleCheck, ({ one }) => ({
    scheduleItem: one(tripScheduleItem, { fields: [tripScheduleCheck.scheduleItemId], references: [tripScheduleItem.id] }),
    user: one(user, { fields: [tripScheduleCheck.userId], references: [user.id] }),
}))

export const tripBookingCheckRelations = relations(tripBookingCheck, ({ one }) => ({
    booking: one(tripBooking, { fields: [tripBookingCheck.bookingId], references: [tripBooking.id] }),
    user: one(user, { fields: [tripBookingCheck.userId], references: [user.id] }),
}))

export const tripDayMemoRelations = relations(tripDayMemo, ({ one }) => ({
    day: one(tripDay, { fields: [tripDayMemo.dayId], references: [tripDay.id] }),
    user: one(user, { fields: [tripDayMemo.userId], references: [user.id] }),
}))

export const tripUploadRelations = relations(tripUpload, ({ one }) => ({
    owner: one(user, { fields: [tripUpload.ownerId], references: [user.id] }),
}))

export const tripBookingAttachmentRelations = relations(tripBookingAttachment, ({ one }) => ({
    booking: one(tripBooking, { fields: [tripBookingAttachment.bookingId], references: [tripBooking.id] }),
    upload: one(tripUpload, { fields: [tripBookingAttachment.uploadId], references: [tripUpload.id] }),
}))
