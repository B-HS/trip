import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { PostAuthor } from '@/entities/community/community.type'
import { AuthorChip } from '@/features/community/author-chip'

import { BLOCKED_EMPTY_LABEL, BLOCKED_SECTION_DESCRIPTION, BLOCKED_SECTION_TITLE } from '@/features/profile/profile.constant'
import { Button } from '@/shared/ui/button'

export type BlockedUsersSectionProps = {
    users: PostAuthor[]
    isPending: boolean
    onUnblock: (userId: string) => void
}

export const BlockedUsersSection: FC<BlockedUsersSectionProps> = ({ users, isPending, onUnblock }) => {
    const t = useTranslations('community.moderation')

    return (
        <section className='flex flex-col gap-px'>
            <div className='flex min-w-0 flex-1 flex-col gap-1 bg-muted p-3'>
                <h2 className='text-sm font-medium'>{BLOCKED_SECTION_TITLE}</h2>
                <p className='text-xs text-muted-foreground'>{BLOCKED_SECTION_DESCRIPTION}</p>
            </div>
            {users.length === 0 ? (
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <p className='flex min-h-10 min-w-0 flex-1 items-center bg-card px-4 text-xs text-muted-foreground'>{BLOCKED_EMPTY_LABEL}</p>
                </div>
            ) : (
                <ul className='flex flex-col gap-px bg-background'>
                    {users.map((user) => (
                        <li key={user.id} className='flex flex-wrap items-stretch gap-px'>
                            <div className='flex min-h-10 min-w-0 flex-1 items-center bg-card px-4'>
                                <AuthorChip author={user} />
                            </div>
                            <Button type='button' variant='cell' size='cell' disabled={isPending} onClick={() => onUnblock(user.id)}>
                                {t('unblock')}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
