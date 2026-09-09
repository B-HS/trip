'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { FC, PropsWithChildren } from 'react'
import { getQueryClient } from '@/shared/lib/query-client'

export const QueryProvider: FC<PropsWithChildren> = ({ children }) => (
    <QueryClientProvider client={getQueryClient()}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
    </QueryClientProvider>
)
