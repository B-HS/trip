import 'server-only'
import { cache } from 'react'
import { findBoardByKey, findPostDetail } from '@/entities/community/community.repository'
import { findBlockedIdsForUser } from '@/entities/community/community.repository.block'

export const getBoardByKey = cache(findBoardByKey)

export const getPostDetail = cache(findPostDetail)

export const getBlockedIds = cache(findBlockedIdsForUser)
