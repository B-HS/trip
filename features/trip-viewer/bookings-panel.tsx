'use client'

import { ExternalLinkIcon } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { TripBookingDetail } from '@/entities/trip/trip.type'
import { formatRatio, toPercent } from '@/features/trip-viewer/trip-viewer-format'
import { cn } from '@/shared/lib/utils'
import { Checkbox } from '@/shared/ui/checkbox'
import { AnimatedProgress } from '@/shared/ui/motion/animated-progress'
import { StaggerItem, StaggerList } from '@/shared/ui/motion/stagger-list'

const ATTACHMENT_IMAGE_WIDTH = 320
const ATTACHMENT_IMAGE_HEIGHT = 240
const ATTACHMENT_IMAGE_SIZES = '320px'

type BookingsPanelProps = {
    bookings: readonly TripBookingDetail[]
    bookingNote: string | null
    checkedIds: readonly string[]
    isCheckable: boolean
    isPrintLayout?: boolean
    onToggle?: (bookingId: string, checked: boolean) => void
}

export const BookingsPanel: FC<BookingsPanelProps> = ({ bookings, bookingNote, checkedIds, isCheckable, isPrintLayout = false, onToggle }) => {
    const t = useTranslations('tripViewer')
    const checkedSet = new Set(checkedIds)
    const completedCount = bookings.filter((booking) => checkedSet.has(booking.id)).length

    return (
        <section className={cn('flex flex-col gap-px', isPrintLayout && 'break-before-page')}>
            <h2 className='bg-card p-3 text-base font-semibold tracking-tight'>{t('bookingsTitle')}</h2>
            {bookingNote && <p className='bg-card p-3 text-sm leading-relaxed break-keep'>{bookingNote}</p>}
            <div className='flex flex-col gap-1 bg-card p-3'>
                <span aria-live='polite' className='font-mono text-xs text-muted-foreground tabular-nums'>
                    {t('completedRatioMark', { ratio: formatRatio(completedCount, bookings.length) })}
                </span>
                <AnimatedProgress value={toPercent(completedCount, bookings.length)} label={t('completedRatioAria')} />
            </div>
            {isCheckable && !isPrintLayout && <p className='bg-card p-3 text-xs break-keep text-muted-foreground print:hidden'>{t('storageHint')}</p>}
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
                                    aria-label={t('bookingCheckAria', { title: booking.title })}
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
                            {t(`bookingPriority.${booking.priority}`)}
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
                        {booking.attachments.length > 0 && (
                            <ul className='flex flex-col gap-2'>
                                {booking.attachments.map((attachment) => (
                                    <li key={attachment.id} className='text-xs break-all'>
                                        {attachment.kind === 'image' && !isPrintLayout && (
                                            <a href={attachment.url} target='_blank' rel='noopener noreferrer'>
                                                <Image
                                                    className='h-auto w-full max-w-80 bg-muted'
                                                    src={attachment.url}
                                                    alt={attachment.label ?? t('attachmentAlt')}
                                                    width={ATTACHMENT_IMAGE_WIDTH}
                                                    height={ATTACHMENT_IMAGE_HEIGHT}
                                                    sizes={ATTACHMENT_IMAGE_SIZES}
                                                />
                                                {attachment.label && <span className='mt-1 block text-muted-foreground'>{attachment.label}</span>}
                                            </a>
                                        )}
                                        {attachment.kind === 'image' && isPrintLayout && (
                                            <span className='text-muted-foreground'>
                                                {attachment.label ?? t('attachmentAlt')}: {attachment.url}
                                            </span>
                                        )}
                                        {attachment.kind === 'link' && (
                                            <a
                                                className='inline-flex items-center gap-1 font-medium underline'
                                                href={attachment.url}
                                                target='_blank'
                                                rel='noopener noreferrer'>
                                                {attachment.label ?? attachment.url}
                                                <ExternalLinkIcon aria-hidden className='size-3' />
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {booking.planStatus && (
                            <p className='mt-auto text-xs text-muted-foreground'>{t('planStatusNote', { status: booking.planStatus })}</p>
                        )}
                    </StaggerItem>
                ))}
            </StaggerList>
        </section>
    )
}
