import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { DEFAULT_BOARDS } from '@/shared/constant/community'
import { BOARDS_PATH } from '@/shared/constant/route'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const BOARD_CELLS_LABEL = '게시판 바로가기'

export type BoardCellsProps = {
    className?: string
}

export const BoardCells: FC<BoardCellsProps> = ({ className }) => (
    <nav className={cn('flex flex-wrap items-stretch gap-px bg-background', className)} aria-label={BOARD_CELLS_LABEL}>
        {DEFAULT_BOARDS.map((board) => (
            <Button key={board.id} variant='cell' size='cell' asChild>
                <Link href={`${BOARDS_PATH}/${board.key}`}>{board.name}</Link>
            </Button>
        ))}
        <div aria-hidden className='min-w-0 flex-1 bg-card' />
    </nav>
)
