import type { CommentView, PostLikeState, ReportPage } from '@/entities/community/community.type'
import { PAGE_PARAM } from '@/shared/constant/community'
import { clientFetch } from '@/shared/lib/fetch'

const POSTS_PATH = '/api/posts'
const ADMIN_REPORTS_PATH = '/api/admin/reports'

export const fetchComments = (postId: string) => clientFetch<CommentView[]>(`${POSTS_PATH}/${postId}/comments`)

export const fetchPostLike = (postId: string) => clientFetch<PostLikeState>(`${POSTS_PATH}/${postId}/like`)

export const fetchOpenReports = (page: number) => clientFetch<ReportPage>(`${ADMIN_REPORTS_PATH}?${PAGE_PARAM}=${page}`)
