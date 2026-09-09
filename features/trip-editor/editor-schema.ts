import { z } from 'zod'
import {
    bookingListSchema,
    dayFactInputSchema,
    dayNoteInputSchema,
    flightListSchema,
    infoBlockInputSchema,
    infoSectionListSchema,
    lodgingListSchema,
    memberInviteSchema,
    routeInputSchema,
    scheduleItemInputSchema,
    scheduleKindListSchema,
} from '@/entities/trip/trip.validate'

export const flightsFormSchema = z.object({ items: flightListSchema })

export const lodgingsFormSchema = z.object({ items: lodgingListSchema })

export const bookingsFormSchema = z.object({ items: bookingListSchema })

export const infoSectionsFormSchema = z.object({ items: infoSectionListSchema })

export const scheduleKindsFormSchema = z.object({ items: scheduleKindListSchema })

export type FlightsFormInput = z.input<typeof flightsFormSchema>
export type FlightsFormValues = z.output<typeof flightsFormSchema>
export type LodgingsFormInput = z.input<typeof lodgingsFormSchema>
export type LodgingsFormValues = z.output<typeof lodgingsFormSchema>
export type BookingsFormInput = z.input<typeof bookingsFormSchema>
export type BookingsFormValues = z.output<typeof bookingsFormSchema>
export type InfoSectionsFormInput = z.input<typeof infoSectionsFormSchema>
export type InfoSectionsFormValues = z.output<typeof infoSectionsFormSchema>
export type ScheduleKindsFormInput = z.input<typeof scheduleKindsFormSchema>
export type ScheduleKindsFormValues = z.output<typeof scheduleKindsFormSchema>
export type InfoBlockInput = z.input<typeof infoBlockInputSchema>
export type DayFactInput = z.input<typeof dayFactInputSchema>
export type RouteInput = z.input<typeof routeInputSchema>
export type ScheduleItemInput = z.input<typeof scheduleItemInputSchema>
export type DayNoteInput = z.input<typeof dayNoteInputSchema>
export type MemberInviteValues = z.output<typeof memberInviteSchema>
