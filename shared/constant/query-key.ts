export const QUERY_KEY = {
    TRIP: {
        ALL: ['trip'],
        LIST: ['trip', 'list'],
        FAVORITES: ['trip', 'favorites'],
        DETAIL: (tripId: string) => ['trip', 'detail', tripId],
        MEMBERS: (tripId: string) => ['trip', 'members', tripId],
        SHARE: (slug: string) => ['trip', 'share', slug],
        LIKE: (tripId: string) => ['trip', 'like', tripId],
    },
    USER_STATE: {
        ALL: ['user-state'],
        TRIP: (tripId: string) => ['user-state', 'trip', tripId],
    },
    COMMUNITY: {
        ALL: ['community'],
        COMMENTS: (postId: string) => ['community', 'comments', postId],
        POST_LIKE: (postId: string) => ['community', 'post-like', postId],
    },
    REPORT: {
        ALL: ['report'],
        LIST: (page: number) => ['report', 'list', page],
    },
} as const
