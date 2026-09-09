import { arrayMove } from '@dnd-kit/sortable'

export type ReorderMove = { from: number; to: number }

const NOT_FOUND_INDEX = -1

export const resolveReorder = (keys: string[], activeKey: string, overKey: string) => {
    const from = keys.indexOf(activeKey)
    const to = keys.indexOf(overKey)
    if (from === NOT_FOUND_INDEX || to === NOT_FOUND_INDEX || from === to) return null
    return { from, to } satisfies ReorderMove
}

export const reorderItems = <TItem>(items: TItem[], move: ReorderMove) => arrayMove(items, move.from, move.to)
