import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

const MIN_LIKE_COUNT = 0
const LIKE_STEP = 1

export type LikeState = { count: number; liked: boolean }

type LikeToggleContext = { previous: LikeState | undefined }

type LikeToggleOptions = {
    queryClient: QueryClient
    queryKey: QueryKey
    mutationFn: (liked: boolean) => Promise<LikeState>
    formatError?: (error: Error) => string
}

export const likeToggleMutationOptions = ({ queryClient, queryKey, mutationFn, formatError }: LikeToggleOptions) => ({
    mutationFn,
    onMutate: async (liked: boolean) => {
        await queryClient.cancelQueries({ queryKey })
        const previous = queryClient.getQueryData<LikeState>(queryKey)
        if (previous) {
            const step = liked ? LIKE_STEP : -LIKE_STEP
            const count = previous.liked === liked ? previous.count : Math.max(previous.count + step, MIN_LIKE_COUNT)
            queryClient.setQueryData<LikeState>(queryKey, { count, liked })
        }
        return { previous } satisfies LikeToggleContext
    },
    onError: (error: Error, _liked: boolean, context: LikeToggleContext | undefined) => {
        if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
        toast.error(formatError?.(error) ?? error.message)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
})
