import type { FC } from 'react'
import { BOARD_KIND_LABEL, type BoardKind } from '@/shared/constant/community'
import { Badge } from '@/shared/ui/badge'

export type BoardBadgeProps = {
    kind: BoardKind
}

export const BoardBadge: FC<BoardBadgeProps> = ({ kind }) => <Badge variant='outline'>{BOARD_KIND_LABEL[kind]}</Badge>
