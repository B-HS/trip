import { getTranslations } from 'next-intl/server'
import type { FC, ReactNode } from 'react'
import type {
    PublicTrip,
    TripBookingDetail,
    TripDayDetail,
    TripFlight,
    TripInfoBlock,
    TripInfoSectionDetail,
    TripLodging,
    TripScheduleItem,
    TripScheduleKind,
} from '@/entities/trip/trip.type'
import type { TripUserState } from '@/entities/user-state/user-state.type'
import { formatDateWithWeekday, formatDayNumber, formatPeriodLabel } from '@/features/trip-viewer/trip-viewer-format'
import { SCHEDULE_KIND_SWATCH_CLASS } from '@/features/trip-viewer/trip-viewer-kind'
import { buildMapUrl } from '@/shared/constant/trip'
import { countryName } from '@/shared/constant/countries'
import { formatTripLength } from '@/shared/lib/trip-length'
import { getPrintDensity } from '@/shared/lib/print-density'
import { cn } from '@/shared/lib/utils'

type TripPrintDocumentProps = {
    trip: PublicTrip
    locale: string
    viewerState?: TripUserState
}

type Labels = Awaited<ReturnType<typeof getTranslations>>

const printUrl = (value: string) => (
    <a className='trip-print-url break-all underline decoration-foreground/35 underline-offset-2' href={value}>
        {value}
    </a>
)

const PrintInlineLink: FC<{ url: string; label: string | null }> = ({ url, label }) => (
    <span className='inline-flex max-w-full flex-wrap items-baseline gap-x-1'>
        <a className='break-all underline underline-offset-2' href={url}>
            {label ?? url}
        </a>
        {label && <span className='break-all text-foreground/55'>({url})</span>}
    </span>
)

const PrintSection: FC<{ title: string; eyebrow?: string; children: ReactNode; className?: string }> = ({ title, eyebrow, children, className }) => (
    <section className={cn('trip-print-section flex flex-col gap-2.5', className)}>
        <header className='flex items-baseline justify-between gap-3 border-b border-foreground/20 pb-1.5'>
            <div className='flex min-w-0 items-baseline gap-2'>
                {eyebrow && <span className='font-mono text-[9px] tracking-[0.18em] text-foreground/50 uppercase'>{eyebrow}</span>}
                <h2 className='min-w-0 text-[13px] font-semibold tracking-tight'>{title}</h2>
            </div>
        </header>
        {children}
    </section>
)

const DestinationList: FC<{ trip: PublicTrip; locale: string }> = ({ trip, locale }) => (
    <div className='flex flex-wrap gap-x-3 gap-y-1 text-sm'>
        {trip.destinations.map((destination) => (
            <span key={destination.id} className='inline-flex items-baseline gap-1.5'>
                <span className='font-mono text-[10px] text-foreground/55 uppercase'>{destination.countryCode}</span>
                <span className='break-keep'>{destination.city ?? countryName(destination.countryCode, locale)}</span>
            </span>
        ))}
    </div>
)

const DayIndex: FC<{ trip: PublicTrip; locale: string }> = ({ trip, locale }) => (
    <ol className='grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3'>
        {trip.days.map((day, index) => (
            <li key={day.id} className='flex min-w-0 items-baseline gap-2 text-[11px] leading-snug'>
                <span className='shrink-0 font-mono text-[10px] text-foreground/45 tabular-nums'>{formatDayNumber(index)}</span>
                <span className='min-w-0 truncate'>{day.title}</span>
                <time className='ml-auto shrink-0 font-mono text-[10px] text-foreground/50 tabular-nums'>
                    {formatDateWithWeekday(day.date, locale)}
                </time>
            </li>
        ))}
    </ol>
)

