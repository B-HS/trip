import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { reorderItems, resolveReorder } from '@/features/trip-editor/reorder'
import { SortableRow } from '@/features/trip-editor/sortable-row'
import { SortableRows } from '@/features/trip-editor/sortable-rows'
import { TooltipProvider } from '@/shared/ui/tooltip'

const ROWS = [
    { id: 'row-a', label: '첫 행' },
    { id: 'row-b', label: '둘째 행' },
    { id: 'row-c', label: '셋째 행' },
]

const ROW_IDS = ROWS.map((row) => row.id)

afterEach(cleanup)

const renderRows = (onRemove: (id: string) => void) =>
    render(
        <TooltipProvider>
            <SortableRows ids={ROW_IDS} onReorder={() => undefined}>
                {ROWS.map((row, index) => (
                    <SortableRow key={row.id} id={row.id} index={index} removeLabel={`${row.label} 삭제`} onRemove={() => onRemove(row.id)}>
                        <span>{row.label}</span>
                    </SortableRow>
                ))}
            </SortableRows>
        </TooltipProvider>,
    )

describe('resolveReorder', () => {
    test('키 위치로 이동 정보를 만든다', () => {
        expect(resolveReorder(ROW_IDS, 'row-c', 'row-a')).toEqual({ from: 2, to: 0 })
    })

    test('같은 키거나 목록에 없는 키면 null 을 돌려준다', () => {
        expect(resolveReorder(ROW_IDS, 'row-a', 'row-a')).toBeNull()
        expect(resolveReorder(ROW_IDS, 'row-a', 'row-z')).toBeNull()
    })
})

describe('reorderItems', () => {
    test('원본을 바꾸지 않고 이동한 순서를 돌려준다', () => {
        const moved = reorderItems(ROW_IDS, { from: 0, to: 2 })
        expect(moved).toEqual(['row-b', 'row-c', 'row-a'])
        expect(ROW_IDS).toEqual(['row-a', 'row-b', 'row-c'])
    })
})

describe('SortableRows', () => {
    test('행 번호와 내용을 순서대로 렌더링한다', () => {
        renderRows(() => undefined)
        expect(screen.getByText('01')).toBeDefined()
        expect(screen.getByText('03')).toBeDefined()
        expect(screen.getByText('둘째 행')).toBeDefined()
    })

    test('삭제 버튼이 해당 행의 콜백을 호출한다', () => {
        const onRemove = mock((id: string) => id)
        renderRows(onRemove)
        fireEvent.click(screen.getByLabelText('둘째 행 삭제'))
        expect(onRemove).toHaveBeenCalledTimes(1)
        expect(onRemove.mock.calls[0]![0]).toBe('row-b')
    })
})
