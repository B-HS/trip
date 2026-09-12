import { CalendarIcon, HeartIcon, MapPinIcon, PlaneIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PublicTripCard as PublicTripCardItem } from '@/entities/trip/trip.type'
import { AuthorChip } from '@/features/community/author-chip'
import { countryName } from '@/shared/constant/countries'
import { formatTripDateRange } from '@/shared/lib/trip-date-range'
import { formatTripLength } from '@/shared/lib/trip-length'
import { resolveTripRouteLabel } from '@/shared/lib/trip-route-label'

export type PublicTripCardProps = {
    trip: PublicTripCardItem
}

export const PublicTripCard: FC<PublicTripCardProps> = ({ trip }) => {
    const t = useTranslations('community.tripCard')
    const tCounts = useTranslations('community.counts')
    const locale = useLocale()
    const routeLabel = resolveTripRouteLabel(trip.flights)
    const lengthLabel = formatTripLength(
        { startDate: trip.startDate, endDate: trip.endDate, nights: trip.customNights, days: trip.customDays },
        locale,
    )

    return (
        <article className='relative flex h-full w-full min-w-0 flex-col gap-2 bg-card p-3 transition-colors focus-within:bg-accent hover:bg-accent'>
            {trip.eyebrow !== null && <p className='truncate font-mono text-2xs tracking-widest text-muted-foreground uppercase'>{trip.eyebrow}</p>}
            <Link className='min-w-0 rounded-none outline-none before:absolute before:inset-0 before:content-[""]' href={`/s/${trip.shareSlug}`}>
                <h3 className='truncate text-sm font-medium text-card-foreground'>{trip.title}</h3>
            </Link>
            {trip.destinations.length > 0 && (
                <ul className='flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-2xs text-muted-foreground'>
                    {trip.destinations.map((item, index) => (
                        <li key={`${index}-${item.countryCode}`} className='flex min-w-0 items-center gap-1'>
                            {index > 0 && <span aria-hidden>·</span>}
                            <span className='font-mono tracking-widest'>{item.countryCode}</span>
                            <span className='truncate break-keep'>{item.city ?? countryName(item.countryCode, locale)}</span>
                        </li>
                    ))}
                </ul>
            )}
            <dl className='flex flex-col gap-1 text-xs text-muted-foreground'>
                <div className='flex min-w-0 items-center gap-1.5'>
                    <dt className='sr-only'>{t('destination')}</dt>
                    <MapPinIcon className='size-3 shrink-0' aria-hidden />
                    <dd className='truncate'>{trip.destination}</dd>
                </div>
                <div className='flex min-w-0 items-center gap-1.5'>
                    <dt className='sr-only'>{t('period')}</dt>
                    <CalendarIcon className='size-3 shrink-0' aria-hidden />
                    <dd className='truncate font-mono tabular-nums'>
                        {formatTripDateRange(trip, locale)} · {lengthLabel}
                    </dd>
                </div>
                {routeLabel !== null && (
                    <div className='flex min-w-0 items-center gap-1.5'>
                        <dt className='sr-only'>{t('route')}</dt>
                        <PlaneIcon className='size-3 shrink-0' aria-hidden />
                        <dd className='truncate font-mono'>{routeLabel}</dd>
                    </div>
                )}
            </dl>
            <div className='mt-auto flex items-center justify-between gap-2 text-2xs text-muted-foreground'>
                <span className='relative z-10 flex min-w-0'>
                    <AuthorChip author={trip.owner} />
                </span>
                <span className='flex shrink-0 items-center gap-1 font-mono tabular-nums'>
                    <HeartIcon className='size-3' aria-hidden />
                    <span className='sr-only'>{tCounts('like')}</span>
                    {trip.likeCount}
                </span>
            </div>
        </article>
    )
}
