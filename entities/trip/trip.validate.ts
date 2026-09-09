import { z } from 'zod'
import {
    tripTemplateBookingSchema,
    tripTemplateDayFactSchema,
    tripTemplateDayNoteSchema,
    tripTemplateDaySchema,
    tripTemplateFlightSchema,
    tripTemplateInfoBlockSchema,
    tripTemplateInfoSectionSchema,
    tripTemplateLodgingSchema,
    tripTemplateRouteSchema,
    tripTemplateScheduleItemSchema,
    tripTemplateSchema,
} from '@/shared/lib/trip-template'

const SHARE_SLUG_MIN_LENGTH = 3
const SHARE_SLUG_MAX_LENGTH = 64
const SHARE_SLUG_PATTERN = /^[a-z0-9-]+$/
const DAY_MEMO_MAX_LENGTH = 4000
const EMAIL_MAX_LENGTH = 255

const optionalId = z.uuid().optional()

export const tripIdSchema = z.uuid()

export const tripBasicsSchema = tripTemplateSchema
    .omit({ flights: true, lodgings: true, days: true, bookings: true, infoSections: true })
    .refine((value) => value.endDate >= value.startDate, { message: '종료일은 시작일과 같거나 이후여야 합니다.', path: ['endDate'] })

export const flightInputSchema = tripTemplateFlightSchema.extend({ id: optionalId })
export const flightListSchema = z.array(flightInputSchema)

export const lodgingInputSchema = tripTemplateLodgingSchema.extend({ id: optionalId })
export const lodgingListSchema = z.array(lodgingInputSchema)

export const bookingInputSchema = tripTemplateBookingSchema.extend({ id: optionalId })
export const bookingListSchema = z.array(bookingInputSchema)

export const infoBlockInputSchema = tripTemplateInfoBlockSchema.extend({ id: optionalId })
export const infoSectionInputSchema = tripTemplateInfoSectionSchema.extend({ id: optionalId, blocks: z.array(infoBlockInputSchema).default([]) })
export const infoSectionListSchema = z.array(infoSectionInputSchema)

export const dayFactInputSchema = tripTemplateDayFactSchema.extend({ id: optionalId })
export const routeInputSchema = tripTemplateRouteSchema.extend({ id: optionalId })
export const scheduleItemInputSchema = tripTemplateScheduleItemSchema.extend({ id: optionalId })
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

export type TripBasicsInput = z.input<typeof tripBasicsSchema>
export type TripBasicsValues = z.output<typeof tripBasicsSchema>
export type FlightInput = z.input<typeof flightInputSchema>
export type FlightValues = z.output<typeof flightInputSchema>
export type FlightListInput = z.input<typeof flightListSchema>
export type LodgingInput = z.input<typeof lodgingInputSchema>
export type LodgingValues = z.output<typeof lodgingInputSchema>
export type LodgingListInput = z.input<typeof lodgingListSchema>
export type BookingInput = z.input<typeof bookingInputSchema>
export type BookingValues = z.output<typeof bookingInputSchema>
export type BookingListInput = z.input<typeof bookingListSchema>
export type InfoBlockValues = z.output<typeof infoBlockInputSchema>
export type InfoSectionInput = z.input<typeof infoSectionInputSchema>
export type InfoSectionValues = z.output<typeof infoSectionInputSchema>
export type InfoSectionListInput = z.input<typeof infoSectionListSchema>
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
