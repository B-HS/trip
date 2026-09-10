'use client'

import { useSyncExternalStore } from 'react'

export const FINE_POINTER_MEDIA_QUERY = '(pointer: fine)'

const subscribeToPointer = (onStoreChange: () => void) => {
    const mediaQuery = window.matchMedia(FINE_POINTER_MEDIA_QUERY)
    mediaQuery.addEventListener('change', onStoreChange)
    return () => mediaQuery.removeEventListener('change', onStoreChange)
}

const getIsFinePointerSnapshot = () => window.matchMedia(FINE_POINTER_MEDIA_QUERY).matches

const getIsFinePointerServerSnapshot = () => false

export const useFinePointer = () => useSyncExternalStore(subscribeToPointer, getIsFinePointerSnapshot, getIsFinePointerServerSnapshot)
