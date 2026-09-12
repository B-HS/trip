import { getLocale, getTranslations } from 'next-intl/server'
import type { FC } from 'react'
import type { PublicTrip } from '@/entities/trip/trip.type'
import { formatTripLength } from '@/shared/lib/trip-length'

export const TripPublicSummary: FC<{ trip: PublicTrip }> = async ({ trip }) => {
    const locale = await getLocale()
    const t = await getTranslations('metadata')
    const period = formatTripLength({ startDate: trip.startDate, endDate: trip.endDate, nights: trip.customNights, days: trip.customDays }, locale)

    return (
        <section className='flex flex-col gap-2 bg-card p-3' aria-labelledby='public-trip-summary-heading'>
            <h2 id='public-trip-summary-heading' className='text-sm font-medium'>
                {t('tripSummary.heading')}
            </h2>
            <p className='text-sm text-muted-foreground'>
                {t('tripSummary.description', {
                    title: trip.title,
                    destination: trip.destination,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    period,
                })}
            </p>
            <ul className='grid gap-2 text-xs text-muted-foreground sm:grid-cols-3'>
                <li>
                    <span className='font-medium text-foreground'>{t('tripSummary.destination')}: </span>
                    {trip.destination}
                </li>
                <li>
                    <span className='font-medium text-foreground'>{t('tripSummary.dates')}: </span>
                    <time dateTime={trip.startDate}>{trip.startDate}</time> – <time dateTime={trip.endDate}>{trip.endDate}</time>
                </li>
                <li>
                    <span className='font-medium text-foreground'>{t('tripSummary.flights')}: </span>
                    {trip.flights.length}
                </li>
            </ul>
        </section>
    )
}
