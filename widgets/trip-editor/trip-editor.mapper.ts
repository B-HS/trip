import dayjs from 'dayjs'
import type { TripDayDetail, TripDetail } from '@/entities/trip/trip.type'
import type {
    BookingInput,
    DayInput,
    FlightInput,
    InfoSectionInput,
    LodgingInput,
    ShareSettingsInput,
    TripBasicsInput,
} from '@/entities/trip/trip.validate'

const DATE_FORMAT = 'YYYY-MM-DD'
const SHORT_LABEL_FORMAT = 'MM.DD'
const NEXT_DAY_STEP = 1
const DAY_NUMBER_PAD = 2
const DAY_NUMBER_OFFSET = 1

export const toBasicsDefaults = (detail: TripDetail) =>
    ({
        title: detail.title,
        eyebrow: detail.eyebrow,
        destination: detail.destination,
        startDate: detail.startDate,
        endDate: detail.endDate,
        periodNote: detail.periodNote,
        disclaimer: detail.disclaimer,
        verifiedOn: detail.verifiedOn,
        bufferPolicy: detail.bufferPolicy,
        bookingNote: detail.bookingNote,
        footerNote: detail.footerNote,
    }) satisfies TripBasicsInput

export const toFlightDefaults = (detail: TripDetail) =>
    detail.flights.map(
        (flight) =>
            ({
                id: flight.id,
                direction: flight.direction,
                label: flight.label,
                departCode: flight.departCode,
                departTime: flight.departTime,
                departTerminal: flight.departTerminal,
                arriveCode: flight.arriveCode,
                arriveTime: flight.arriveTime,
                arriveTerminal: flight.arriveTerminal,
                flightNumber: flight.flightNumber,
                note: flight.note,
            }) satisfies FlightInput,
    )

export const toLodgingDefaults = (detail: TripDetail) =>
    detail.lodgings.map(
        (lodging) =>
            ({
                id: lodging.id,
                name: lodging.name,
                nameLocal: lodging.nameLocal,
                address: lodging.address,
                accessNote: lodging.accessNote,
                checkIn: lodging.checkIn,
                checkOut: lodging.checkOut,
                url: lodging.url,
                note: lodging.note,
            }) satisfies LodgingInput,
    )

export const toBookingDefaults = (detail: TripDetail) =>
    detail.bookings.map(
        (booking) =>
            ({
                id: booking.id,
                title: booking.title,
                whenLabel: booking.whenLabel,
                priority: booking.priority,
                linkLabel: booking.linkLabel,
                linkUrl: booking.linkUrl,
                actionNote: booking.actionNote,
                planStatus: booking.planStatus,
            }) satisfies BookingInput,
    )

export const toInfoSectionDefaults = (detail: TripDetail) =>
    detail.infoSections.map(
        (section) =>
            ({
                id: section.id,
                title: section.title,
                isDefaultOpen: section.isDefaultOpen,
                blocks: section.blocks.map((block) => ({
                    id: block.id,
                    kind: block.kind,
                    emphasis: block.emphasis,
                    text: block.text,
                    linkLabel: block.linkLabel,
                    linkUrl: block.linkUrl,
                })),
            }) satisfies InfoSectionInput,
    )

export const toDayDefaults = (day: TripDayDetail) =>
    ({
        id: day.id,
        date: day.date,
        shortLabel: day.shortLabel,
        title: day.title,
        subtitle: day.subtitle,
        overview: day.overview,
        planHeadline: day.planHeadline,
        planNote: day.planNote,
        closingHeadline: day.closingHeadline,
        closingNote: day.closingNote,
        morningSummary: day.morningSummary,
        afternoonSummary: day.afternoonSummary,
        eveningSummary: day.eveningSummary,
        facts: day.facts.map((fact) => ({ id: fact.id, label: fact.label, value: fact.value })),
        routes: day.routes.map((route) => ({
            id: route.id,
            origin: route.origin,
            destination: route.destination,
            minutes: route.minutes,
            pathText: route.pathText,
            formula: route.formula,
        })),
        scheduleItems: day.scheduleItems.map((item) => ({
            id: item.id,
            timeLabel: item.timeLabel,
            title: item.title,
            kind: item.kind,
            note: item.note,
            bufferNote: item.bufferNote,
            mapQuery: item.mapQuery,
        })),
        notes: day.notes.map((note) => ({
            id: note.id,
            leading: note.leading,
            linkLabel: note.linkLabel,
            linkUrl: note.linkUrl,
            trailing: note.trailing,
        })),
    }) satisfies DayInput

export const toDayDraft = (detail: TripDetail) => {
    const lastDay = detail.days.at(-1)
    const date = lastDay === undefined ? detail.startDate : dayjs(lastDay.date).add(NEXT_DAY_STEP, 'day').format(DATE_FORMAT)

    return {
        date,
        shortLabel: dayjs(date).format(SHORT_LABEL_FORMAT),
        title: '',
        subtitle: null,
        overview: null,
        planHeadline: null,
        planNote: null,
        closingHeadline: null,
        closingNote: null,
        morningSummary: null,
        afternoonSummary: null,
        eveningSummary: null,
        facts: [],
        routes: [],
        scheduleItems: [],
        notes: [],
    } satisfies DayInput
}

export const toShareDefaults = (detail: TripDetail) =>
    ({ isPublic: detail.isPublic, slug: detail.shareSlug ?? undefined }) satisfies ShareSettingsInput

export const toDayHeading = (day: TripDayDetail, index: number) =>
    `${String(index + DAY_NUMBER_OFFSET).padStart(DAY_NUMBER_PAD, '0')} ${day.shortLabel} ${day.title}`