const OverviewPage: FC<{ trip: PublicTrip; locale: string; labels: Labels; viewerState?: TripUserState }> = ({
    trip,
    locale,
    labels,
    viewerState,
}) => {
    const scheduleCount = trip.days.reduce((total, day) => total + day.scheduleItems.length, 0)
    const checkedCount = viewerState?.scheduleCheckedIds.length ?? 0
    const period = formatPeriodLabel(trip.startDate, trip.endDate, locale)
    const length = formatTripLength({ startDate: trip.startDate, endDate: trip.endDate, nights: trip.customNights, days: trip.customDays }, locale)

    return (
        <article className='trip-print-page trip-print-overview' data-print-page='overview'>
            <div className='trip-print-page-inner flex flex-col gap-5'>
                <header className='trip-print-cover-header'>
                    <p className='font-mono text-[10px] tracking-[0.3em] text-foreground/50 uppercase'>{labels('documentEyebrow')}</p>
                    {trip.eyebrow && <p className='mt-4 text-xs font-medium text-foreground/55'>{trip.eyebrow}</p>}
                    <h1 className='mt-1 max-w-[165mm] text-[clamp(2rem,7vw,3.75rem)] leading-[0.98] font-semibold tracking-[-0.045em] break-keep'>
                        {trip.title}
                    </h1>
                    <DestinationList trip={trip} locale={locale} />
                    <p className='max-w-[165mm] text-[11px] leading-relaxed break-keep text-foreground/65' data-print-destination='canonical'>
                        {trip.destination}
                    </p>
                </header>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_42mm]'>
                    <div className='flex flex-col gap-4'>
                        <div className='grid grid-cols-2 gap-px bg-foreground/15 sm:grid-cols-3'>
                            <div className='bg-card p-2.5'>
                                <span className='block font-mono text-[9px] tracking-wider text-foreground/50 uppercase'>{labels('dates')}</span>
                                <span className='mt-1 block text-sm font-medium tabular-nums'>{period}</span>
                            </div>
                            <div className='bg-card p-2.5'>
                                <span className='block font-mono text-[9px] tracking-wider text-foreground/50 uppercase'>{labels('length')}</span>
                                <span className='mt-1 block text-sm font-medium tabular-nums'>{length}</span>
                            </div>
                            <div className='col-span-2 bg-card p-2.5 sm:col-span-1'>
                                <span className='block font-mono text-[9px] tracking-wider text-foreground/50 uppercase'>
                                    {labels('departureAirport')}
                                </span>
                                <span className='mt-1 block text-sm font-medium tabular-nums'>
                                    {trip.departureAirportCode ?? labels('notAvailable')}
                                </span>
                            </div>
                        </div>
                        <p className='font-mono text-[10px] tracking-wide text-foreground/55 tabular-nums'>
                            {labels('travelSummary', {
                                flights: trip.flights.length,
                                lodgings: trip.lodgings.length,
                                schedule: scheduleCount,
                            })}
                        </p>
                        {(trip.periodNote || trip.sidebarNote || trip.disclaimer || trip.verifiedOn || trip.bufferPolicy) && (
                            <div className='flex flex-col gap-1.5 text-xs leading-relaxed'>
                                {trip.periodNote && <p>{trip.periodNote}</p>}
                                {trip.sidebarNote && <p className='whitespace-pre-line text-foreground/75'>{trip.sidebarNote}</p>}
                                {trip.bufferPolicy && (
                                    <p className='border-l-2 border-foreground/15 pl-2.5'>
                                        <span className='font-medium'>{labels('bufferNote')}: </span>
                                        {trip.bufferPolicy}
                                    </p>
                                )}
                                {trip.disclaimer && <p className='text-foreground/60'>{trip.disclaimer}</p>}
                                {trip.verifiedOn && (
                                    <p className='font-mono text-[10px] text-foreground/55'>{labels('verified', { date: trip.verifiedOn })}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <PrintSection title={labels('scheduleOverview')} eyebrow={labels('summary')} className='sm:row-span-2'>
                        <div className='flex flex-col gap-2'>
                            {trip.scheduleKinds.map((kind) => (
                                <span key={kind.id} className='inline-flex items-start gap-2 text-[11px] leading-snug'>
                                    <span aria-hidden className={cn('mt-0.5 size-2 shrink-0', SCHEDULE_KIND_SWATCH_CLASS[kind.colorToken])} />
                                    <span>
                                        <strong className='font-medium'>{kind.label}</strong>
                                        <span className='ml-1 text-foreground/60'>{kind.legendLabel}</span>
                                        {kind.bufferLabel && <span className='block text-[10px] text-foreground/50'>{kind.bufferLabel}</span>}
                                    </span>
                                </span>
                            ))}
                        </div>
                        {viewerState && (
                            <p className='border-t border-foreground/15 pt-2 font-mono text-[10px] text-foreground/60 tabular-nums'>
                                {labels('progress', { checked: checkedCount, total: scheduleCount })}
                            </p>
                        )}
                    </PrintSection>
                </div>

                {trip.days.length > 0 && (
                    <PrintSection title={labels('dayIndex')} eyebrow={labels('itinerary')}>
                        <DayIndex trip={trip} locale={locale} />
                    </PrintSection>
                )}

                <p className='mt-auto border-t border-foreground/15 pt-2 font-mono text-[9px] tracking-[0.12em] text-foreground/45 uppercase'>
                    {labels('paperNote')}
                </p>
            </div>
        </article>
    )
}

const FlightCard: FC<{ flight: TripFlight; labels: Labels }> = ({ flight, labels }) => (
    <article className='trip-print-card flex flex-col gap-2 border border-foreground/15'>
        <div className='flex items-baseline justify-between gap-3'>
            <div className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1'>
                <strong className='text-xs font-semibold break-keep'>{flight.label}</strong>
                <span className='font-mono text-[9px] tracking-wide text-foreground/55 uppercase'>
                    {labels(`flightDirection.${flight.direction}`)}
                </span>
            </div>
            {flight.flightNumber && <span className='shrink-0 font-mono text-[10px] text-foreground/60 tabular-nums'>{flight.flightNumber}</span>}
        </div>
        <div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2'>
            <div className='min-w-0'>
                <strong className='block font-mono text-base font-medium tabular-nums'>{flight.departCode}</strong>
                <span className='block text-[10px] text-foreground/60'>
                    {flight.departTerminal ? `${labels('terminal')} ${flight.departTerminal}` : labels('terminalUnknown')}
                </span>
                <time className='mt-1 block font-mono text-xs tabular-nums'>{flight.departTime}</time>
            </div>
            <span aria-hidden className='text-foreground/35'>
                →
            </span>
            <div className='min-w-0 text-right'>
                <strong className='block font-mono text-base font-medium tabular-nums'>{flight.arriveCode}</strong>
                <span className='block text-[10px] text-foreground/60'>
                    {flight.arriveTerminal ? `${labels('terminal')} ${flight.arriveTerminal}` : labels('terminalUnknown')}
                </span>
                <time className='mt-1 block font-mono text-xs tabular-nums'>{flight.arriveTime}</time>
            </div>
        </div>
        {flight.note && <p className='text-[10px] leading-relaxed text-foreground/65'>{flight.note}</p>}
    </article>
)

const LodgingCard: FC<{ lodging: TripLodging; labels: Labels }> = ({ lodging, labels }) => (
    <article className='trip-print-card flex flex-col gap-1.5 border border-foreground/15'>
        <strong className='text-xs font-semibold break-keep'>{lodging.name}</strong>
        {lodging.nameLocal && <span className='text-[10px] text-foreground/60'>{lodging.nameLocal}</span>}
        {lodging.address && <p className='text-[10px] leading-relaxed break-keep'>{lodging.address}</p>}
        {(lodging.checkIn || lodging.checkOut) && (
            <p className='font-mono text-[10px] text-foreground/65 tabular-nums'>
                {lodging.checkIn && `${labels('checkIn')} ${lodging.checkIn}`}
                {lodging.checkIn && lodging.checkOut && ' · '}
                {lodging.checkOut && `${labels('checkOut')} ${lodging.checkOut}`}
            </p>
        )}
        {lodging.accessNote && <p className='text-[10px] leading-relaxed text-foreground/65'>{lodging.accessNote}</p>}
        {lodging.note && <p className='text-[10px] leading-relaxed text-foreground/65'>{lodging.note}</p>}
        {lodging.url && <div className='text-[10px]'>{printUrl(lodging.url)}</div>}
    </article>
)

const TravelDetailsPage: FC<{ trip: PublicTrip; labels: Labels }> = ({ trip, labels }) => (
    <article className='trip-print-page trip-print-details' data-print-page='details'>
        <div className='trip-print-page-inner flex flex-col gap-5'>
            <header>
                <p className='font-mono text-[9px] tracking-[0.25em] text-foreground/50 uppercase'>{labels('documentEyebrow')}</p>
                <h1 className='mt-1 text-2xl font-semibold tracking-tight'>{labels('travelDetails')}</h1>
            </header>
            {trip.flights.length > 0 && (
                <PrintSection title={labels('flights')} eyebrow={labels('transport')}>
                    <div className='grid gap-2 sm:grid-cols-2'>
                        {trip.flights.map((flight) => (
                            <FlightCard key={flight.id} flight={flight} labels={labels} />
                        ))}
                    </div>
                </PrintSection>
            )}
            {trip.lodgings.length > 0 && (
                <PrintSection title={labels('lodgings')} eyebrow={labels('stay')}>
                    <div className='grid gap-2 sm:grid-cols-2'>
                        {trip.lodgings.map((lodging) => (
                            <LodgingCard key={lodging.id} lodging={lodging} labels={labels} />
                        ))}
                    </div>
                </PrintSection>
            )}
            {trip.sidebarLinks.length > 0 && (
                <PrintSection title={labels('links')} eyebrow={labels('references')}>
                    <div className='grid gap-x-4 gap-y-3 sm:grid-cols-2'>
                        {trip.sidebarLinks.map((link) => (
                            <article key={link.id} className='flex min-w-0 flex-col gap-1'>
                                <strong className='text-xs font-medium break-keep'>{link.label}</strong>
                                {link.description && <p className='text-[10px] leading-relaxed text-foreground/65'>{link.description}</p>}
                                <div className='text-[10px]'>{printUrl(link.url)}</div>
                            </article>
                        ))}
                    </div>
                </PrintSection>
            )}
        </div>
    </article>
)

const ScheduleItemRow: FC<{ item: TripScheduleItem; kind?: TripScheduleKind; labels: Labels; checked: boolean }> = ({
    item,
    kind,
    labels,
    checked,
}) => {
    const mapUrl = item.mapQuery ? buildMapUrl(item.mapQuery) : null
    return (
        <li
            className={cn('trip-print-schedule-row grid grid-cols-[19mm_minmax(0,1fr)] gap-px', checked && 'trip-print-completed')}
            data-complete={checked ? 'true' : 'false'}>
            <div className='trip-print-card flex flex-col gap-1'>
                <time className='font-mono text-[11px] font-medium tabular-nums'>{item.timeLabel}</time>
                {kind && (
                    <span className={cn('inline-flex w-fit px-1.5 py-0.5 text-[9px] font-medium', SCHEDULE_KIND_SWATCH_CLASS[kind.colorToken])}>
                        {kind.label}
                    </span>
                )}
            </div>
            <div className='trip-print-card min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                    <strong className='text-xs leading-snug font-medium break-keep'>{item.title}</strong>
                    {checked && <span className='shrink-0 font-mono text-[9px] text-foreground/55'>{labels('done')}</span>}
                </div>
                {item.note && <p className='mt-1 text-[10px] leading-relaxed break-keep text-foreground/65'>{item.note}</p>}
                {(item.bufferNote || kind?.bufferLabel) && (
                    <p className='mt-1 text-[9px] text-foreground/55'>{item.bufferNote ?? kind?.bufferLabel}</p>
                )}
                {mapUrl && (
                    <p className='mt-1 text-[9px] text-foreground/55'>
                        {labels('map')}: {printUrl(mapUrl)}
                    </p>
                )}
            </div>
        </li>
    )
}

const DayPage: FC<{ day: TripDayDetail; index: number; trip: PublicTrip; locale: string; labels: Labels; viewerState?: TripUserState }> = ({
    day,
    index,
    trip,
    locale,
    labels,
    viewerState,
}) => {
    const kindById = new Map(trip.scheduleKinds.map((kind) => [kind.id, kind]))
    const checkedSet = new Set(viewerState?.scheduleCheckedIds ?? [])
    const density = getPrintDensity(day)
    return (
        <article
            className={cn('trip-print-page trip-print-day', `trip-print-density-${density}`)}
            data-print-page='day'
            data-print-day={index + 1}
            data-print-density={density}>
            <div className='trip-print-page-inner flex flex-col gap-3'>
                <header className='flex items-start gap-3 border-b border-foreground/20 pb-2'>
                    <span className='font-mono text-3xl leading-none font-semibold tracking-[-0.06em] text-foreground/35 tabular-nums'>
                        {formatDayNumber(index)}
                    </span>
                    <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-1'>
                            <h1 className='text-xl leading-tight font-semibold tracking-tight break-keep'>{day.title}</h1>
                            <span className='font-mono text-[10px] text-foreground/55 tabular-nums'>{day.shortLabel}</span>
                            <time className='font-mono text-[10px] text-foreground/55 tabular-nums'>{formatDateWithWeekday(day.date, locale)}</time>
                        </div>
                        {day.subtitle && <p className='mt-0.5 text-xs leading-snug break-keep text-foreground/65'>{day.subtitle}</p>}
                    </div>
                    <span className='shrink-0 font-mono text-[9px] tracking-wider text-foreground/45 uppercase'>
                        {labels('dayOf', { current: index + 1, total: trip.days.length })}
                    </span>
                </header>
                {day.overview && <p className='trip-print-card text-xs leading-relaxed break-keep'>{day.overview}</p>}
                {day.facts.length > 0 && (
                    <div className='trip-print-facts overflow-hidden'>
                        {day.facts.map((fact) => (
                            <div key={fact.id} className='grid grid-cols-[34mm_minmax(0,1fr)] gap-px bg-foreground/15 text-[10px]'>
                                <div className='bg-muted px-2 py-1.5 text-foreground/65'>{fact.label}</div>
                                <div className='bg-card px-2 py-1.5 break-keep'>{fact.value}</div>
                            </div>
                        ))}
                    </div>
                )}
                {(day.planHeadline || day.planNote) && (
                    <div className='trip-print-card text-xs leading-relaxed break-keep'>
                        {day.planHeadline && <strong className='font-medium'>{day.planHeadline}</strong>}
                        {day.planHeadline && day.planNote && ' '}
                        {day.planNote}
                    </div>
                )}
                {day.routes.length > 0 && (
                    <PrintSection title={labels('travelTime')}>
                        <div className='grid gap-px sm:grid-cols-2'>
                            {day.routes.map((route) => (
                                <div key={route.id} className='trip-print-card flex flex-col gap-1 border border-foreground/15'>
                                    <div className='flex items-baseline justify-between gap-2'>
                                        <strong className='text-[11px] font-medium break-keep'>
                                            {route.origin} → {route.destination}
                                        </strong>
                                        <span className='shrink-0 font-mono text-[10px] tabular-nums'>
                                            {labels('minutes', { minutes: route.minutes })}
                                        </span>
                                    </div>
                                    {route.pathText && <p className='text-[10px] leading-relaxed break-keep'>{route.pathText}</p>}
                                    {route.formula && (
                                        <p className='font-mono text-[9px] leading-relaxed break-keep text-foreground/55'>{route.formula}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </PrintSection>
                )}
                {day.scheduleItems.length > 0 ? (
                    <ol className='trip-print-schedule flex flex-col gap-px'>
                        {day.scheduleItems.map((item) => (
                            <ScheduleItemRow
                                key={item.id}
                                item={item}
                                kind={kindById.get(item.kindId)}
                                labels={labels}
                                checked={checkedSet.has(item.id)}
                            />
                        ))}
                    </ol>
                ) : (
                    <p className='trip-print-card text-xs text-foreground/60'>{labels('emptyDay')}</p>
                )}
                {(day.closingHeadline || day.closingNote) && (
                    <div className='trip-print-card text-xs leading-relaxed break-keep'>
                        {day.closingHeadline && <strong className='font-medium'>{day.closingHeadline}</strong>}
                        {day.closingHeadline && day.closingNote && ' '}
                        {day.closingNote}
                    </div>
                )}
                {day.notes.length > 0 && (
                    <ul className='trip-print-card flex list-disc flex-col gap-1 pl-7 text-[10px] leading-relaxed'>
                        {day.notes.map((note) => (
                            <li key={note.id} className='break-keep'>
                                {note.leading}
                                {note.leading && note.linkUrl && ' '}
                                {note.linkUrl && <PrintInlineLink url={note.linkUrl} label={note.linkLabel} />}
                                {note.linkUrl && note.trailing && ' '}
                                {note.trailing}
                            </li>
                        ))}
                    </ul>
                )}
                {viewerState?.memos[day.id] && (
                    <div className='trip-print-card border-l-2 border-foreground/20 text-[10px] leading-relaxed break-keep'>
                        <strong className='block text-[9px] tracking-wider text-foreground/55 uppercase'>{labels('privateMemo')}</strong>
                        <p className='mt-1 whitespace-pre-line'>{viewerState.memos[day.id]}</p>
                    </div>
                )}
            </div>
        </article>
    )
}

const renderInfoBlock = (block: TripInfoBlock, locale: string, labels: Labels, days: readonly TripDayDetail[]): ReactNode => {
    if (block.kind === 'day_table')
        return (
            <div className='flex flex-col gap-2'>
                <div className='trip-print-info-table overflow-hidden'>
                    <div className='grid grid-cols-[25mm_repeat(3,minmax(0,1fr))] gap-px bg-foreground/15 text-[9px]'>
                        <span className='bg-muted p-1.5 font-medium'>{labels('tableDate')}</span>
                        <span className='bg-muted p-1.5 font-medium'>{labels('tableMorning')}</span>
                        <span className='bg-muted p-1.5 font-medium'>{labels('tableAfternoon')}</span>
                        <span className='bg-muted p-1.5 font-medium'>{labels('tableEvening')}</span>
                        {days.map((day) => (
                            <span key={`${day.id}-date`} className='contents'>
                                <span className='bg-card p-1.5 font-mono tabular-nums'>{formatDateWithWeekday(day.date, locale)}</span>
                                <span className='bg-card p-1.5 break-keep'>{day.morningSummary ?? '—'}</span>
                                <span className='bg-card p-1.5 break-keep'>{day.afternoonSummary ?? '—'}</span>
                                <span className='bg-card p-1.5 break-keep'>{day.eveningSummary ?? '—'}</span>
                            </span>
                        ))}
                    </div>
                </div>
                {block.linkUrl && (
                    <p className='text-[10px] leading-relaxed break-keep'>
                        <PrintInlineLink url={block.linkUrl} label={block.linkLabel} />
                    </p>
                )}
            </div>
        )
    if (block.kind === 'heading')
        return (
            <div className='flex flex-col gap-1'>
                <h3 className='text-xs font-semibold tracking-tight break-keep'>{block.text ?? block.emphasis}</h3>
                {block.linkUrl && (
                    <p className='text-[10px] leading-relaxed break-keep'>
                        <PrintInlineLink url={block.linkUrl} label={block.linkLabel} />
                    </p>
                )}
            </div>
        )
    if (block.kind === 'bullet')
        return (
            <li key={block.id} className='break-keep'>
                {block.emphasis && <strong className='font-medium'>{block.emphasis} </strong>}
                {block.text}
                {block.linkUrl && (block.emphasis || block.text) && ' '}
                {block.linkUrl && <PrintInlineLink url={block.linkUrl} label={block.linkLabel} />}
            </li>
        )
    return (
        <p className='text-[10px] leading-relaxed break-keep'>
            {block.emphasis && <strong className='font-medium'>{block.emphasis} </strong>}
            {block.text}
            {block.linkUrl && (block.emphasis || block.text) && ' '}
            {block.linkUrl && <PrintInlineLink url={block.linkUrl} label={block.linkLabel} />}
        </p>
    )
}

const InfoSection: FC<{ section: TripInfoSectionDetail; locale: string; labels: Labels; days: readonly TripDayDetail[] }> = ({
    section,
    locale,
    labels,
    days,
}) => {
    const groups: Array<{ kind: 'bullet'; blocks: TripInfoBlock[] } | { kind: 'single'; block: TripInfoBlock }> = []
    for (const block of section.blocks) {
        const previous = groups.at(-1)
        if (block.kind === 'bullet' && previous?.kind === 'bullet') previous.blocks.push(block)
        else if (block.kind === 'bullet') groups.push({ kind: 'bullet', blocks: [block] })
        else groups.push({ kind: 'single', block })
    }
    return (
        <section className='trip-print-card flex flex-col gap-2'>
            <h3 className='text-xs font-medium break-keep'>{section.title}</h3>
            {groups.map((group) =>
                group.kind === 'bullet' ? (
                    <ul key={group.blocks[0]?.id} className='flex list-disc flex-col gap-1 pl-5 text-[10px] leading-relaxed'>
                        {group.blocks.map((block) => renderInfoBlock(block, locale, labels, days))}
                    </ul>
                ) : (
                    <div key={group.block.id}>{renderInfoBlock(group.block, locale, labels, days)}</div>
                ),
            )}
        </section>
    )
}

const InfoPage: FC<{ trip: PublicTrip; locale: string; labels: Labels }> = ({ trip, locale, labels }) => (
    <article className='trip-print-page trip-print-appendix' data-print-page='info'>
        <div className='trip-print-page-inner flex flex-col gap-5'>
            <header>
                <p className='font-mono text-[9px] tracking-[0.25em] text-foreground/50 uppercase'>{labels('appendix')}</p>
                <h1 className='mt-1 text-2xl font-semibold tracking-tight'>{labels('infoTitle')}</h1>
            </header>
            <div className='flex flex-col gap-3'>
                {trip.infoSections.map((section) => (
                    <InfoSection key={section.id} section={section} locale={locale} labels={labels} days={trip.days} />
                ))}
            </div>
        </div>
    </article>
)

const BookingCard: FC<{ booking: TripBookingDetail; labels: Labels; checked: boolean }> = ({ booking, labels, checked }) => (
    <article className='trip-print-card flex flex-col gap-1.5 border border-foreground/15'>
        <div className='flex items-start justify-between gap-2'>
            <h3 className='text-xs leading-snug font-medium break-keep'>{booking.title}</h3>
            {checked && <span className='shrink-0 font-mono text-[9px] text-foreground/55'>{labels('done')}</span>}
        </div>
        <p className='font-mono text-[10px] text-foreground/65 tabular-nums'>
            {booking.whenLabel}
            {booking.whenLabel && ' · '}
            {labels(`priority.${booking.priority}`)}
        </p>
        {booking.planStatus && (
            <p className='text-[10px] leading-relaxed'>
                {labels('status')}: {booking.planStatus}
            </p>
        )}
        {booking.actionNote && <p className='text-[10px] leading-relaxed break-keep'>{booking.actionNote}</p>}
        {booking.linkUrl && (
            <p className='text-[10px]'>
                {booking.linkLabel ?? labels('bookingLink')}: {printUrl(booking.linkUrl)}
            </p>
        )}
        {booking.attachments.length > 0 && (
            <ul className='flex flex-col gap-1 text-[10px]'>
                {booking.attachments.map((attachment) => (
                    <li key={attachment.id}>
                        {attachment.label ?? labels('attachment')}: {printUrl(attachment.url)}
                    </li>
                ))}
            </ul>
        )}
    </article>
)

const BookingPage: FC<{ trip: PublicTrip; labels: Labels; viewerState?: TripUserState }> = ({ trip, labels, viewerState }) => {
    const checkedSet = new Set(viewerState?.bookingCheckedIds ?? [])
    return (
        <article className='trip-print-page trip-print-appendix' data-print-page='bookings'>
            <div className='trip-print-page-inner flex flex-col gap-5'>
                <header>
                    <p className='font-mono text-[9px] tracking-[0.25em] text-foreground/50 uppercase'>{labels('appendix')}</p>
                    <h1 className='mt-1 text-2xl font-semibold tracking-tight'>{labels('bookingsTitle')}</h1>
                </header>
                {trip.bookingNote && <p className='trip-print-card text-xs leading-relaxed break-keep'>{trip.bookingNote}</p>}
                {viewerState && (
                    <p className='font-mono text-[10px] text-foreground/60 tabular-nums'>
                        {labels('bookingProgress', { checked: viewerState.bookingCheckedIds.length, total: trip.bookings.length })}
                    </p>
                )}
                <div className='grid gap-px sm:grid-cols-2'>
                    {trip.bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} labels={labels} checked={checkedSet.has(booking.id)} />
                    ))}
                </div>
            </div>
        </article>
    )
}

export const TripPrintDocument = async ({ trip, locale, viewerState }: TripPrintDocumentProps) => {
    const labels = await getTranslations({ locale, namespace: 'tripPrint' })
    return (
        <main className='trip-print-canvas bg-background text-foreground'>
            <OverviewPage trip={trip} locale={locale} labels={labels} viewerState={viewerState} />
            {(trip.flights.length > 0 || trip.lodgings.length > 0 || trip.sidebarLinks.length > 0) && (
                <TravelDetailsPage trip={trip} labels={labels} />
            )}
            {trip.days.map((day, index) => (
                <DayPage key={day.id} day={day} index={index} trip={trip} locale={locale} labels={labels} viewerState={viewerState} />
            ))}
            {(trip.bookings.length > 0 || Boolean(trip.bookingNote)) && <BookingPage trip={trip} labels={labels} viewerState={viewerState} />}
            {trip.infoSections.length > 0 && <InfoPage trip={trip} locale={locale} labels={labels} />}
            {trip.footerNote && (
                <article className='trip-print-page trip-print-appendix' data-print-page='footer'>
                    <div className='trip-print-page-inner flex flex-col gap-3'>
                        <header>
                            <p className='font-mono text-[9px] tracking-[0.25em] text-foreground/50 uppercase'>{labels('appendix')}</p>
                            <h1 className='mt-1 text-2xl font-semibold tracking-tight'>{labels('footerTitle')}</h1>
                        </header>
                        <p className='trip-print-card text-xs leading-relaxed break-keep whitespace-pre-line'>{trip.footerNote}</p>
                    </div>
                </article>
            )}
        </main>
    )
}
