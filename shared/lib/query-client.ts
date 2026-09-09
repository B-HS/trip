import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query'
import { QUERY_GC_TIME, QUERY_RETRY_COUNT, QUERY_STALE_TIME } from '@/shared/constant/query'

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: { staleTime: QUERY_STALE_TIME, gcTime: QUERY_GC_TIME, retry: QUERY_RETRY_COUNT },
            dehydrate: { shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending' },
        },
    })

let browserQueryClient: QueryClient | null = null

export const getQueryClient = () => {
    if (isServer) return createQueryClient()
    if (!browserQueryClient) browserQueryClient = createQueryClient()
    return browserQueryClient
}
