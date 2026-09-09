'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon, Trash2Icon } from 'lucide-react'
import { motion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { MOTION_EASE_STANDARD, MOTION_FADE_DURATION } from '@/shared/lib/motion'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const ROW_NUMBER_PAD = 2
const ROW_NUMBER_OFFSET = 1

type SortableRowProps = PropsWithChildren<{
    id: string
    index: number
    removeLabel: string
    onRemove?: () => void
    isActive?: boolean
    className?: string
}>

export const SortableRow: FC<SortableRowProps> = ({ id, index, removeLabel, onRemove, isActive = false, className, children }) => {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <motion.div
            ref={setNodeRef}
            className={cn('flex items-start gap-2 bg-card p-3', isActive && 'bg-accent', isDragging && 'relative z-20 opacity-80', className)}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION_FADE_DURATION, ease: MOTION_EASE_STANDARD }}>
            <div className='flex shrink-0 items-center gap-1'>
                <Button
                    ref={setActivatorNodeRef}
                    className='size-6 cursor-grab text-muted-foreground'
                    type='button'
                    variant='ghost'
                    size='icon-xs'
                    aria-label='순서 변경'
                    {...attributes}
                    {...listeners}>
                    <GripVerticalIcon />
                </Button>
                <span className='font-mono text-xs text-muted-foreground tabular-nums'>
                    {String(index + ROW_NUMBER_OFFSET).padStart(ROW_NUMBER_PAD, '0')}
                </span>
            </div>
            <div className='min-w-0 flex-1'>{children}</div>
            {onRemove && (
                <Button className='size-6 shrink-0' type='button' variant='ghost' size='icon-xs' aria-label={removeLabel} onClick={onRemove}>
                    <Trash2Icon />
                </Button>
            )}
        </motion.div>
    )
}
