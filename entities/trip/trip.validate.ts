import { z } from 'zod'
import { SCHEDULE_KIND_MAX_COUNT, SCHEDULE_KIND_MIN_COUNT, TRIP_DESTINATION_MIN_COUNT } from '@/shared/constant/trip'
import {
    hasPairedTripLength,
    hasUniqueScheduleKindKeys,
    SCHEDULE_KIND_DUPLICATE_ISSUE,
    TRIP_LENGTH_ISSUE,
    tripTemplateBookingSchema,
    tripTemplateDayFactSchema,
    tripTemplateDayNoteSchema,
    tripTemplateDaySchema,
    tripTemplateDestinationSchema,
    tripTemplateFieldsSchema,
    tripTemplateFlightSchema,
    tripTemplateInfoBlockSchema,
    tripTemplateInfoSectionSchema,
    tripTemplateLodgingSchema,
    tripTemplateRouteSchema,
    tripTemplateScheduleItemSchema,
    tripTemplateScheduleKindSchema,
    tripTemplateSidebarLinkSchema,
} from '@/shared/lib/trip-template'

const SHARE_SLUG_MIN_LENGTH = 3
const SHARE_SLUG_MAX_LENGTH = 64
const SHARE_SLUG_PATTERN = /^[a-z0-9-]+$/
const DAY_MEMO_MAX_LENGTH = 4000
const EMAIL_MAX_LENGTH = 255

const optionalId = z.uuid().optional()

export const tripIdSchema = z.uuid()

const tripBasicsFieldsSchema = tripTemplateFieldsSchema.omit({
    sidebarNote: true,
    destinations: true,
    flights: true,
    lodgings: true,
    sidebarLinks: true,
    scheduleKinds: true,
    days: true,
    bookings: true,
    infoSections: true,
})

const hasOrderedPeriod = (value: { startDate: string; endDate: string }) => value.endDate >= value.startDate

const PERIOD_ISSUE = { message: '종료일은 시작일과 같거나 이후여야 합니다.', path: ['endDate'] }

export const tripBasicsSchema = tripBasicsFieldsSchema.refine(hasOrderedPeriod, PERIOD_ISSUE).refine(hasPairedTripLength, TRIP_LENGTH_ISSUE)

export const destinationInputSchema = tripTemplateDestinationSchema.extend({ id: optionalId })
export const destinationListSchema = z.array(destinationInputSchema)

export const tripBasicsFormSchema = tripBasicsFieldsSchema
    .extend({ destinations: destinationListSchema })
    .refine(hasOrderedPeriod, PERIOD_ISSUE)
    .refine(hasPairedTripLength, TRIP_LENGTH_ISSUE)

export const tripCreateSchema = tripBasicsFieldsSchema
    .extend({ destinations: destinationListSchema.min(TRIP_DESTINATION_MIN_COUNT, '목적지를 한 곳 이상 추가해 주세요.') })
    .refine(hasOrderedPeriod, PERIOD_ISSUE)
    .refine(hasPairedTripLength, TRIP_LENGTH_ISSUE)

export const flightInputSchema = tripTemplateFlightSchema.extend({ id: optionalId })
export const flightListSchema = z.array(flightInputSchema)

export const lodgingInputSchema = tripTemplateLodgingSchema.extend({ id: optionalId })
export const lodgingListSchema = z.array(lodgingInputSchema)

export const sidebarLinkInputSchema = tripTemplateSidebarLinkSchema.extend({ id: optionalId })
export const sidebarLinkListSchema = z.array(sidebarLinkInputSchema)

export const sidebarSchema = tripTemplateFieldsSchema.pick({ sidebarNote: true }).extend({ links: sidebarLinkListSchema })

export const bookingInputSchema = tripTemplateBookingSchema.extend({ id: optionalId })
export const bookingListSchema = z.array(bookingInputSchema)

export const infoBlockInputSchema = tripTemplateInfoBlockSchema.extend({ id: optionalId })
export const infoSectionInputSchema = tripTemplateInfoSectionSchema.extend({ id: optionalId, blocks: z.array(infoBlockInputSchema).default([]) })
export const infoSectionListSchema = z.array(infoSectionInputSchema)

export const scheduleKindInputSchema = tripTemplateScheduleKindSchema.extend({ id: optionalId })
export const scheduleKindListSchema = z
    .array(scheduleKindInputSchema)
    .min(SCHEDULE_KIND_MIN_COUNT, '일정 종류를 한 가지 이상 남겨 주세요.')
    .max(SCHEDULE_KIND_MAX_COUNT, `일정 종류는 최대 ${SCHEDULE_KIND_MAX_COUNT}가지까지 만들 수 있습니다.`)
    .refine(hasUniqueScheduleKindKeys, SCHEDULE_KIND_DUPLICATE_ISSUE)

