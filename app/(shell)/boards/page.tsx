import type { Metadata } from 'next'
import { BoardsIndex } from '@/widgets/community/boards-index'

export const metadata: Metadata = {
    title: '게시판',
}

const BoardsPage = () => {
    return <div className='max-w-7xl mx-auto'>
        <BoardsIndex />
    </div>

}


export default BoardsPage
