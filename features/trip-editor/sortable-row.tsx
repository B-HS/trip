'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, Trash2Icon } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const ROW_NUMBER_PAD = 2
const ROW_NUMBER_OFFSET = 1

type SortableRowProps = PropsWithChildren<{
    id: string
    index: number
    removeLabel?: string
    onRemove?: () => void
    isActive?: boolean
    className?: string
}>

export const SortableRow: FC<SortableRowProps> = ({ id, index, removeLabel, onRemove, isActive = false, className, children }) => {
    const t = useTranslations('tripEditor')
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <motion.div
            ref={setNodeRef}
            className={cn('flex items-stretch gap-px bg-background', isDragging && 'relative z-20 opacity-80', className)}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}>
            <div className={cn('flex min-w-0 flex-1 items-start gap-2 bg-card p-3', isActive && 'bg-accent')}>
                <div className='-my-1 flex h-6 shrink-0 items-center gap-1'>
                    <Button
                        ref={setActivatorNodeRef}
                        className='size-6 cursor-grab text-muted-foreground'
                        type='button'
                        variant='ghost'
                        size='icon-xs'
                        aria-label={t('drag')}
                        {...attributes}
                        {...listeners}>
                        <GripVerticalIcon />
                    </Button>
                    <span className='font-mono text-xs leading-none text-muted-foreground tabular-nums'>
                        {String(index + ROW_NUMBER_OFFSET).padStart(ROW_NUMBER_PAD, '0')}
                    </span>
                </div>
                <div className='min-w-0 flex-1'>{children}</div>
            </div>
            {onRemove !== undefined && removeLabel !== undefined && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            className={cn('text-muted-foreground', isActive && 'bg-accent hover:bg-accent')}
                            type='button'
                            variant='cell'
                            size='cellIcon'
                            aria-label={removeLabel}
                            onClick={onRemove}>
                            <Trash2Icon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{removeLabel}</TooltipContent>
                </Tooltip>
            )}
        </motion.div>
    )
}
