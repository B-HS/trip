'use client'

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useId, type FC, type PropsWithChildren } from 'react'
import { resolveReorder } from '@/features/trip-editor/reorder'
import { cn } from '@/shared/lib/utils'

const POINTER_ACTIVATION_DISTANCE = 4

type SortableRowsProps = PropsWithChildren<{
    ids: string[]
    onReorder: (from: number, to: number) => void
    className?: string
}>

export const SortableRows: FC<SortableRowsProps> = ({ ids, onReorder, className, children }) => {
    const dndContextId = useId()
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: POINTER_ACTIVATION_DISTANCE } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const overId = event.over?.id
        if (overId === undefined) return
        const move = resolveReorder(ids, String(event.active.id), String(overId))
        if (move === null) return
        onReorder(move.from, move.to)
    }

    return (
        <DndContext id={dndContextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div className={cn('flex flex-col gap-px bg-background', className)}>{children}</div>
            </SortableContext>
        </DndContext>
    )
}
