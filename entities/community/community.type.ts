import type { Trip, TripUser } from '@/entities/trip/trip.type'
import type { tripBoard, tripComment, tripPointLedger, tripPost, tripPostLike, tripReport, tripUserBlock } from '@/shared/db/schema/community'
import type { LikeState } from '@/shared/lib/like-mutation'

export type Board = typeof tripBoard.$inferSelect
export type Post = typeof tripPost.$inferSelect
export type Comment = typeof tripComment.$inferSelect
export type PostLike = typeof tripPostLike.$inferSelect
export type PointLedger = typeof tripPointLedger.$inferSelect
export type Report = typeof tripReport.$inferSelect
export type UserBlock = typeof tripUserBlock.$inferSelect

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

export type PostDetailView = Omit<PostDetail, 'body'>

export type CommentView = Pick<Comment, 'id' | 'postId' | 'parentId' | 'isAccepted'> & {
    author: PostAuthor
    body: string | null
    isDeleted: boolean
    createdAt: string
}

export type PostLikeState = LikeState

export type CommunityViewer = { id: string; role?: string | null }

export type TripAttachOption = Pick<Trip, 'id' | 'title' | 'isPublic'>

export type ReportView = Pick<Report, 'id' | 'kind' | 'targetId' | 'reason' | 'memo' | 'status'> & {
    reporter: PostAuthor
    targetLabel: string | null
    createdAt: string
}

export type ReportPage = {
    items: ReportView[]
    page: number
    pageSize: number
    total: number
    pageCount: number
}
