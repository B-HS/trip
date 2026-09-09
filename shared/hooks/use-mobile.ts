'use client'

import { useSyncExternalStore } from 'react'

export const MOBILE_BREAKPOINT = 768

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribeToViewport = (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
    mediaQuery.addEventListener('change', onStoreChange)
    return () => mediaQuery.removeEventListener('change', onStoreChange)
}

const getIsMobileSnapshot = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches

const getIsMobileServerSnapshot = () => false

export const useIsMobile = () => useSyncExternalStore(subscribeToViewport, getIsMobileSnapshot, getIsMobileServerSnapshot)
