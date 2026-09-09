'use client'

import dayjs from 'dayjs'
import { PrinterIcon, TriangleAlertIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { type FC, useEffect, useRef, useState } from 'react'
import { useTripDetail } from '@/entities/trip/trip.query'
import type { PublicTrip, TripDayDetail } from '@/entities/trip/trip.type'
import {
    useResetDayChecks,
    useSaveDayMemo,
    useToggleBookingCheck,
    useToggleScheduleCheck,
    useTripUserState,
} from '@/entities/user-state/user-state.query'
import { BookingsPanel } from '@/features/trip-viewer/bookings-panel'
import { DayPanel } from '@/features/trip-viewer/day-panel'
import { DayPicker } from '@/features/trip-viewer/day-picker'
import { InfoPanel } from '@/features/trip-viewer/info-panel'
import { TripLegend } from '@/features/trip-viewer/legend'
import { TripFooter } from '@/features/trip-viewer/trip-footer'
import { TripSidebar } from '@/features/trip-viewer/trip-sidebar'
import { TripViewerSkeleton } from '@/features/trip-viewer/trip-viewer-skeleton'
import { TRIP_VIEW_PANEL_ID, ViewTabs } from '@/features/trip-viewer/view-tabs'
import type { TripView } from '@/shared/constant/trip'
import { FADE } from '@/shared/lib/motion'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/shared/ui/empty'
import { useMounted } from '@/widgets/trip-viewer/use-mounted'

const DEFAULT_VIEW: TripView = 'itinerary'
const FIRST_DAY_INDEX = 0
const FIRST_DAY_ORDINAL = 1
const MEMO_DEBOUNCE_MS = 500
const DAY_PANEL_ID = 'trip-day-panel'
const MEMO_IDLE_LABEL = '입력하면 자동 저장됩니다.'
const MEMO_SAVING_LABEL = '저장 중…'
const MEMO_SAVED_LABEL = '저장됨'
const PUBLIC_NOTICE = '공개 보기 · 편집·체크는 로그인한 멤버만 가능합니다.'

type MemoStatus = 'saving' | 'saved'

export type TripViewerMode = 'member' | 'public'

type TripViewerWidgetProps = {
    tripId?: string
    mode: TripViewerMode
    initialTrip?: PublicTrip
    initialView?: TripView
    initialDayOrdinal?: number
}

const resolveTodayDayIndex = (days: readonly TripDayDetail[]) => {
    const today = dayjs().format('YYYY-MM-DD')
    const index = days.findIndex((day) => day.date >= today)
    return index === -1 ? FIRST_DAY_INDEX : index
}

const resolveMemoLabel = (status: MemoStatus | undefined) => {
    if (status === 'saving') return MEMO_SAVING_LABEL
    if (status === 'saved') return MEMO_SAVED_LABEL
    return MEMO_IDLE_LABEL
}

export const TripViewerWidget: FC<TripViewerWidgetProps> = ({ tripId, mode, initialTrip, initialView, initialDayOrdinal }) => {
    const memoTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    const [selectedView, setSelectedView] = useState<TripView | null>(null)
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null)
    const [hiddenCompletedDayIds, setHiddenCompletedDayIds] = useState<string[]>([])
    const [resetTargetDayId, setResetTargetDayId] = useState<string | null>(null)
    const [memoDrafts, setMemoDrafts] = useState<Record<string, string>>({})
    const [memoStatuses, setMemoStatuses] = useState<Record<string, MemoStatus>>({})

    const isMounted = useMounted()
    const detailQuery = useTripDetail(tripId ?? '')
    const userStateQuery = useTripUserState(tripId ?? '')
    const toggleScheduleCheck = useToggleScheduleCheck(tripId ?? '')
    const toggleBookingCheck = useToggleBookingCheck(tripId ?? '')
    const resetDayChecks = useResetDayChecks(tripId ?? '')
    const saveDayMemo = useSaveDayMemo(tripId ?? '')

    const isMember = mode === 'member'
    const trip = isMember ? detailQuery.data : initialTrip
    const days = trip?.days ?? []
    const checkedScheduleIds = userStateQuery.data?.scheduleCheckedIds ?? []
    const checkedBookingIds = userStateQuery.data?.bookingCheckedIds ?? []
    const checkedScheduleSet = new Set(checkedScheduleIds)
    const scheduleItems = days.flatMap((day) => day.scheduleItems)
    const completedScheduleCount = scheduleItems.filter((item) => checkedScheduleSet.has(item.id)).length
    const dayOrdinal = initialDayOrdinal ?? Number.NaN
    const hasDayParam = Number.isInteger(dayOrdinal) && dayOrdinal >= FIRST_DAY_ORDINAL && dayOrdinal <= days.length
    const fallbackDayIndex = isMounted ? resolveTodayDayIndex(days) : FIRST_DAY_INDEX
    const activeView = selectedView ?? initialView ?? DEFAULT_VIEW
    const activeDayIndex = selectedDayIndex ?? (hasDayParam ? dayOrdinal - FIRST_DAY_ORDINAL : fallbackDayIndex)
    const activeDay = days.at(activeDayIndex) ?? null
    const resetTargetDay = days.find((day) => day.id === resetTargetDayId) ?? null

    const replaceParam = (key: string, value: string) => {
        if (!isMember) return
        const params = new URLSearchParams(window.location.search)
        params.set(key, value)
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
    }

    const handleSelectView = (view: TripView) => {
        setSelectedView(view)
        replaceParam('view', view)
    }

    const handleSelectDay = (dayIndex: number) => {
        setSelectedDayIndex(dayIndex)
        replaceParam('day', String(dayIndex + FIRST_DAY_ORDINAL))
    }

    const handleToggleHideCompleted = (dayId: string) =>
        setHiddenCompletedDayIds((previous) => (previous.includes(dayId) ? previous.filter((id) => id !== dayId) : [...previous, dayId]))

    const handleMemoChange = (dayId: string, content: string) => {
        setMemoDrafts((previous) => ({ ...previous, [dayId]: content }))
        setMemoStatuses((previous) => ({ ...previous, [dayId]: 'saving' }))
        clearTimeout(memoTimersRef.current[dayId])
        memoTimersRef.current[dayId] = setTimeout(
            () => saveDayMemo.mutate({ dayId, content }, { onSuccess: () => setMemoStatuses((previous) => ({ ...previous, [dayId]: 'saved' })) }),
            MEMO_DEBOUNCE_MS,
        )
    }

    const handleConfirmReset = () => {
        if (resetTargetDay) resetDayChecks.mutate({ dayId: resetTargetDay.id, scheduleItemIds: resetTargetDay.scheduleItems.map((item) => item.id) })
        setResetTargetDayId(null)
    }

    useEffect(() => {
        const timers = memoTimersRef.current
        return () => Object.values(timers).forEach((timer) => clearTimeout(timer))
    }, [])

    if (isMember && detailQuery.isPending) return <TripViewerSkeleton />
    if (!trip)
        return (
            <Empty className='rounded-none bg-card p-6'>
                <EmptyHeader>
                    <EmptyMedia variant='icon' className='rounded-none text-destructive'>
                        <TriangleAlertIcon aria-hidden />
                    </EmptyMedia>
                    <EmptyTitle className='text-sm'>여행을 불러오지 못했습니다</EmptyTitle>
                    <EmptyDescription className='text-xs'>요청이 실패했습니다. 잠시 후 다시 시도하세요.</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )

    const sidebar = (isPrintLayout: boolean) => (
        <TripSidebar
            destinations={trip.destinations}
            eyebrow={trip.eyebrow}
            title={trip.title}
            startDate={trip.startDate}
            endDate={trip.endDate}
            periodNote={trip.periodNote}
            completedCount={completedScheduleCount}
            totalCount={scheduleItems.length}
            flights={trip.flights}
            lodgings={trip.lodgings}
            disclaimer={trip.disclaimer}
            verifiedOn={trip.verifiedOn}
            isPrintLayout={isPrintLayout}
        />
    )

    return (
        <div className='flex w-full flex-1 flex-col gap-px bg-background'>
            <div className='grid flex-1 grid-cols-1 gap-px md:grid-cols-[16rem_minmax(0,1fr)] print:hidden'>
                <div className='bg-muted'>
                    <div className='md:sticky md:top-0'>{sidebar(false)}</div>
                </div>
                <div className='flex min-w-0 flex-col gap-px'>
                    <div className='flex items-stretch justify-between bg-background'>
                        <ViewTabs activeView={activeView} onSelect={handleSelectView} />
                        <Button
                            type='button'
                            variant='ghost'
                            className='h-12 rounded-none px-4 text-sm hover:bg-muted'
                            onClick={() => window.print()}>
                            <PrinterIcon aria-hidden />
                            전체 일정 인쇄
                        </Button>
                    </div>
                    {!isMember && <p className='bg-card p-3 text-xs text-muted-foreground'>{PUBLIC_NOTICE}</p>}
                    <div id={TRIP_VIEW_PANEL_ID} className='flex min-w-0 flex-1 flex-col gap-px'>
                        {activeView === 'itinerary' && days.length > 0 && (
                            <>
                                <DayPicker
                                    days={days.map((day) => ({
                                        id: day.id,
                                        date: day.date,
                                        shortLabel: day.shortLabel,
                                        completedCount: day.scheduleItems.filter((item) => checkedScheduleSet.has(item.id)).length,
                                        totalCount: day.scheduleItems.length,
                                    }))}
                                    activeDayIndex={activeDayIndex}
                                    panelId={DAY_PANEL_ID}
                                    onSelect={handleSelectDay}
                                />
                                <TripLegend />
                                {trip.bufferPolicy && (
                                    <p className='bg-muted px-3 py-2 text-xs break-keep text-muted-foreground'>{trip.bufferPolicy}</p>
                                )}
                            </>
                        )}
                        <AnimatePresence mode='wait' initial={false}>
                            <motion.div
                                key={activeView === 'itinerary' ? `itinerary-${activeDay?.id ?? 'empty'}` : activeView}
                                className='flex min-w-0 flex-col gap-px'
                                {...FADE}>
                                {activeView === 'itinerary' && activeDay && (
                                    <DayPanel
                                        key={activeDay.id}
                                        day={activeDay}
                                        dayIndex={activeDayIndex}
                                        panelId={DAY_PANEL_ID}
                                        checkedItemIds={checkedScheduleIds}
                                        isHideCompleted={hiddenCompletedDayIds.includes(activeDay.id)}
                                        isCheckable={isMember}
                                        memo={memoDrafts[activeDay.id] ?? userStateQuery.data?.memos[activeDay.id] ?? ''}
                                        memoStateLabel={resolveMemoLabel(memoStatuses[activeDay.id])}
                                        onToggleItem={(itemId, checked) => toggleScheduleCheck.mutate({ itemId, checked })}
                                        onToggleHideCompleted={() => handleToggleHideCompleted(activeDay.id)}
                                        onRequestReset={() => setResetTargetDayId(activeDay.id)}
                                        onMemoChange={(content) => handleMemoChange(activeDay.id, content)}
                                    />
                                )}
                                {activeView === 'itinerary' && !activeDay && (
                                    <p className='bg-card p-6 text-center text-sm text-muted-foreground'>등록된 날짜가 없습니다.</p>
                                )}
                                {activeView === 'bookings' && (
                                    <BookingsPanel
                                        bookings={trip.bookings}
                                        bookingNote={trip.bookingNote}
                                        checkedIds={checkedBookingIds}
                                        isCheckable={isMember}
                                        onToggle={(bookingId, checked) => toggleBookingCheck.mutate({ bookingId, checked })}
                                    />
                                )}
                                {activeView === 'info' && <InfoPanel sections={trip.infoSections} days={days} />}
                            </motion.div>
                        </AnimatePresence>
                        <div aria-hidden className='min-h-0 flex-1 bg-card' />
                    </div>
                    <TripFooter footerNote={trip.footerNote} />
                </div>
            </div>
            <div className='hidden flex-col gap-px print:flex'>
                {sidebar(true)}
                {days.map((day, dayIndex) => (
                    <DayPanel
                        key={day.id}
                        day={day}
                        dayIndex={dayIndex}
                        panelId={`${DAY_PANEL_ID}-print-${day.id}`}
                        checkedItemIds={checkedScheduleIds}
                        isHideCompleted={false}
                        isCheckable={false}
                        isPrintLayout
                    />
                ))}
                <BookingsPanel
                    bookings={trip.bookings}
                    bookingNote={trip.bookingNote}
                    checkedIds={checkedBookingIds}
                    isCheckable={false}
                    isPrintLayout
                />
                <InfoPanel sections={trip.infoSections} days={days} isPrintLayout />
                <TripFooter footerNote={trip.footerNote} />
            </div>
            <AlertDialog open={resetTargetDay !== null} onOpenChange={(open) => !open && setResetTargetDayId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>이 날짜의 완료 체크를 모두 초기화할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {`${resetTargetDay?.title ?? '선택한 날짜'}의 완료 표시가 모두 해제됩니다. 다른 날짜와 메모는 그대로 유지됩니다.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmReset}>초기화</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
