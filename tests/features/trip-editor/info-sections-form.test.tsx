import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { CSSProperties, PropsWithChildren, Ref } from 'react'
import type { InfoSectionInput } from '@/entities/trip/trip.validate'
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

const { InfoSectionsForm } = await import('@/features/trip-editor/info-sections-form')

const BLOCK_COUNT_AFTER_ADD = 2
const BLOCK_COUNT_AFTER_REMOVE = 1

const DEFAULT_VALUES = [
    { title: '준비물', isDefaultOpen: false, blocks: [{ kind: 'paragraph', emphasis: null, text: null, linkLabel: null, linkUrl: null }] },
] satisfies InfoSectionInput[]

afterEach(cleanup)

const renderForm = () =>
    render(
        <TooltipProvider>
            <InfoSectionsForm defaultValues={DEFAULT_VALUES} onSubmit={async () => true} isPending={false} />
        </TooltipProvider>,
    )

describe('InfoSectionsForm', () => {
    test('섹션 삭제는 라벨이 보이는 셀, 블록 삭제는 아이콘 셀로 나눈다', () => {
        renderForm()
        expect(screen.getByLabelText('섹션 제목')).toBeDefined()
        expect(screen.getByRole('switch')).toBeDefined()
        expect(screen.getByRole('button', { name: '섹션 삭제' }).textContent).toBe('섹션 삭제')
        expect(screen.getByRole('button', { name: '블록 삭제' }).textContent).toBe('')
    })

    test('블록을 더하고 지운다', async () => {
        renderForm()
        fireEvent.click(screen.getByRole('button', { name: '블록 추가' }))

        await waitFor(() => expect(screen.getAllByRole('button', { name: '블록 삭제' })).toHaveLength(BLOCK_COUNT_AFTER_ADD))
        fireEvent.click(screen.getAllByRole('button', { name: '블록 삭제' })[0]!)

        await waitFor(() => expect(screen.getAllByRole('button', { name: '블록 삭제' })).toHaveLength(BLOCK_COUNT_AFTER_REMOVE))
    })

    test('섹션을 지우면 빈 안내를 보여 준다', async () => {
        renderForm()
        fireEvent.click(screen.getByRole('button', { name: '섹션 삭제' }))

        await waitFor(() => expect(screen.getByText('등록된 정보 섹션이 없습니다.')).toBeDefined())
    })
})
