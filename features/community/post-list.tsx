import type { FC } from 'react'
import type { PostListItem } from '@/entities/community/community.type'
import { PostRow } from '@/features/community/post-row'
import { cn } from '@/shared/lib/utils'

export type PostListProps = {
    posts: PostListItem[]
    showBoard?: boolean
    emptyLabel: string
    className?: string
}

export const PostList: FC<PostListProps> = ({ posts, showBoard, emptyLabel, className }) => {
    if (posts.length === 0) return <p className='bg-card p-6 text-center text-xs text-muted-foreground'>{emptyLabel}</p>

    return (
        <ul className={cn('flex flex-col gap-px bg-background', className)}>
            {posts.map((post) => (
                <li key={post.id}>
                    <PostRow post={post} showBoard={showBoard} />
                </li>
            ))}
        </ul>
    )
}
