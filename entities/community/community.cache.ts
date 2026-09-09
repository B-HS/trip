import 'server-only'
import { cache } from 'react'
import { findBoardByKey, findPostDetail } from '@/entities/community/community.repository'

export const getBoardByKey = cache(findBoardByKey)

export const getPostDetail = cache(findPostDetail)