export const scheduleKindsSaveSchema = z.object({
    kinds: scheduleKindListSchema,
    replacements: z.record(z.uuid(), z.uuid()).default({}),
})

export const dayFactInputSchema = tripTemplateDayFactSchema.extend({ id: optionalId })
export const routeInputSchema = tripTemplateRouteSchema.extend({ id: optionalId })
export const scheduleItemInputSchema = tripTemplateScheduleItemSchema.omit({ kind: true }).extend({ id: optionalId, kindId: z.uuid() })
export const dayNoteInputSchema = tripTemplateDayNoteSchema.extend({ id: optionalId })

export const dayInputSchema = tripTemplateDaySchema.extend({
    id: optionalId,
    facts: z.array(dayFactInputSchema).default([]),
    routes: z.array(routeInputSchema).default([]),
    scheduleItems: z.array(scheduleItemInputSchema).default([]),
    notes: z.array(dayNoteInputSchema).default([]),
})

export const dayIdListSchema = z.array(z.uuid()).min(1)

export const memberRoleSchema = z.enum(['editor', 'viewer'])

export const memberInviteSchema = z.object({
    email: z.email().max(EMAIL_MAX_LENGTH),
    role: memberRoleSchema,
})

export const shareSettingsSchema = z.object({
    isPublic: z.boolean(),
    slug: z.string().trim().min(SHARE_SLUG_MIN_LENGTH).max(SHARE_SLUG_MAX_LENGTH).regex(SHARE_SLUG_PATTERN).optional(),
})

export const dayMemoSchema = z.object({ content: z.string().max(DAY_MEMO_MAX_LENGTH) })

export const favoriteFlagSchema = z.boolean()

export type TripBasicsInput = z.input<typeof tripBasicsSchema>
export type TripBasicsValues = z.output<typeof tripBasicsSchema>
export type TripBasicsFormInput = z.input<typeof tripBasicsFormSchema>
export type TripBasicsFormValues = z.output<typeof tripBasicsFormSchema>
export type TripCreateInput = z.input<typeof tripCreateSchema>
export type TripCreateValues = z.output<typeof tripCreateSchema>
export type DestinationInput = z.input<typeof destinationInputSchema>
export type DestinationValues = z.output<typeof destinationInputSchema>
export type DestinationListInput = z.input<typeof destinationListSchema>
export type FlightInput = z.input<typeof flightInputSchema>
export type FlightValues = z.output<typeof flightInputSchema>
export type FlightListInput = z.input<typeof flightListSchema>
export type LodgingInput = z.input<typeof lodgingInputSchema>
export type LodgingValues = z.output<typeof lodgingInputSchema>
export type LodgingListInput = z.input<typeof lodgingListSchema>
export type SidebarLinkInput = z.input<typeof sidebarLinkInputSchema>
export type SidebarLinkValues = z.output<typeof sidebarLinkInputSchema>
export type SidebarInput = z.input<typeof sidebarSchema>
export type SidebarValues = z.output<typeof sidebarSchema>
export type BookingInput = z.input<typeof bookingInputSchema>
export type BookingValues = z.output<typeof bookingInputSchema>
export type BookingListInput = z.input<typeof bookingListSchema>
export type InfoBlockValues = z.output<typeof infoBlockInputSchema>
export type InfoSectionInput = z.input<typeof infoSectionInputSchema>
export type InfoSectionValues = z.output<typeof infoSectionInputSchema>
export type InfoSectionListInput = z.input<typeof infoSectionListSchema>
export type ScheduleKindInput = z.input<typeof scheduleKindInputSchema>
export type ScheduleKindValues = z.output<typeof scheduleKindInputSchema>
export type ScheduleKindListInput = z.input<typeof scheduleKindListSchema>
export type ScheduleKindsSaveInput = z.input<typeof scheduleKindsSaveSchema>
export type ScheduleKindsSaveValues = z.output<typeof scheduleKindsSaveSchema>
export type DayFactValues = z.output<typeof dayFactInputSchema>
export type RouteValues = z.output<typeof routeInputSchema>
export type ScheduleItemValues = z.output<typeof scheduleItemInputSchema>
export type DayNoteValues = z.output<typeof dayNoteInputSchema>
export type DayInput = z.input<typeof dayInputSchema>
export type DayValues = z.output<typeof dayInputSchema>
export type MemberInviteInput = z.input<typeof memberInviteSchema>
export type MemberRoleInput = z.output<typeof memberRoleSchema>
export type ShareSettingsInput = z.input<typeof shareSettingsSchema>
export type ShareSettingsValues = z.output<typeof shareSettingsSchema>
export type DayMemoInput = z.input<typeof dayMemoSchema>
