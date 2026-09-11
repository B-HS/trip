import { HeartIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Route } from 'next'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import { Button } from '@/shared/ui/button'

export type LikeCellProps = {
    count: number
    isLiked: boolean
    isPending: boolean
    loginHref: Route | null
    onToggle: () => void
}

export const LikeCell: FC<LikeCellProps> = ({ count, isLiked, isPending, loginHref, onToggle }) => {
    const t = useTranslations('community.counts')
    const label = (
        <>
            <HeartIcon aria-hidden />
            <span className='sr-only'>{t('like')}</span>
            <span className='font-mono tabular-nums'>{count}</span>
        </>
    )

    if (loginHref !== null)
        return (
            <Button variant='cell' size='cell' asChild>
                <Link href={loginHref}>{label}</Link>
            </Button>
        )

    return (
        <Button type='button' variant='cell' size='cell' aria-pressed={isLiked} disabled={isPending} onClick={onToggle}>
            {label}
        </Button>
    )
}
