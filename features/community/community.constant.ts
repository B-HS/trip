import type { ReportReason } from '@/shared/constant/community'

export const POST_DATE_FORMAT = 'YYYY.MM.DD HH:mm'

export const VIEW_COUNT_LABEL = '조회'
export const LIKE_COUNT_LABEL = '좋아요'
export const COMMENT_COUNT_LABEL = '댓글'
export const ACCEPTED_LABEL = '채택됨'
export const DELETED_COMMENT_LABEL = '삭제된 댓글'
export const REPORT_LABEL = '신고'
export const REPORTING_LABEL = '신고 중…'
export const REPORT_CANCEL_LABEL = '취소'
export const REPORT_TITLE = '신고를 접수할까요?'
export const REPORT_DESCRIPTION = '신고 내용은 관리자 검토에 사용됩니다.'
export const BLOCK_LABEL = '차단'
export const UNBLOCK_LABEL = '차단 해제'

export const REPORT_REASON_LABEL = {
    spam: '스팸',
    harassment: '괴롭힘',
    obscenity: '음란',
    defamation: '명예훼손',
    illegal: '불법',
    privacy: '사생활 침해',
    other: '기타',
} as const satisfies Record<ReportReason, string>

export const PREV_PAGE_LABEL = '이전'
export const NEXT_PAGE_LABEL = '다음'
export const PAGINATION_LABEL = '페이지 이동'
export const MORE_LABEL = '더 보기'

export const SEARCH_INPUT_LABEL = '검색어'
export const SEARCH_SUBMIT_LABEL = '검색'
export const SEARCH_PLACEHOLDER = '제목으로 검색'

export const EMPTY_SEARCH_POST_LABEL = '검색 결과가 없습니다.'
