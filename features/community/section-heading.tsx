import type { Route } from 'next'
import { Link } from '@/i18n/navigation'
import { MORE_LABEL } from '@/features/community/community.constant'
import { Button } from '@/shared/ui/button'

export type SectionHeadingProps<T extends string> = {
    title: string
    description?: string
    moreHref?: Route<T>
    moreLabel?: string
}

export const SectionHeading = <T extends string>({ title, description, moreHref, moreLabel = MORE_LABEL }: SectionHeadingProps<T>) => (
    <div className='flex gap-px bg-background'>
        <div className='flex min-w-0 flex-1 flex-col gap-1 bg-muted p-3'>
            <h2 className='text-sm font-medium'>{title}</h2>
            {description !== undefined && <p className='text-xs text-muted-foreground'>{description}</p>}
        </div>
        {moreHref !== undefined && (
            <Button variant='cell' size='cell' asChild>
                <Link href={moreHref}>{moreLabel}</Link>
            </Button>
        )}
    </div>
)
