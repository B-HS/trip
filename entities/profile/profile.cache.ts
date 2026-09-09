import 'server-only'
import { cache } from 'react'
import { findProfileByUsername } from '@/entities/profile/profile.repository'

export const getProfileByUsername = cache(findProfileByUsername)
