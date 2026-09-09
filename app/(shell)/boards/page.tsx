import type { Metadata } from 'next'
import { BoardsIndex } from '@/widgets/community/boards-index'

export const metadata: Metadata = {
    title: '게시판',
}

const BoardsPage = () => <BoardsIndex />

export default BoardsPage
