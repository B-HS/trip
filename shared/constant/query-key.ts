export const QUERY_KEY = {
    TRIP: {
        ALL: ['trip'],
        LIST: ['trip', 'list'],
        DETAIL: (tripId: string) => ['trip', 'detail', tripId],
        MEMBERS: (tripId: string) => ['trip', 'members', tripId],
        SHARE: (slug: string) => ['trip', 'share', slug],
    },
    USER_STATE: {
        ALL: ['user-state'],
        TRIP: (tripId: string) => ['user-state', 'trip', tripId],
    },
} as const
