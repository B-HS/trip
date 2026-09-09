'use client'

import { CalendarIcon, MapPinIcon, MoreHorizontalIcon, PencilIcon, PlaneIcon, SquarePenIcon, StarIcon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import type { FC } from 'react'
import type { TripDestinationView } from '@/entities/trip/trip.type'
import { TRIP_STATUS_BADGE_VARIANT, type TripStatus } from '@/features/trips/trip-status'
import { countryName } from '@/shared/constant/countries'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
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
}) => (
    <article className='relative flex h-full flex-col gap-3 bg-card p-3 transition-colors focus-within:bg-accent hover:bg-accent'>
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
                    aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    onClick={onToggleFavorite}>
                    <StarIcon className={cn(isFavorite && 'fill-current')} aria-hidden />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className='relative z-10 shrink-0' variant='cell' size='cellIcon' aria-label={`${title} 메뉴 열기`}>
                            <MoreHorizontalIcon aria-hidden />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                            <Link href={`/trips/${tripId}`}>
                                <SquarePenIcon aria-hidden />
                                열기
                            </Link>
                        </DropdownMenuItem>
                        {canEdit && (
                            <DropdownMenuItem asChild>
                                <Link href={`/trips/${tripId}/edit`}>
                                    <PencilIcon aria-hidden />
                                    편집
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem variant='destructive' onSelect={onDelete}>
                                    <Trash2Icon aria-hidden />
                                    삭제
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <div className='flex flex-wrap items-center gap-1.5'>
            {status !== null && <Badge variant={TRIP_STATUS_BADGE_VARIANT[status.tone]}>{status.label}</Badge>}
            <Badge variant='secondary'>{roleLabel}</Badge>
        </div>
        {destinations.length > 0 && (
            <ul className='flex flex-wrap items-center gap-1.5'>
                {destinations.map((item, index) => (
                    <li key={`${index}-${item.countryCode}`} className='flex items-center gap-1 bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>
                        <span className='font-mono text-2xs tracking-widest'>{item.countryCode}</span>
                        <span className='truncate'>{item.city ?? countryName(item.countryCode)}</span>
                    </li>
                ))}
            </ul>
        )}
        <dl className='flex flex-col gap-1 text-xs text-muted-foreground'>
            <div className='flex min-w-0 items-center gap-1.5'>
                <dt className='sr-only'>목적지</dt>
                <MapPinIcon className='size-3 shrink-0' aria-hidden />
                <dd className='truncate'>{destination}</dd>
            </div>
            <div className='flex min-w-0 items-center gap-1.5'>
                <dt className='sr-only'>기간</dt>
                <CalendarIcon className='size-3 shrink-0' aria-hidden />
                <dd className='truncate font-mono tabular-nums'>{dateRangeLabel}</dd>
            </div>
            {routeLabel !== null && (
                <div className='flex min-w-0 items-center gap-1.5'>
                    <dt className='sr-only'>경로</dt>
                    <PlaneIcon className='size-3 shrink-0' aria-hidden />
                    <dd className='truncate font-mono'>{routeLabel}</dd>
                </div>
            )}
        </dl>
        <p className='mt-auto font-mono text-2xs text-muted-foreground tabular-nums'>
            일정 {scheduleCount} · 예매 {bookingCount} · {lengthLabel}
        </p>
    </article>
)
