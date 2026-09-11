import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { Board, PostPage } from '@/entities/community/community.type'
import { EMPTY_SEARCH_POST_LABEL } from '@/features/community/community.constant'
import { PaginationCells } from '@/features/community/pagination-cells'
import { PostList } from '@/features/community/post-list'
import { SearchForm } from '@/features/community/search-form'
import { BOARD_KIND_LABEL, EMPTY_POST_LABEL, PAGE_PARAM, SEARCH_QUERY_PARAM } from '@/shared/constant/community'
import { LOGIN_PATH } from '@/shared/constant/route'
import { Button } from '@/shared/ui/button'

const WRITE_LABEL = '글쓰기'
const SIGNED_OUT_WRITE_LABEL = '로그인 후 글쓰기'

export type BoardListProps = {
    board: Board
    posts: PostPage
    query: string
    isSignedIn: boolean
}

export const BoardList: FC<BoardListProps> = ({ board, posts, query, isSignedIn }) => (
    <div className='flex flex-1 flex-col gap-px'>
        <section className='flex flex-col gap-1 bg-card p-3'>
            <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>{BOARD_KIND_LABEL[board.kind]}</p>
            <h1 className='text-2xl font-semibold tracking-tight'>{board.name}</h1>
            {board.description !== null && <p className='text-xs text-muted-foreground'>{board.description}</p>}
            <p className='font-mono text-2xs text-muted-foreground tabular-nums'>전체 {posts.total}건</p>
        </section>
        <div className='flex flex-wrap items-stretch gap-px bg-background'>
            {isSignedIn ? (
                <Button variant='cellPrimary' size='cell' asChild>
                    <Link href={`/boards/${board.key}/new`}>{WRITE_LABEL}</Link>
                </Button>
            ) : (
                <Button variant='cell' size='cell' asChild>
                    <Link href={`${LOGIN_PATH}?next=/boards/${board.key}/new`}>{SIGNED_OUT_WRITE_LABEL}</Link>
                </Button>
            )}
            <div className='flex min-w-0 flex-1 flex-col'>
                <SearchForm action={`/boards/${board.key}`} defaultQuery={query} />
            </div>
        </div>
        <PostList posts={posts.items} emptyLabel={query.length > 0 ? EMPTY_SEARCH_POST_LABEL : EMPTY_POST_LABEL} />
        <PaginationCells
            page={posts.page}
            pageCount={posts.pageCount}
            buildHref={(nextPage) =>
                query.length > 0 ? `?${SEARCH_QUERY_PARAM}=${encodeURIComponent(query)}&${PAGE_PARAM}=${nextPage}` : `?${PAGE_PARAM}=${nextPage}`
            }
        />
        <div aria-hidden className='min-h-0 flex-1 bg-card' />
    </div>
)
