import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { CommentItem } = await import('@/features/community/comment-item')

const BASE_COMMENT = {
    id: 'comment-1',
    postId: 'post-1',
    parentId: null,
    body: '두 시간이면 충분합니다.',
    isAccepted: false,
    isDeleted: false,
    author: { id: 'user-2', name: '지연', username: 'jiyeon', image: null },
    createdAt: '2026-09-10T05:00:00.000Z',
    canManage: false,
    canAccept: false,
}

const noop = () => {}

afterEach(cleanup)

describe('CommentItem', () => {
    test('작성자와 본문을 보여준다', () => {
        render(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} />)

        expect(screen.getByRole('link', { name: '지연' }).getAttribute('href')).toBe('/u/jiyeon')
        expect(screen.getByText('두 시간이면 충분합니다.')).toBeDefined()
    })

    test('권한이 없으면 액션 셀을 보여주지 않는다', () => {
        render(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} />)

        expect(screen.queryByRole('button')).toBeNull()
    })

    test('관리 권한이 있을 때만 삭제 셀을 보여준다', () => {
        const { rerender } = render(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} />)
        expect(screen.queryByRole('button', { name: '삭제' })).toBeNull()

        rerender(<CommentItem comment={{ ...BASE_COMMENT, canManage: true }} onDelete={noop} onAccept={noop} />)
        expect(screen.getByRole('button', { name: '삭제' })).toBeDefined()
    })

    test('채택 가능할 때만 채택 셀을 보여준다', () => {
        const { rerender } = render(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} />)
        expect(screen.queryByRole('button', { name: '채택' })).toBeNull()

        rerender(<CommentItem comment={{ ...BASE_COMMENT, canAccept: true }} onDelete={noop} onAccept={noop} />)
        expect(screen.getByRole('button', { name: '채택' })).toBeDefined()
    })

    test('답글 핸들러를 받은 최상위 댓글만 답글 셀을 보여준다', () => {
        const { rerender } = render(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} />)
        expect(screen.queryByRole('button', { name: '답글' })).toBeNull()

        rerender(<CommentItem comment={BASE_COMMENT} onDelete={noop} onAccept={noop} onReply={noop} />)
        expect(screen.getByRole('button', { name: '답글' })).toBeDefined()
    })

    test('채택된 댓글에는 채택됨 배지를 보여준다', () => {
        render(<CommentItem comment={{ ...BASE_COMMENT, isAccepted: true }} onDelete={noop} onAccept={noop} />)

        expect(screen.getByText('채택됨')).toBeDefined()
    })

    test('삭제된 댓글은 자리 표시자를 보여주고 액션 셀을 숨긴다', () => {
        render(
            <CommentItem
                comment={{ ...BASE_COMMENT, isDeleted: true, body: null }}
                onDelete={noop}
                onAccept={noop}
                onReply={noop}
                onReport={noop}
                onBlock={noop}
            />,
        )

        expect(screen.getByText('삭제된 댓글')).toBeDefined()
        expect(screen.queryByRole('button')).toBeNull()
    })

    test('삭제와 채택 셀을 누르면 각 핸들러를 부른다', () => {
        const calls: string[] = []
        render(
            <CommentItem
                comment={{ ...BASE_COMMENT, canManage: true, canAccept: true }}
                onDelete={() => calls.push('delete')}
                onAccept={() => calls.push('accept')}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: '삭제' }))
        fireEvent.click(screen.getByRole('button', { name: '채택' }))

        expect(calls).toEqual(['delete', 'accept'])
    })
})
