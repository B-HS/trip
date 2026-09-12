'use client'

import { CalendarOffIcon } from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { TripDayDetail, TripScheduleKind } from '@/entities/trip/trip.type'
import { ScheduleRow } from '@/features/trip-viewer/schedule-row'
import { formatDayNumber, formatRatio, toPercent } from '@/features/trip-viewer/trip-viewer-format'
import { toScheduleKindMap } from '@/features/trip-viewer/trip-viewer-kind'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { cn } from '@/shared/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'
import { AnimatedProgress } from '@/shared/ui/motion/animated-progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'

const SCHEDULE_STAGGER = 0.03
const ROUTES_ACCORDION_VALUE = 'routes'
const MEMO_ROWS = 3

const TIMELINE_VARIANTS: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: SCHEDULE_STAGGER } },
}

type DayPanelProps = {
    day: TripDayDetail
    scheduleKinds: readonly TripScheduleKind[]
    dayIndex: number
    panelId: string
    checkedItemIds: readonly string[]
    isHideCompleted: boolean
    isCheckable: boolean
    isPrintLayout?: boolean
    memo?: string
    memoStateLabel?: string
    onToggleItem?: (itemId: string, checked: boolean) => void
    onToggleHideCompleted?: () => void
    onRequestReset?: () => void
    onMemoChange?: (value: string) => void
}

