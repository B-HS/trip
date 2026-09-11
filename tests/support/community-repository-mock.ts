import { mock } from 'bun:test'
import type { PostListItem } from '@/entities/community/community.type'

export const MOCK_POST: PostListItem = {
    id: 'post-1',
    title: '오사카 3박 4일 후기',
    excerpt: '간사이 공항에서 난바까지 이동한 기록입니다.',
    tripId: null,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    boardKey: 'free',
    boardKind: 'free',
    author: { id: 'user-1', name: '현석', username: 'hyunseok', image: null },
    hasAcceptedComment: false,
    createdAt: '2026-09-09T00:00:00.000Z',
}

export const MOCK_BOARD = {
    id: 'board-1',
    key: 'free',
    name: '자유게시판',
    kind: 'free',
    description: '여행 이야기를 자유롭게 나누는 공간입니다.',
    sortOrder: 0,
}

export const MOCK_POST_PAGE = { items: [MOCK_POST], page: 1, pageSize: 20, total: 1, pageCount: 1 }

export const MOCK_EMPTY_HOME_TRIPS = { thisWeek: [], thisMonth: [], recent: [], popular: [] }

export const MOCK_EMPTY_TRIP_PAGE = { items: [], page: 1, pageSize: 20, total: 0, pageCount: 1 }

export const BOARD_CELL_LINKS = [
    { name: '자유게시판', href: '/boards/free' },
    { name: '질문게시판', href: '/boards/qna' },
    { name: '여행 후기', href: '/boards/review' },
]

mock.module('@/entities/community/community.repository', () => ({
    findLatestPosts: async () => [MOCK_POST],
    findBoards: async () => [MOCK_BOARD],
    findLatestPostsByBoard: async () => [],
    findPostsByAuthor: async () => MOCK_POST_PAGE,
    findPostPage: async () => MOCK_POST_PAGE,
    findPostDetail: async () => null,
    findBoardByKey: async () => MOCK_BOARD,
    findBoardKeyByPostId: async () => MOCK_BOARD.key,
    incrementPostView: async () => {},
    createPost: async () => ({ id: 'post-1' }),
    updatePost: async () => ({ id: 'post-1' }),
    deletePost: async () => ({ id: 'post-1' }),
    restorePost: async () => ({ id: 'post-1' }),
    findAttachTripOptions: async () => [],
}))

mock.module('@/entities/trip/trip.repository.explore', () => ({
    findPublicTripsForHome: async () => MOCK_EMPTY_HOME_TRIPS,
    findRecentPublicTrips: async () => [],
    findPublicTripPage: async () => MOCK_EMPTY_TRIP_PAGE,
}))
