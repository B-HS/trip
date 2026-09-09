'use client'

import dayjs from 'dayjs'
import { ExternalLinkIcon, TriangleAlertIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, type FC } from 'react'
import { useTripDetail } from '@/entities/trip/trip.query'
import { TripEditorSkeleton } from '@/features/trip-editor/trip-editor-skeleton'
import { FADE } from '@/shared/lib/motion'
import { Button } from '@/shared/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { BasicsTab } from '@/widgets/trip-editor/basics-tab'
import { BookingsTab } from '@/widgets/trip-editor/bookings-tab'
import { DaysTab } from '@/widgets/trip-editor/days-tab'
import { InfoTab } from '@/widgets/trip-editor/info-tab'
import { KindsTab } from '@/widgets/trip-editor/kinds-tab'
import { ShareTab } from '@/widgets/trip-editor/share-tab'
import { SidebarTab } from '@/widgets/trip-editor/sidebar-tab'
import { TravelTab } from '@/widgets/trip-editor/travel-tab'
import {
    EDITOR_EXPORT_TAB_LABEL,
    EDITOR_TAB_LABEL,
    EDITOR_TAB_PARAM,
    EDITOR_TABS,
    resolveEditorTab,
    type EditorTab,
} from '@/widgets/trip-editor/trip-editor.constant'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const SAVED_TIME_FORMAT = 'HH:mm:ss'

const TAB_COMPONENT = {
    basics: BasicsTab,
    sidebar: SidebarTab,
    travel: TravelTab,
    kinds: KindsTab,
    days: DaysTab,
    bookings: BookingsTab,
    info: InfoTab,
    share: ShareTab,
} as const satisfies Record<EditorTab, FC<TripEditorTabProps>>

type TripEditorWidgetProps = {
    tripId: string
}

export const TripEditorWidget: FC<TripEditorWidgetProps> = ({ tripId }) => {
    const [savedAt, setSavedAt] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: detail, isLoading, isError } = useTripDetail(tripId)

    const activeTab = resolveEditorTab(searchParams.get(EDITOR_TAB_PARAM))
    const ActiveTab = TAB_COMPONENT[activeTab]

    if (isLoading || detail === undefined) {
        if (isError)
            return (
                <div className='flex flex-col items-center justify-center gap-6 bg-card p-3 text-center'>
                    <TriangleAlertIcon className='size-6 text-destructive' aria-hidden />
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm font-medium'>여행을 불러오지 못했습니다.</p>
                        <p className='text-xs text-muted-foreground'>요청이 실패했습니다. 잠시 후 다시 시도하세요.</p>
                    </div>
                </div>
            )
        return <TripEditorSkeleton />
    }

    const isOwner = detail.viewerRole === 'owner'
    const tabCount = {
        basics: undefined,
        sidebar: detail.sidebarLinks.length,
        travel: detail.flights.length + detail.lodgings.length,
        kinds: detail.scheduleKinds.length,
        days: detail.days.length,
        bookings: detail.bookings.length,
        info: detail.infoSections.length,
        share: undefined,
    } as const satisfies Record<EditorTab, number | undefined>

    return (
        <Tabs
            className='flex-1 gap-px bg-background'
            value={activeTab}
            onValueChange={(value) => router.replace(`/trips/${tripId}/edit?${EDITOR_TAB_PARAM}=${value}`, { scroll: false })}>
            <div className='flex flex-wrap items-stretch justify-between gap-px bg-background'>
                <div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 bg-card p-3'>
                    <h1 className='truncate text-sm font-semibold tracking-tight'>{detail.title}</h1>
                    <p className='text-xs text-muted-foreground'>{savedAt === null ? '탭마다 따로 저장합니다.' : `최근 저장 ${savedAt}`}</p>
                </div>
                <Button variant='cell' size='cell' asChild>
                    <Link href={`/trips/${tripId}`}>
                        <ExternalLinkIcon />
                        보기
                    </Link>
                </Button>
            </div>
            <TabsList className='flex h-12 w-full items-stretch justify-start gap-0 rounded-none bg-background p-0'>
                {EDITOR_TABS.map((tab) => (
                    <TabsTrigger
                        key={tab}
                        className='h-full flex-none rounded-none border-0 px-4 py-0 text-sm shadow-none after:hidden data-active:bg-card data-active:shadow-none dark:data-active:border-0 dark:data-active:bg-card'
                        value={tab}>
                        {tab === 'share' && !isOwner ? EDITOR_EXPORT_TAB_LABEL : EDITOR_TAB_LABEL[tab]}
                        {tabCount[tab] !== undefined && <span className='font-mono text-muted-foreground tabular-nums'>{tabCount[tab]}</span>}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value={activeTab}>
                <AnimatePresence mode='wait' initial={false}>
                    <motion.div key={activeTab} {...FADE}>
                        <ActiveTab tripId={tripId} detail={detail} onSaved={() => setSavedAt(dayjs().format(SAVED_TIME_FORMAT))} />
                    </motion.div>
                </AnimatePresence>
            </TabsContent>
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </Tabs>
    )
}
