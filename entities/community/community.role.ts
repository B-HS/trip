import { isAdminRole } from '@/entities/auth/auth.role'
import type { CommunityViewer } from '@/entities/community/community.type'
import { QNA_BOARD_KIND, type BoardKind } from '@/shared/constant/community'

const isOwnerOrAdmin = (viewer: CommunityViewer | null, authorId: string) => viewer !== null && (viewer.id === authorId || isAdminRole(viewer.role))

export const canEditPost = (viewer: CommunityViewer | null, authorId: string) => viewer !== null && viewer.id === authorId

export const canManagePost = (viewer: CommunityViewer | null, authorId: string) => isOwnerOrAdmin(viewer, authorId)

export const canManageComment = (viewer: CommunityViewer | null, authorId: string) => isOwnerOrAdmin(viewer, authorId)

export const canAcceptComment = (
    viewer: CommunityViewer | null,
    post: { authorId: string; boardKind: BoardKind },
    comment: { authorId: string; parentId: string | null; isAccepted: boolean },
) =>
    viewer !== null &&
    post.boardKind === QNA_BOARD_KIND &&
    viewer.id === post.authorId &&
    comment.parentId === null &&
    comment.authorId !== post.authorId &&
    !comment.isAccepted
