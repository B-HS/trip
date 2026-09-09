'use client'

import { useSyncExternalStore } from 'react'

const NOOP_UNSUBSCRIBE = () => {}

const subscribeToMount = () => NOOP_UNSUBSCRIBE

const getMountedSnapshot = () => true

const getServerSnapshot = () => false

export const useMounted = () => useSyncExternalStore(subscribeToMount, getMountedSnapshot, getServerSnapshot)
