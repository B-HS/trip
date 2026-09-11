import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { DEFAULT_BOARDS } from '@/shared/constant/community'
import { BOARDS_PATH } from '@/shared/constant/route'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type BoardCellsProps = {
    className?: string
}

export const BoardCells: FC<BoardCellsProps> = ({ className }) => {
    const t = useTranslations('community.boardCells')
    const tBoards = useTranslations('community.boards')

    return (
        <nav className={cn('flex flex-wrap items-stretch gap-px bg-background', className)} aria-label={t('aria')}>
            {DEFAULT_BOARDS.map((board) => (
                <Button key={board.id} variant='cell' size='cell' asChild>
                    <Link href={`${BOARDS_PATH}/${board.key}`}>{tBoards(`${board.key}.name`)}</Link>
                </Button>
            ))}
            <div aria-hidden className='min-w-0 flex-1 bg-card' />
        </nav>
    )
}
