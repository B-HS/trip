'use client'

import { useSyncExternalStore } from 'react'

export const MOTION_PREFERENCE_STORAGE_KEY = 'trip-motion'
export const MOTION_PREFERENCES = ['full', 'reduced'] as const
export type MotionPreference = (typeof MOTION_PREFERENCES)[number]

const DEFAULT_MOTION_PREFERENCE: MotionPreference = 'full'
const MOTION_PREFERENCE_EVENT = 'trip-motion-preference-change'

const isMotionPreference = (value: string | null): value is MotionPreference =>
    value !== null && MOTION_PREFERENCES.some((preference) => preference === value)

const readMotionPreference = () => {
    try {
        const stored = window.localStorage.getItem(MOTION_PREFERENCE_STORAGE_KEY)
        return isMotionPreference(stored) ? stored : DEFAULT_MOTION_PREFERENCE
    } catch {
        return DEFAULT_MOTION_PREFERENCE
    }
}

const subscribeToMotionPreference = (onStoreChange: () => void) => {
    window.addEventListener('storage', onStoreChange)
    window.addEventListener(MOTION_PREFERENCE_EVENT, onStoreChange)
    return () => {
        window.removeEventListener('storage', onStoreChange)
        window.removeEventListener(MOTION_PREFERENCE_EVENT, onStoreChange)
    }
}

export const setMotionPreference = (preference: MotionPreference) => {
    try {
        window.localStorage.setItem(MOTION_PREFERENCE_STORAGE_KEY, preference)
    } catch {
        return
    }
    window.dispatchEvent(new Event(MOTION_PREFERENCE_EVENT))
}

export const useMotionPreference = () => useSyncExternalStore(subscribeToMotionPreference, readMotionPreference, () => DEFAULT_MOTION_PREFERENCE)

export const useReducedMotionPreference = () => useMotionPreference() === 'reduced'
