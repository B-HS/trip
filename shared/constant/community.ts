export const BOARD_KINDS = ['free', 'qna', 'review'] as const
export type BoardKind = (typeof BOARD_KINDS)[number]

export const QNA_BOARD_KIND: BoardKind = 'qna'

export const BOARD_KEY_MAX_LENGTH = 40
export const BOARD_NAME_MAX_LENGTH = 40
export const BOARD_DESCRIPTION_MAX_LENGTH = 200
export const BOARD_KEY_PATTERN = /^[a-z0-9-]+$/

export type BoardDefinition = {
    id: string
    key: string
    name: string
    kind: BoardKind
    description: string
    sortOrder: number
}

export const DEFAULT_BOARDS = [
    {
        id: 'fe7837bb-0f4e-4eb7-9c17-8b0c99ca9520',
        key: 'free',
        name: '자유게시판',
        kind: 'free',
        description: '여행 이야기를 자유롭게 나누는 공간입니다.',
        sortOrder: 0,
    },
    {
        id: '927f0e2b-cc33-4e77-b5c2-a2e5b1420e0f',
        key: 'qna',
        name: '질문게시판',
        kind: 'qna',
        description: '여행 준비 중 궁금한 점을 물어보세요.',
        sortOrder: 1,
    },
    {
        id: '3f624b16-c592-4a5e-a9f0-904cd610a53f',
        key: 'review',
        name: '여행 후기',
        kind: 'review',
        description: '다녀온 여행의 후기를 남겨 주세요.',
        sortOrder: 2,
    },
] as const satisfies readonly BoardDefinition[]

export const POINT_ANSWER = 2
export const POINT_ACCEPTED = 10

export const POINT_REASONS = ['answer', 'accepted', 'revoked'] as const
export type PointReason = (typeof POINT_REASONS)[number]

export const REPORT_KINDS = ['post', 'comment', 'user'] as const
export type ReportKind = (typeof REPORT_KINDS)[number]

export const REPORT_REASONS = ['spam', 'harassment', 'obscenity', 'defamation', 'illegal', 'privacy', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export const REPORT_STATUSES = ['open', 'hidden', 'dismissed', 'banned'] as const
export type ReportStatus = (typeof REPORT_STATUSES)[number]

export const REPORT_TARGET_ID_MAX_LENGTH = 36
export const REPORT_MEMO_MAX_LENGTH = 500

export const PAGE_SIZE = 20

export const POST_TITLE_MAX_LENGTH = 120
export const POST_EXCERPT_MAX_LENGTH = 300
export const COMMENT_BODY_MAX_LENGTH = 2000
export const SEARCH_QUERY_MAX_LENGTH = 80

export const PROFILE_NAME_MIN_LENGTH = 2
export const PROFILE_NAME_MAX_LENGTH = 40
export const PROFILE_BIO_MAX_LENGTH = 300
export const PROFILE_BANNER_URL_MAX_LENGTH = 500

export const EXPLORE_SORTS = ['recent', 'popular'] as const
export type ExploreSort = (typeof EXPLORE_SORTS)[number]

export const HOME_TRIP_LIMIT = 6
export const HOME_POST_LIMIT = 8
export const HOME_REVIEW_LIMIT = 4

export const INTRO_TRIP_LIMIT = 6
export const INTRO_POST_LIMIT = 6

export const TRIP_DATE_FORMAT = 'YYYY.MM.DD'

export const SEARCH_QUERY_PARAM = 'q'
export const PAGE_PARAM = 'page'
export const SORT_PARAM = 'sort'
export const PROFILE_TAB_PARAM = 'tab'
