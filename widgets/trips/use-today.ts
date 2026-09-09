'use client'

import dayjs from 'dayjs'
import { useSyncExternalStore } from 'react'

const DATE_FORMAT = 'YYYY-MM-DD'

const subscribeToToday = () => () => {}

const getTodaySnapshot = () => dayjs().format(DATE_FORMAT)

const getServerTodaySnapshot = () => null

export const useToday = () => useSyncExternalStore<string | null>(subscribeToToday, getTodaySnapshot, getServerTodaySnapshot)
