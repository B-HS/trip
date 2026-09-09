'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { ko } from 'date-fns/locale'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { type FC, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import type { TripDayDetail } from '@/entities/trip/trip.type'
import { formatMonthDay, formatRatio } from '@/features/trip-viewer/trip-viewer-format'
import { cn } from '@/shared/lib/utils'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

export type DayPickerItem = Pick<TripDayDetail, 'id' | 'date' | 'shortLabel'> & {
    completedCount: number
    totalCount: number
}

type DayPickerProps = {
    days: readonly DayPickerItem[]
    activeDayIndex: number
    panelId: string
    onSelect: (dayIndex: number) => void
}

type ScrollState = {
    canScrollPrev: boolean
    canScrollNext: boolean
    thumbStart: number
    thumbSize: number
}

const DAY_CELL_WIDTH_CLASS = 'min-w-24'
const SCROLL_EPSILON = 1
const FULL_RATIO = 1
const IDLE_SCROLL_STATE: ScrollState = { canScrollPrev: false, canScrollNext: false, thumbStart: 0, thumbSize: FULL_RATIO }
const DATE_FORMAT = 'YYYY-MM-DD'

const readScrollState = (node: HTMLElement): ScrollState => {
    const maxScroll = node.scrollWidth - node.clientWidth
    if (maxScroll <= SCROLL_EPSILON) return IDLE_SCROLL_STATE
    return {
        canScrollPrev: node.scrollLeft > SCROLL_EPSILON,
        canScrollNext: node.scrollLeft < maxScroll - SCROLL_EPSILON,
        thumbStart: node.scrollLeft / node.scrollWidth,
        thumbSize: node.clientWidth / node.scrollWidth,
    }
}

export const DayPicker: FC<DayPickerProps> = ({ days, activeDayIndex, panelId, onSelect }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const activeButtonRef = useRef<HTMLButtonElement>(null)
    const [scrollState, setScrollState] = useState<ScrollState>(IDLE_SCROLL_STATE)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    const isOverflowing = scrollState.thumbSize < FULL_RATIO
    const activeDay = days.at(activeDayIndex)
    const dayIndexByDate = new Map(days.map((day, index) => [day.date, index]))
    const firstDate = days.at(0)?.date

    const scrollByPage = (direction: -1 | 1) => {
        const node = scrollRef.current
        if (!node) return
        node.scrollBy({ left: direction * node.clientWidth, behavior: 'smooth' })
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        const nextIndex = activeDayIndex + (event.key === 'ArrowRight' ? 1 : -1)
        if (nextIndex < 0 || nextIndex >= days.length) return
        onSelect(nextIndex)
    }

    const handleCalendarSelect = (date: Date | undefined) => {
        if (!date) return
        const index = dayIndexByDate.get(dayjs(date).format(DATE_FORMAT))
        if (index === undefined) return
        onSelect(index)
        setIsCalendarOpen(false)
    }

    useEffect(() => {
        const node = scrollRef.current
        if (!node) return
        const update = () => setScrollState(readScrollState(node))
        const observer = new ResizeObserver(update)
        observer.observe(node)
        node.addEventListener('scroll', update, { passive: true })
        return () => {
            observer.disconnect()
            node.removeEventListener('scroll', update)
        }
    }, [])

    useEffect(() => {
        activeButtonRef.current?.scrollIntoView({ block: 'nearest', inline: 'center' })
    }, [activeDayIndex])

    return (
        <nav className='flex flex-col bg-background' aria-label='여행 날짜' onKeyDown={handleKeyDown}>
            <div className='flex items-stretch gap-px'>
                {isOverflowing && (
                    <button
                        type='button'
                        aria-label='이전 날짜 보기'
                        disabled={!scrollState.canScrollPrev}
                        className='flex w-9 shrink-0 items-center justify-center bg-card text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-card'
                        onClick={() => scrollByPage(-1)}>
                        <ChevronLeftIcon aria-hidden className='size-4' />
                    </button>
                )}
                <div ref={scrollRef} className='flex min-w-0 flex-1 snap-x snap-proximity [scrollbar-width:none] gap-px overflow-x-auto'>
                    {days.map((day, dayIndex) => (
                        <button
                            key={day.id}
                            ref={dayIndex === activeDayIndex ? activeButtonRef : null}
                            type='button'
                            aria-pressed={dayIndex === activeDayIndex}
                            aria-controls={panelId}
                            onClick={() => onSelect(dayIndex)}
                            className={cn(
                                'flex min-h-16 flex-1 shrink-0 snap-start flex-col justify-center gap-0.5 rounded-none px-3 py-2 text-left outline-none',
                                DAY_CELL_WIDTH_CLASS,
                                'focus-visible:ring-3 focus-visible:ring-ring/50',
                                dayIndex === activeDayIndex ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted',
                            )}>
                            <strong className='block font-mono text-xs font-medium tabular-nums'>{formatMonthDay(day.date)}</strong>
                            <span className='block truncate text-xs'>{day.shortLabel}</span>
                            <small
                                className={cn(
                                    'block font-mono text-2xs tabular-nums',
                                    dayIndex === activeDayIndex ? 'text-primary-foreground' : 'text-muted-foreground',
                                )}>
                                {formatRatio(day.completedCount, day.totalCount)}
                            </small>
                        </button>
                    ))}
                </div>
                {isOverflowing && (
                    <button
                        type='button'
                        aria-label='다음 날짜 보기'
                        disabled={!scrollState.canScrollNext}
                        className='flex w-9 shrink-0 items-center justify-center bg-card text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:hover:bg-card'
                        onClick={() => scrollByPage(1)}>
                        <ChevronRightIcon aria-hidden className='size-4' />
                    </button>
                )}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type='button'
                            aria-label='달력에서 날짜 선택'
                            className='flex w-11 shrink-0 flex-col items-center justify-center gap-0.5 bg-card text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50'>
                            <CalendarDaysIcon aria-hidden className='size-4' />
                            <span className='font-mono text-2xs tabular-nums'>
                                {activeDayIndex + 1}/{days.length}
                            </span>
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='w-auto rounded-none p-0'>
                        <Calendar
                            mode='single'
                            locale={ko}
                            selected={activeDay ? dayjs(activeDay.date).toDate() : undefined}
                            defaultMonth={activeDay ? dayjs(activeDay.date).toDate() : firstDate ? dayjs(firstDate).toDate() : undefined}
                            disabled={(date) => !dayIndexByDate.has(dayjs(date).format(DATE_FORMAT))}
                            onSelect={handleCalendarSelect}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {isOverflowing && (
                <div aria-hidden className='relative h-0.5 bg-card'>
                    <div
                        className='absolute inset-y-0 bg-foreground/40 transition-[left,width] duration-(--motion-bar-duration) ease-(--motion-ease-standard)'
                        style={{ left: `${scrollState.thumbStart * 100}%`, width: `${scrollState.thumbSize * 100}%` }}
                    />
                </div>
            )}
        </nav>
    )
}
