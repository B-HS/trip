import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { Board, PostPage } from '@/entities/community/community.type'

import { PaginationCells } from '@/features/community/pagination-cells'
import { PostList } from '@/features/community/post-list'
import { SearchForm } from '@/features/community/search-form'
import { PAGE_PARAM, SEARCH_QUERY_PARAM } from '@/shared/constant/community'
import { LOGIN_PATH } from '@/shared/constant/route'
import { Button } from '@/shared/ui/button'

export type BoardListProps = {
    board: Board
    posts: PostPage
    query: string
    isSignedIn: boolean
}

export const BoardList: FC<BoardListProps> = ({ board, posts, query, isSignedIn }) => {
    const t = useTranslations('community.board')
    const tKinds = useTranslations('community.boardKind')
    const tEmpty = useTranslations('community.empty')

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>{tKinds(board.kind)}</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{board.name}</h1>
                {board.description !== null && <p className='text-xs text-muted-foreground'>{board.description}</p>}
                <p className='font-mono text-2xs text-muted-foreground tabular-nums'>{t('total', { count: posts.total })}</p>
            </section>
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                {isSignedIn ? (
                    <Button variant='cellPrimary' size='cell' asChild>
                        <Link href={`/boards/${board.key}/new`}>{t('write')}</Link>
                    </Button>
                ) : (
                    <Button variant='cell' size='cell' asChild>
                        <Link href={`${LOGIN_PATH}?next=/boards/${board.key}/new`}>{t('writeSignedOut')}</Link>
                    </Button>
                )}
                <div className='flex min-w-0 flex-1 flex-col'>
                    <SearchForm action={`/boards/${board.key}`} defaultQuery={query} />
                </div>
            </div>
            <PostList posts={posts.items} emptyLabel={query.length > 0 ? tEmpty('search') : tEmpty('post')} />
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
}
