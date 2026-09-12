'use client'

import { CalendarIcon, MapPinIcon, MoreHorizontalIcon, PencilIcon, PlaneIcon, SquarePenIcon, StarIcon, Trash2Icon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { TripDestinationView } from '@/entities/trip/trip.type'
import { TRIP_STATUS_TEXT_CLASS, type TripStatus } from '@/features/trips/trip-status'
import { countryName } from '@/shared/constant/countries'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'

export type TripCardProps = {
    tripId: string
    title: string
    eyebrow: string | null
    destination: string
    dateRangeLabel: string
    destinations: TripDestinationView[]
    routeLabel: string | null
    isFavorite: boolean
    status: TripStatus | null
    roleLabel: string
    lengthLabel: string
    scheduleCount: number
    bookingCount: number
    canEdit: boolean
    canDelete: boolean
    onDelete: () => void
    onToggleFavorite: () => void
}

export const TripCard: FC<TripCardProps> = ({
    tripId,
    title,
    eyebrow,
    destination,
    dateRangeLabel,
    destinations,
    routeLabel,
    isFavorite,
    status,
    roleLabel,
    lengthLabel,
    scheduleCount,
    bookingCount,
    canEdit,
    canDelete,
    onDelete,
    onToggleFavorite,
}) => {
    const locale = useLocale()
    const t = useTranslations('trips.card')

    return (
        <article className='relative flex h-full min-w-0 flex-col gap-3 bg-card p-3 transition-colors focus-within:bg-accent hover:bg-accent'>
            <div className='flex items-start justify-between gap-2'>
                <div className='flex min-w-0 flex-col gap-1'>
                    {eyebrow !== null && <p className='truncate font-mono text-2xs tracking-widest text-muted-foreground uppercase'>{eyebrow}</p>}
                    <Link className='min-w-0 rounded-none outline-none before:absolute before:inset-0 before:content-[""]' href={`/trips/${tripId}`}>
                        <h2 className='truncate text-sm font-medium text-card-foreground'>{title}</h2>
                    </Link>
                </div>
                <div className='flex shrink-0 items-stretch gap-px bg-background'>
                    <Button
                        className='relative z-10 shrink-0'
                        variant='cell'
                        size='cellIcon'
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? t('favoriteRemove') : t('favoriteAdd')}
                        onClick={onToggleFavorite}>
                        <StarIcon className={cn(isFavorite && 'fill-current')} aria-hidden />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className='relative z-10 shrink-0' variant='cell' size='cellIcon' aria-label={t('menuAria', { title })}>
                                <MoreHorizontalIcon aria-hidden />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                                <Link href={`/trips/${tripId}`}>
                                    <SquarePenIcon aria-hidden />
                                    {t('open')}
                                </Link>
                            </DropdownMenuItem>
                            {canEdit && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/trips/${tripId}/edit`}>
                                        <PencilIcon aria-hidden />
                                        {t('edit')}
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {canDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem variant='destructive' onSelect={onDelete}>
                                        <Trash2Icon aria-hidden />
                                        {t('delete')}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <p className='flex min-w-0 flex-wrap items-center gap-1.5 font-mono text-2xs break-keep text-muted-foreground'>
                {status !== null && (
                    <>
                        <span className={TRIP_STATUS_TEXT_CLASS[status.tone]}>{status.label}</span>
                        <span aria-hidden>·</span>
                    </>
                )}
                <span>{roleLabel}</span>
            </p>
            {destinations.length > 0 && (
                <ul className='flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-2xs text-muted-foreground'>
                    {destinations.map((item, index) => (
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
                    <dd className='truncate'>{destination}</dd>
                </div>
                <div className='flex min-w-0 items-center gap-1.5'>
                    <dt className='sr-only'>{t('period')}</dt>
                    <CalendarIcon className='size-3 shrink-0' aria-hidden />
                    <dd className='truncate font-mono tabular-nums'>{dateRangeLabel}</dd>
                </div>
                {routeLabel !== null && (
                    <div className='flex min-w-0 items-center gap-1.5'>
                        <dt className='sr-only'>{t('route')}</dt>
                        <PlaneIcon className='size-3 shrink-0' aria-hidden />
                        <dd className='truncate font-mono'>{routeLabel}</dd>
                    </div>
                )}
            </dl>
            <p className='mt-auto font-mono text-2xs break-keep text-muted-foreground tabular-nums'>
                {t('meta', { scheduleCount, bookingCount, lengthLabel })}
            </p>
        </article>
    )
}
