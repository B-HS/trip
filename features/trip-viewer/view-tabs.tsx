'use client'

import { motion } from 'motion/react'
import type { FC } from 'react'
import { TRIP_VIEWS, TRIP_VIEW_LABEL, type TripView } from '@/shared/constant/trip'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'

export const TRIP_VIEW_PANEL_ID = 'trip-view-panel'

const VIEW_INDICATOR_LAYOUT_ID = 'trip-viewer-view-indicator'

type ViewTabsProps = {
    activeView: TripView
    onSelect: (view: TripView) => void
}

export const ViewTabs: FC<ViewTabsProps> = ({ activeView, onSelect }) => (
    <nav className='flex flex-wrap gap-1' aria-label='보기 선택'>
        {TRIP_VIEWS.map((view) => (
            <button
                key={view}
                type='button'
                aria-pressed={view === activeView}
                aria-controls={TRIP_VIEW_PANEL_ID}
                onClick={() => onSelect(view)}
                className={cn(
                    'relative isolate h-9 rounded-none px-3 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    view === activeView ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}>
                {view === activeView && (
                    <motion.span
                        aria-hidden
                        layoutId={VIEW_INDICATOR_LAYOUT_ID}
                        className='absolute inset-0 -z-10 bg-sidebar-accent'
                        transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}
                    />
                )}
                {TRIP_VIEW_LABEL[view]}
            </button>
        ))}
    </nav>
)
