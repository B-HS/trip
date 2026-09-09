import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PostDetailView } from '@/entities/community/community.type'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { PostHeader } = await import('@/features/community/post-header')

const CREATED_AT = '2026-09-10T04:05:00.000Z'

const BASE_POST: PostDetailView = {
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
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    board: { key: 'qna', name: '질문게시판', kind: 'qna' },
    trip: null,
}

const PUBLIC_TRIP: PostDetailView['trip'] = { id: 'trip-1', title: '오사카 여행 노트', shareSlug: 'osaka-2026', isPublic: true }
const PRIVATE_TRIP: PostDetailView['trip'] = { id: 'trip-2', title: '비공개 여행 노트', shareSlug: null, isPublic: false }

afterEach(cleanup)

describe('PostHeader', () => {
    test('제목과 조회·좋아요·댓글 수를 보여준다', () => {
        render(<PostHeader post={BASE_POST} likeCount={9} commentCount={5} />)

        expect(screen.getByRole('heading', { name: '간사이 공항 환승 시간' })).toBeDefined()
        expect(screen.getByText('조회 12 · 좋아요 9 · 댓글 5')).toBeDefined()
    })

    test('수정 시각이 작성 시각과 같으면 수정됨을 보여주지 않는다', () => {
        render(<PostHeader post={BASE_POST} likeCount={3} commentCount={5} />)

        expect(screen.queryByText('수정됨')).toBeNull()
    })

    test('수정 시각이 다르면 수정됨을 보여준다', () => {
        render(<PostHeader post={{ ...BASE_POST, updatedAt: '2026-09-11T04:05:00.000Z' }} likeCount={3} commentCount={5} />)

        expect(screen.getByText('수정됨')).toBeDefined()
    })

    test('연결된 트립이 없으면 트립 셀이 없다', () => {
        render(<PostHeader post={BASE_POST} likeCount={3} commentCount={5} />)

        expect(screen.queryByText('오사카 여행 노트')).toBeNull()
    })

    test('공개 트립이 연결되면 공개 주소로 이동하는 링크를 보여준다', () => {
        render(<PostHeader post={{ ...BASE_POST, trip: PUBLIC_TRIP }} likeCount={3} commentCount={5} />)

        expect(screen.getByRole('link', { name: '연결된 트립 오사카 여행 노트' }).getAttribute('href')).toBe('/s/osaka-2026')
    })

    test('비공개 트립이 연결되면 제목만 보여준다', () => {
        render(<PostHeader post={{ ...BASE_POST, trip: PRIVATE_TRIP }} likeCount={3} commentCount={5} />)

        expect(screen.getByText('비공개 여행 노트')).toBeDefined()
        expect(screen.queryByRole('link', { name: /비공개 여행 노트/ })).toBeNull()
    })
})
