'use client'

import { ExternalLinkIcon } from 'lucide-react'
import type { FC } from 'react'
import type { TripBooking } from '@/entities/trip/trip.type'
import { formatRatio, toPercent } from '@/features/trip-viewer/trip-viewer-format'
import { BOOKING_PRIORITY_LABEL } from '@/shared/constant/trip'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import { AnimatedProgress } from '@/shared/ui/motion/animated-progress'
import { StaggerItem, StaggerList } from '@/shared/ui/motion/stagger-list'

const STORAGE_HINT = '완료 표시는 내 계정에 저장됩니다. 체크해도 실제 예약·결제는 진행되지 않습니다.'

type BookingsPanelProps = {
    bookings: readonly TripBooking[]
    bookingNote: string | null
    checkedIds: readonly string[]
    isCheckable: boolean
    isPrintLayout?: boolean
    onToggle?: (bookingId: string, checked: boolean) => void
}

export const BookingsPanel: FC<BookingsPanelProps> = ({ bookings, bookingNote, checkedIds, isCheckable, isPrintLayout = false, onToggle }) => {
    const checkedSet = new Set(checkedIds)
    const completedCount = bookings.filter((booking) => checkedSet.has(booking.id)).length

    return (
        <section className={cn('flex flex-col gap-px', isPrintLayout && 'break-before-page')}>
            <h2 className='bg-card p-3 text-base font-semibold tracking-tight'>예매 체크리스트</h2>
            {bookingNote && <p className='bg-card p-3 text-sm leading-relaxed break-keep'>{bookingNote}</p>}
            <div className='flex flex-col gap-1 bg-card p-3'>
                <span aria-live='polite' className='font-mono text-xs text-muted-foreground tabular-nums'>
                    {formatRatio(completedCount, bookings.length)} 완료 표시
                </span>
                <AnimatedProgress value={toPercent(completedCount, bookings.length)} label='예매 완료 표시 수' />
            </div>
            {isCheckable && !isPrintLayout && <p className='bg-card p-3 text-xs break-keep text-muted-foreground print:hidden'>{STORAGE_HINT}</p>}
            <StaggerList as='div' className='grid gap-px sm:grid-cols-2 xl:grid-cols-3'>
                {bookings.map((booking) => (
                    <StaggerItem
                        key={booking.id}
                        className={cn('flex h-full break-inside-avoid flex-col gap-2 p-3', checkedSet.has(booking.id) ? 'bg-muted' : 'bg-card')}>
                        <div className='flex items-start gap-3'>
                            {isCheckable && !isPrintLayout && (
                                <Checkbox
                                    id={`booking-check-${booking.id}`}
                                    className='mt-0.5 rounded-none'
                                    checked={checkedSet.has(booking.id)}
                                    aria-label={`${booking.title} 완료 표시`}
                                    onCheckedChange={(checked) => onToggle?.(booking.id, checked === true)}
                                />
                            )}
                            <label htmlFor={`booking-check-${booking.id}`} className='min-w-0 flex-1 cursor-pointer text-sm font-medium break-keep'>
                                {booking.title}
                            </label>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                            {booking.whenLabel}
                            {booking.whenLabel && ' · '}
                            {BOOKING_PRIORITY_LABEL[booking.priority]}
                        </p>
                        {(booking.linkUrl || booking.actionNote) && (
                            <p className='text-xs break-keep'>
                                {booking.linkUrl && booking.linkLabel && (
                                    <a
                                        className='inline-flex items-center gap-1 font-medium underline'
                                        href={booking.linkUrl}
                                        target='_blank'
                                        rel='noopener noreferrer'>
                                        {booking.linkLabel}
                                        <ExternalLinkIcon aria-hidden className='size-3' />
                                    </a>
                                )}
                                {booking.linkUrl && booking.actionNote && ', '}
                                {booking.actionNote}
                            </p>
                        )}
                        {booking.planStatus && <p className='mt-auto text-xs text-muted-foreground'>계획 작성 시 상태: {booking.planStatus}</p>}
                    </StaggerItem>
                ))}
            </StaggerList>
        </section>
    )
}
