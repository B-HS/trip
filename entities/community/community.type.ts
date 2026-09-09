import type { Trip, TripUser } from '@/entities/trip/trip.type'
import type { tripBoard, tripComment, tripPointLedger, tripPost, tripPostLike } from '@/shared/db/schema/community'

export type Board = typeof tripBoard.$inferSelect
export type Post = typeof tripPost.$inferSelect
export type Comment = typeof tripComment.$inferSelect
export type PostLike = typeof tripPostLike.$inferSelect
export type PointLedger = typeof tripPointLedger.$inferSelect

export type PostAuthor = Pick<TripUser, 'id' | 'name' | 'username' | 'image'>

export type PostListItem = Pick<Post, 'id' | 'title' | 'excerpt' | 'tripId' | 'viewCount' | 'likeCount' | 'commentCount'> & {
    boardKey: Board['key']
    boardKind: Board['kind']
    author: PostAuthor
    hasAcceptedComment: boolean
    createdAt: string
}

export type PostPage = {
    items: PostListItem[]
    page: number
    pageSize: number
    total: number
    pageCount: number
}

export type PostTripLink = Pick<Trip, 'id' | 'title' | 'shareSlug' | 'isPublic'>

export type PostDetail = PostListItem &
    Pick<Post, 'body'> & {
        updatedAt: string
        board: Pick<Board, 'key' | 'name' | 'kind'>
        trip: PostTripLink | null
    }

export type CommentView = Pick<Comment, 'id' | 'postId' | 'parentId' | 'body' | 'isAccepted'> & {
    author: PostAuthor
    createdAt: string
}

export type PostLikeState = { count: number; liked: boolean }

export type CommunityViewer = { id: string; role?: string | null }
