import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CommentForm } from '@/features/community/comment-form'

const PLACEHOLDER = '댓글을 입력해 주세요.'

const noop = () => {}

afterEach(cleanup)

describe('CommentForm', () => {
    test('입력이 비어 있으면 등록할 수 없다', () => {
        render(<CommentForm placeholder={PLACEHOLDER} isPending={false} onSubmit={noop} />)

        expect(screen.getByRole<HTMLButtonElement>('button', { name: '등록' }).disabled).toBe(true)
    })

    test('공백만 입력해도 등록할 수 없다', () => {
        const bodies: string[] = []
        render(<CommentForm placeholder={PLACEHOLDER} isPending={false} onSubmit={(body) => bodies.push(body)} />)

        fireEvent.change(screen.getByLabelText(PLACEHOLDER), { target: { value: '   ' } })
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '등록' }).disabled).toBe(true)

        fireEvent.submit(screen.getByLabelText(PLACEHOLDER).closest('form') as HTMLFormElement)
        expect(bodies).toEqual([])
    })

    test('내용을 입력하면 앞뒤 공백을 지우고 등록한다', () => {
        const bodies: string[] = []
        render(<CommentForm placeholder={PLACEHOLDER} isPending={false} onSubmit={(body) => bodies.push(body)} />)

        fireEvent.change(screen.getByLabelText(PLACEHOLDER), { target: { value: '  두 시간이면 충분합니다.  ' } })
        fireEvent.click(screen.getByRole('button', { name: '등록' }))

        expect(bodies).toEqual(['두 시간이면 충분합니다.'])
    })

    test('등록 중에는 버튼이 잠긴다', () => {
        render(<CommentForm placeholder={PLACEHOLDER} isPending onSubmit={noop} />)

        fireEvent.change(screen.getByLabelText(PLACEHOLDER), { target: { value: '내용' } })
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '등록 중…' }).disabled).toBe(true)
    })

    test('취소 핸들러가 있을 때만 취소 셀을 보여준다', () => {
        const { rerender } = render(<CommentForm placeholder={PLACEHOLDER} isPending={false} onSubmit={noop} />)
        expect(screen.queryByRole('button', { name: '취소' })).toBeNull()

        rerender(<CommentForm placeholder={PLACEHOLDER} isPending={false} onSubmit={noop} onCancel={noop} />)
        expect(screen.getByRole('button', { name: '취소' })).toBeDefined()
    })
})
