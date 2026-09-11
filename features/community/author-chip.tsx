import dayjs from 'dayjs'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PostAuthor } from '@/entities/community/community.type'
import { POST_DATE_FORMAT } from '@/features/community/community.constant'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'

export type AuthorChipProps = {
    author: PostAuthor
    createdAt?: string
}

export const AuthorChip: FC<AuthorChipProps> = ({ author, createdAt }) => (
    <span className='flex min-w-0 items-center gap-1.5'>
        <Avatar size='sm'>
            {author.image !== null && <AvatarImage src={author.image} alt='' />}
            <AvatarFallback>{author.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        {author.username === null ? (
            <span className='truncate'>{author.name}</span>
        ) : (
            <Link className='truncate hover:underline' href={`/u/${author.username}`}>
                {author.name}
            </Link>
        )}
        {createdAt !== undefined && (
            <time className='shrink-0 font-mono tabular-nums' dateTime={createdAt}>
                {dayjs(createdAt).format(POST_DATE_FORMAT)}
            </time>
        )}
    </span>
)
