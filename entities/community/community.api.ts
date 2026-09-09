import type { CommentView, PostLikeState } from '@/entities/community/community.type'
import { clientFetch } from '@/shared/lib/fetch'

const POSTS_PATH = '/api/posts'

export const fetchComments = (postId: string) => clientFetch<CommentView[]>(`${POSTS_PATH}/${postId}/comments`)

export const fetchPostLike = (postId: string) => clientFetch<PostLikeState>(`${POSTS_PATH}/${postId}/like`)
