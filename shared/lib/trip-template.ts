import { z } from 'zod'
import { COUNTRY_CODES } from '@/shared/constant/countries'
import {
    BOOKING_PRIORITIES,
    FLIGHT_DIRECTIONS,
    INFO_BLOCK_KINDS,
    SCHEDULE_KINDS,
    TRIP_DESTINATION_CITY_MAX_LENGTH,
    TRIP_LENGTH_MAX,
    TRIP_LENGTH_MIN,
} from '@/shared/constant/trip'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const optionalText = (max: number) => z.string().trim().max(max).nullable().default(null)
const optionalUrl = z.url().max(500).nullable().default(null)
const optionalLength = z.number().int().min(TRIP_LENGTH_MIN).max(TRIP_LENGTH_MAX).nullable().default(null)

export const hasPairedTripLength = (value: { customNights: number | null; customDays: number | null }) =>
    (value.customNights === null) === (value.customDays === null)

export const TRIP_LENGTH_ISSUE = { message: '박과 일은 함께 입력해 주세요.', path: ['customDays'] }

export const tripTemplateDestinationSchema = z.object({
    countryCode: z.enum(COUNTRY_CODES),
    city: optionalText(TRIP_DESTINATION_CITY_MAX_LENGTH),
})

export const tripTemplateFlightSchema = z.object({
    direction: z.enum(FLIGHT_DIRECTIONS),
    label: z.string().trim().min(1).max(120),
    departCode: z.string().trim().min(3).max(8),
    departTime: z.string().trim().min(1).max(8),
    departTerminal: optionalText(32),
    arriveCode: z.string().trim().min(3).max(8),
    arriveTime: z.string().trim().min(1).max(8),
    arriveTerminal: optionalText(32),
    flightNumber: optionalText(32),
    note: optionalText(200),
})

export const tripTemplateLodgingSchema = z.object({
    name: z.string().trim().min(1).max(160),
    nameLocal: optionalText(160),
    address: optionalText(255),
    accessNote: optionalText(255),
    checkIn: optionalText(8),
    checkOut: optionalText(8),
    url: optionalUrl,
    note: optionalText(255),
})

export const tripTemplateDayFactSchema = z.object({
    label: z.string().trim().min(1).max(80),
    value: z.string().trim().min(1).max(255),
})

export const tripTemplateRouteSchema = z.object({
    origin: z.string().trim().min(1).max(120),
    destination: z.string().trim().min(1).max(120),
    minutes: z.number().int().min(0).max(10000),
    pathText: optionalText(255),
    formula: optionalText(255),
})

export const tripTemplateScheduleItemSchema = z.object({
    timeLabel: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(200),
    kind: z.enum(SCHEDULE_KINDS).default('planned'),
    note: optionalText(300),
    bufferNote: optionalText(80),
    mapQuery: optionalText(200),
})

export const tripTemplateDayNoteSchema = z.object({
    leading: optionalText(2000),
    linkLabel: optionalText(120),
    linkUrl: optionalUrl,
    trailing: optionalText(2000),
})

export const tripTemplateDaySchema = z.object({
    date: z.string().regex(DATE_PATTERN),
    shortLabel: z.string().trim().min(1).max(40),
    title: z.string().trim().min(1).max(120),
    subtitle: optionalText(200),
    overview: optionalText(2000),
    planHeadline: optionalText(255),
    planNote: optionalText(2000),
    closingHeadline: optionalText(255),
    closingNote: optionalText(2000),
    morningSummary: optionalText(120),
    afternoonSummary: optionalText(120),
    eveningSummary: optionalText(120),
    facts: z.array(tripTemplateDayFactSchema).default([]),
    routes: z.array(tripTemplateRouteSchema).default([]),
    scheduleItems: z.array(tripTemplateScheduleItemSchema).default([]),
    notes: z.array(tripTemplateDayNoteSchema).default([]),
})

export const tripTemplateBookingSchema = z.object({
    title: z.string().trim().min(1).max(120),
    whenLabel: optionalText(120),
    priority: z.enum(BOOKING_PRIORITIES).default('p2'),
    linkLabel: optionalText(120),
    linkUrl: optionalUrl,
    actionNote: optionalText(200),
    planStatus: optionalText(80),
})

export const tripTemplateInfoBlockSchema = z.object({
    kind: z.enum(INFO_BLOCK_KINDS).default('paragraph'),
    emphasis: optionalText(255),
    text: optionalText(4000),
    linkLabel: optionalText(120),
    linkUrl: optionalUrl,
})

export const tripTemplateInfoSectionSchema = z.object({
    title: z.string().trim().min(1).max(120),
    isDefaultOpen: z.boolean().default(false),
    blocks: z.array(tripTemplateInfoBlockSchema).default([]),
})

export const tripTemplateFieldsSchema = z.object({
    title: z.string().trim().min(1).max(120),
    eyebrow: optionalText(120),
    destination: z.string().trim().min(1).max(120),
    startDate: z.string().regex(DATE_PATTERN),
    endDate: z.string().regex(DATE_PATTERN),
    customNights: optionalLength,
    customDays: optionalLength,
    periodNote: optionalText(200),
    disclaimer: optionalText(300),
    verifiedOn: z.string().regex(DATE_PATTERN).nullable().default(null),
    bufferPolicy: optionalText(2000),
    bookingNote: optionalText(2000),
    footerNote: optionalText(2000),
    destinations: z.array(tripTemplateDestinationSchema).default([]),
    flights: z.array(tripTemplateFlightSchema).default([]),
    lodgings: z.array(tripTemplateLodgingSchema).default([]),
    days: z.array(tripTemplateDaySchema).default([]),
    bookings: z.array(tripTemplateBookingSchema).default([]),
    infoSections: z.array(tripTemplateInfoSectionSchema).default([]),
})

export const tripTemplateSchema = tripTemplateFieldsSchema.refine(hasPairedTripLength, TRIP_LENGTH_ISSUE)

export const parseTripTemplateJson = (text: string) => {
    try {
        const data: unknown = JSON.parse(text)
        const parsed = tripTemplateSchema.safeParse(data)
        return parsed.success ? parsed.data : null
    } catch {
        return null
    }
}

export type TripTemplate = z.infer<typeof tripTemplateSchema>
export type TripTemplateInput = z.input<typeof tripTemplateSchema>
