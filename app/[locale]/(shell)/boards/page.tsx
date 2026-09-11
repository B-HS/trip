import type { Metadata } from 'next'
import { getServerSession } from '@/shared/lib/session'
import { BoardsIndex } from '@/widgets/community/boards-index'

export const metadata: Metadata = {
    title: '게시판',
}

const BoardsPage = async () => {
    const session = await getServerSession()

    return (
        <div className='mx-auto max-w-7xl'>
            <BoardsIndex viewerId={session?.user.id ?? null} />
        </div>
    )
}

export default BoardsPage
