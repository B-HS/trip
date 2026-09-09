import type { FC } from 'react'
import { SITE_DESCRIPTION, SITE_NAME } from '@/shared/constant/site'

type PublicFooterProps = {
    year: string
}

export const PublicFooter: FC<PublicFooterProps> = ({ year }) => (
    <footer className='border-t border-border'>
        <div className='mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground'>
            <p className='font-medium text-foreground'>{SITE_NAME}</p>
            <p>{SITE_DESCRIPTION}</p>
            <p>
                {year} {SITE_NAME}
            </p>
        </div>
    </footer>
)
