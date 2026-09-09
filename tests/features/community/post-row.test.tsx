import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import dayjs from 'dayjs'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PostListItem } from '@/entities/community/community.type'
import { POST_DATE_FORMAT } from '@/features/community/community.constant'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { PostRow } = await import('@/features/community/post-row')

const BASE_POST: PostListItem = {
    id: 'post-1',
    boardKey: 'qna',
    boardKind: 'qna',
    title: '간사이 공항 환승 시간',
    excerpt: '환승에 몇 시간이 필요할까요?',
    author: { id: 'user-1', name: '현석', username: 'hyunseok', image: null },
    tripId: null,
    viewCount: 12,
    likeCount: 3,
    commentCount: 5,
    hasAcceptedComment: false,
    createdAt: '2026-09-10T04:05:00.000Z',
}

afterEach(cleanup)

describe('PostRow', () => {
    test('제목 링크가 게시판 글 상세를 가리킨다', () => {
        render(<PostRow post={BASE_POST} />)

        expect(screen.getByRole('link', { name: '간사이 공항 환승 시간' }).getAttribute('href')).toBe('/boards/qna/post-1')
    })

    test('요약과 조회·좋아요·댓글 수를 표시한다', () => {
        render(<PostRow post={BASE_POST} />)

        expect(screen.getByText('환승에 몇 시간이 필요할까요?')).toBeDefined()
        expect(screen.getByText('조회 12 · 좋아요 3 · 댓글 5')).toBeDefined()
    })

    test('작성자 이름과 작성 시각을 표시한다', () => {
        render(<PostRow post={BASE_POST} />)

        expect(screen.getByRole('link', { name: '현석' }).getAttribute('href')).toBe('/u/hyunseok')
        expect(screen.getByText(dayjs(BASE_POST.createdAt).format(POST_DATE_FORMAT))).toBeDefined()
    })

    test('질문 글에 채택된 댓글이 있으면 채택됨 배지를 보여준다', () => {
        render(<PostRow post={{ ...BASE_POST, hasAcceptedComment: true }} />)

        expect(screen.getByText('채택됨')).toBeDefined()
    })

    test('질문 글이 아니면 채택된 댓글이 있어도 배지를 보여주지 않는다', () => {
        render(<PostRow post={{ ...BASE_POST, boardKey: 'free', boardKind: 'free', hasAcceptedComment: true }} />)

        expect(screen.queryByText('채택됨')).toBeNull()
    })

    test('showBoard 일 때만 게시판 배지를 보여준다', () => {
        const { rerender } = render(<PostRow post={BASE_POST} />)
        expect(screen.queryByText('질문')).toBeNull()

        rerender(<PostRow post={BASE_POST} showBoard />)
        expect(screen.getByText('질문')).toBeDefined()
    })
})
