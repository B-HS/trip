import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { CSSProperties, PropsWithChildren, Ref } from 'react'
import type { ScheduleKindInput, ScheduleKindsSaveValues } from '@/entities/trip/trip.validate'
import { TooltipProvider } from '@/shared/ui/tooltip'

type MotionStubProps = PropsWithChildren<{ className?: string; style?: CSSProperties; ref?: Ref<HTMLDivElement> }>

const MotionDiv = ({ className, style, ref, children }: MotionStubProps) => (
    <div ref={ref} className={className} style={style}>
        {children}
    </div>
)

mock.module('motion/react', () => ({
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: PropsWithChildren) => children,
}))

const { KindsForm } = await import('@/features/trip-editor/kinds-form')

const PLANNED_ID = '3f1a2b6c-4d5e-4f70-8a9b-0c1d2e3f4a5b'
const CONFIRMED_ID = '8c7d6e5f-4a3b-4c2d-9e8f-1a2b3c4d5e6f'
const USED_COUNT = 4
const ROW_ANIMATION_SETTLE_MS = 300

const DEFAULT_VALUES: ScheduleKindInput[] = [
    { id: PLANNED_ID, key: 'planned', label: '계획', legendLabel: '계획 일정', colorToken: 'muted', bufferLabel: '마지막 10분 여유' },
    { id: CONFIRMED_ID, key: 'confirmed', label: '확정 시각', legendLabel: '항공편·공식 셔틀', colorToken: 'success', bufferLabel: null },
]

const settleRows = () => new Promise((resolve) => setTimeout(resolve, ROW_ANIMATION_SETTLE_MS))

const renderForm = (onSubmit: (values: ScheduleKindsSaveValues) => Promise<boolean>, usageByKindId: Record<string, number> = {}) =>
    render(
        <TooltipProvider>
            <KindsForm defaultValues={DEFAULT_VALUES} usageByKindId={usageByKindId} onSubmit={onSubmit} isPending={false} />
        </TooltipProvider>,
    )

afterEach(cleanup)

describe('KindsForm', () => {
    test('기존 종류를 행으로 보여 준다', () => {
        renderForm(async () => true)

        expect(screen.getAllByLabelText('이름')).toHaveLength(DEFAULT_VALUES.length)
        expect(screen.getAllByLabelText('범례 라벨')).toHaveLength(DEFAULT_VALUES.length)
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '저장' }).disabled).toBe(true)
    })

    test('종류를 추가해 이름과 범례 라벨을 함께 제출한다', async () => {
        const onSubmit = mock<(values: ScheduleKindsSaveValues) => Promise<boolean>>(async () => true)
        renderForm(onSubmit)
        fireEvent.click(screen.getByRole('button', { name: '종류 추가' }))
        const labels = screen.getAllByLabelText('이름')
        const legends = screen.getAllByLabelText('범례 라벨')
        fireEvent.change(labels[labels.length - 1]!, { target: { value: '예비' } })
        fireEvent.change(legends[legends.length - 1]!, { target: { value: '예비 일정' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        const values = onSubmit.mock.calls[0]![0]
        expect(values.kinds).toHaveLength(DEFAULT_VALUES.length + 1)
        expect(values.kinds[2]?.label).toBe('예비')
        expect(values.kinds[2]?.legendLabel).toBe('예비 일정')
        expect(values.kinds[2]?.colorToken).toBe('muted')
        expect(values.kinds[2]?.id).toBeUndefined()
        expect(values.replacements).toEqual({})
        await settleRows()
    })

    test('쓰는 일정이 있는 종류를 삭제하면 대체 종류를 함께 제출한다', async () => {
        const onSubmit = mock<(values: ScheduleKindsSaveValues) => Promise<boolean>>(async () => true)
        renderForm(onSubmit, { [PLANNED_ID]: USED_COUNT })
        fireEvent.click(screen.getAllByRole('button', { name: '종류 삭제' })[0]!)

        await waitFor(() =>
            expect(screen.getByText(`이 종류를 쓰는 일정이 ${USED_COUNT}건 있습니다. 대신할 종류를 고르면 저장할 때 함께 바꿉니다.`)).toBeDefined(),
        )
        fireEvent.click(screen.getByRole('button', { name: '삭제' }))

        await waitFor(() => expect(screen.getAllByLabelText('이름')).toHaveLength(1))
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        const values = onSubmit.mock.calls[0]![0]
        expect(values.kinds.map((kind) => kind.id)).toEqual([CONFIRMED_ID])
        expect(values.replacements).toEqual({ [PLANNED_ID]: CONFIRMED_ID })
        await settleRows()
    })

    test('마지막 한 가지만 남으면 삭제 버튼을 감춘다', async () => {
        renderForm(async () => true, {})
        fireEvent.click(screen.getAllByRole('button', { name: '종류 삭제' })[0]!)
        fireEvent.click(screen.getByRole('button', { name: '삭제' }))

        await waitFor(() => expect(screen.queryByRole('button', { name: '종류 삭제' })).toBeNull())
        await settleRows()
    })
})
