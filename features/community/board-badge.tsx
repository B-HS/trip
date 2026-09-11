import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { BoardKind } from '@/shared/constant/community'
import { Badge } from '@/shared/ui/badge'

export type BoardBadgeProps = {
    kind: BoardKind
}

export const BoardBadge: FC<BoardBadgeProps> = ({ kind }) => {
    const t = useTranslations('community.boardKind')

    return <Badge variant='outline'>{t(kind)}</Badge>
}