export const DayPanel: FC<DayPanelProps> = ({
    day,
    scheduleKinds,
    dayIndex,
    panelId,
    checkedItemIds,
    isHideCompleted,
    isCheckable,
    isPrintLayout = false,
    memo = '',
    memoStateLabel = '',
    onToggleItem,
    onToggleHideCompleted,
    onRequestReset,
    onMemoChange,
}) => {
    const t = useTranslations('tripViewer')
    const kindById = toScheduleKindMap(scheduleKinds)
    const checkedIds = new Set(checkedItemIds)
    const completedCount = day.scheduleItems.filter((item) => checkedIds.has(item.id)).length
    const visibleItems = isHideCompleted && !isPrintLayout ? day.scheduleItems.filter((item) => !checkedIds.has(item.id)) : day.scheduleItems
    const memoId = `day-memo-${day.id}`
    const routeBlocks = day.routes.map((route) => (
        <div key={route.id} className='bg-card px-4 py-3'>
            <div className='flex items-baseline justify-between gap-3'>
                <strong className='text-sm leading-snug font-medium break-keep'>
                    {route.origin} → {route.destination}
                </strong>
                <span className='font-mono text-sm font-medium whitespace-nowrap tabular-nums'>{t('minutesUnit', { minutes: route.minutes })}</span>
            </div>
            {route.pathText && <p className='mt-2 text-sm break-keep'>{route.pathText}</p>}
            {route.formula && <p className='mt-2 font-mono text-xs break-keep text-muted-foreground'>{route.formula}</p>}
        </div>
    ))
    const isMobile = useIsMobile()

    return (
        <article id={panelId} className={cn('flex flex-col gap-px', isPrintLayout && 'break-before-page')}>
            <header className='flex items-start gap-3 bg-card p-3'>
                <span className='font-mono text-2xl leading-none font-semibold tracking-tighter text-muted-foreground'>
                    {formatDayNumber(dayIndex)}
                </span>
                <div className='min-w-0'>
                    <h2 className='text-base leading-snug font-semibold tracking-tight break-keep'>{day.title}</h2>
                    {day.subtitle && <p className='mt-1 text-xs break-keep text-muted-foreground'>{day.subtitle}</p>}
                </div>
            </header>
            {!isPrintLayout && (
                <div className='flex flex-col gap-px bg-background sm:flex-row sm:items-stretch print:hidden'>
                    <div className='flex min-w-0 flex-1 items-center gap-2 bg-card px-3 py-2'>
                        <span aria-live='polite' className='font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums'>
                            {t('completedCount', { ratio: formatRatio(completedCount, day.scheduleItems.length) })}
                        </span>
                        <AnimatedProgress
                            className='max-w-45'
                            value={toPercent(completedCount, day.scheduleItems.length)}
                            label={t('dayProgressAria', { title: day.title })}
                        />
                    </div>
                    {isCheckable && (
                        <div className='flex gap-px bg-background'>
                            <Button type='button' variant='cell' size='cell' aria-pressed={isHideCompleted} onClick={onToggleHideCompleted}>
                                {isHideCompleted ? t('showCompleted') : t('hideCompleted')}
                            </Button>
                            <Button type='button' variant='cell' size='cell' onClick={onRequestReset}>
                                {t('resetChecks')}
                            </Button>
                        </div>
                    )}
                </div>
            )}
            {day.overview && <p className='bg-card p-3 text-sm leading-relaxed break-keep'>{day.overview}</p>}
            {day.facts.length > 0 && (
                <div className='break-inside-avoid bg-card'>
                    <Table className='text-xs'>
                        <TableHeader>
                            <TableRow>
                                <TableHead scope='col' className='h-auto w-40 bg-muted p-2 text-xs font-medium text-muted-foreground'>
                                    {t('itemLabel')}
                                </TableHead>
                                <TableHead scope='col' className='h-auto bg-muted p-2 text-xs font-medium text-muted-foreground'>
                                    {t('verifiedLabel')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {day.facts.map((fact) => (
                                <TableRow key={fact.id}>
                                    <TableCell className='p-2 align-top whitespace-normal text-muted-foreground'>{fact.label}</TableCell>
                                    <TableCell className='p-2 align-top whitespace-normal'>{fact.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {(day.planHeadline || day.planNote) && (
                <p className='bg-card p-3 text-sm leading-relaxed break-keep'>
                    {day.planHeadline && <strong className='font-medium'>{day.planHeadline}</strong>}
                    {day.planHeadline && day.planNote && ' '}
                    {day.planNote}
                </p>
            )}
            {day.routes.length > 0 &&
                (isPrintLayout ? (
                    <section className='flex flex-col gap-px bg-background'>
                        <h3 className='bg-card px-4 py-3 text-sm font-medium'>{t('travelTimeCalc')}</h3>
                        {routeBlocks}
                    </section>
                ) : (
                    <Accordion type='single' collapsible defaultValue={isMobile ? undefined : ROUTES_ACCORDION_VALUE} className='bg-card'>
                        <AccordionItem value={ROUTES_ACCORDION_VALUE} className='border-b-0'>
                            <AccordionTrigger className='px-4 py-3 text-sm font-medium hover:no-underline'>{t('travelTimeCalc')}</AccordionTrigger>
                            <AccordionContent className='p-0'>
                                <div className='flex flex-col gap-px bg-background'>{routeBlocks}</div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}
            {visibleItems.length > 0 && (
                <motion.ol className='flex flex-col gap-px' variants={TIMELINE_VARIANTS} initial='hidden' animate='visible'>
                    <AnimatePresence initial={false}>
                        {visibleItems.map((item) => (
                            <ScheduleRow
                                key={item.id}
                                item={item}
                                kind={kindById.get(item.kindId)}
                                isCompleted={checkedIds.has(item.id)}
                                isCheckable={isCheckable && !isPrintLayout}
                                onToggle={(checked) => onToggleItem?.(item.id, checked)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.ol>
            )}
            {day.scheduleItems.length === 0 && day.notes.length === 0 && (
                <Empty className='rounded-none bg-card p-6'>
                    <EmptyHeader>
                        <EmptyMedia variant='icon' className='rounded-none'>
                            <CalendarOffIcon aria-hidden />
                        </EmptyMedia>
                        <EmptyTitle className='text-sm'>{t('emptyDayTitle')}</EmptyTitle>
                        <EmptyDescription className='text-xs'>{t('emptyDayDescription')}</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            {(day.closingHeadline || day.closingNote) && (
                <p className='bg-card p-3 text-sm leading-relaxed break-keep'>
                    {day.closingHeadline && <strong className='font-medium'>{day.closingHeadline}</strong>}
                    {day.closingHeadline && day.closingNote && ' '}
                    {day.closingNote}
                </p>
            )}
            {day.notes.length > 0 && (
                <ul className='flex list-disc flex-col gap-2 bg-card p-3 pl-8 text-sm leading-relaxed'>
                    {day.notes.map((note) => (
                        <li key={note.id} className='break-keep'>
                            {note.leading}
                            {note.leading && note.linkUrl && ' '}
                            {note.linkUrl && note.linkLabel && (
                                <a className='underline' href={note.linkUrl} target='_blank' rel='noopener noreferrer'>
                                    {note.linkLabel}
                                </a>
                            )}
                            {note.trailing}
                        </li>
                    ))}
                </ul>
            )}
            {isCheckable && !isPrintLayout && (
                <div className='flex flex-col gap-1.5 bg-card p-3 print:hidden'>
                    <label htmlFor={memoId} className='text-sm font-medium'>
                        {t('dayMemo')}
                    </label>
                    <Textarea
                        id={memoId}
                        rows={MEMO_ROWS}
                        value={memo}
                        placeholder={t('dayMemoPlaceholder')}
                        className='min-h-19 rounded-none bg-background'
                        onChange={(event) => onMemoChange?.(event.target.value)}
                    />
                    <small aria-live='polite' className='text-2xs text-muted-foreground'>
                        {memoStateLabel}
                    </small>
                </div>
            )}
        </article>
    )
}
