'use client'

import type { ReactNode, FC } from 'react'
import { useTranslations } from 'next-intl'
import type { PublicTrip } from '@/entities/trip/trip.type'
import { BookingsPanel } from '@/features/trip-viewer/bookings-panel'
import { DayPanel } from '@/features/trip-viewer/day-panel'
import { InfoPanel } from '@/features/trip-viewer/info-panel'
import { TripFooter } from '@/features/trip-viewer/trip-footer'
import { getPrintDensity } from '@/shared/lib/print-density'

const DAY_PANEL_ID = 'trip-day-panel'

type TripPrintLayoutProps = {
    trip: Pick<PublicTrip, 'title' | 'scheduleKinds' | 'days' | 'bookings' | 'bookingNote' | 'infoSections' | 'footerNote'>
    sidebar: ReactNode
    checkedScheduleIds: readonly string[]
    checkedBookingIds: readonly string[]
}

export const TripPrintLayout: FC<TripPrintLayoutProps> = ({ trip, sidebar, checkedScheduleIds, checkedBookingIds }) => {
    const t = useTranslations('tripViewer')

    return (
        <div className='trip-print-root hidden flex-col gap-px print:flex'>
            <section className='trip-print-page trip-print-summary' data-print-page='summary'>
                {sidebar}
            </section>
            {trip.days.map((day, dayIndex) => {
                const density = getPrintDensity(day)
                return (
                    <section
                        key={day.id}
                        className={`trip-print-page trip-print-day trip-print-density-${density}`}
                        data-print-page='day'
                        data-print-day={dayIndex + 1}
                        data-print-density={density}>
                        <div className='trip-print-page-context'>
                            <span>{trip.title}</span>
                            <span>{t('printDayContext', { current: dayIndex + 1, total: trip.days.length })}</span>
                        </div>
                        <DayPanel
                            day={day}
                            scheduleKinds={trip.scheduleKinds}
                            dayIndex={dayIndex}
                            panelId={`${DAY_PANEL_ID}-print-${day.id}`}
                            checkedItemIds={checkedScheduleIds}
                            isHideCompleted={false}
                            isCheckable={false}
                            isPrintLayout
                        />
                    </section>
                )
            })}
            {(trip.bookings.length > 0 || trip.bookingNote) && (
                <section className='trip-print-page trip-print-supplement' data-print-page='bookings'>
                    <BookingsPanel
                        bookings={trip.bookings}
                        bookingNote={trip.bookingNote}
                        checkedIds={checkedBookingIds}
                        isCheckable={false}
                        isPrintLayout
                    />
                </section>
            )}
            {trip.infoSections.length > 0 && (
                <section className='trip-print-page trip-print-supplement' data-print-page='info'>
                    <InfoPanel sections={trip.infoSections} days={trip.days} isPrintLayout />
                </section>
            )}
            {trip.footerNote && (
                <section className='trip-print-page trip-print-supplement' data-print-page='footer'>
                    <TripFooter footerNote={trip.footerNote} />
                </section>
            )}
        </div>
    )
}
