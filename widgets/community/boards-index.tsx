import { findBoards, findLatestPostsByBoard } from '@/entities/community/community.repository'
import { PostList } from '@/features/community/post-list'
import { SectionHeading } from '@/features/community/section-heading'
import { EMPTY_POST_LABEL } from '@/shared/constant/community'

const BOARD_PREVIEW_LIMIT = 5
const BOARD_MORE_LABEL = '게시판 열기'

export type BoardsIndexProps = {
    viewerId?: string | null
}

export const BoardsIndex = async ({ viewerId = null }: BoardsIndexProps) => {
    const boards = await findBoards()
    const previews = await Promise.all(
        boards.map(async (board) => ({ board, posts: await findLatestPostsByBoard(board.key, BOARD_PREVIEW_LIMIT, viewerId) })),
    )

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-muted p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>BOARDS</p>
                <h1 className='text-2xl font-semibold tracking-tight'>게시판</h1>
                <p className='text-xs text-muted-foreground'>자유·질문·후기 게시판의 최근 글을 모아 봅니다.</p>
            </section>
            {previews.map(({ board, posts }) => (
                <section key={board.id} className='flex flex-col gap-px'>
                    <SectionHeading
                        title={board.name}
                        description={board.description ?? undefined}
                        moreHref={`/boards/${board.key}`}
                        moreLabel={BOARD_MORE_LABEL}
                    />
                    <PostList posts={posts} emptyLabel={EMPTY_POST_LABEL} />
                </section>
            ))}
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
