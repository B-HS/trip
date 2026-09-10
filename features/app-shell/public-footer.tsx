import type { FC } from 'react'

type PublicFooterProps = {
    year: string
}

export const PublicFooter: FC<PublicFooterProps> = ({ year }) => (
    <footer className='border-t border-border'>
        <div className='mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground'>
            <p className='font-medium text-foreground'>Trip</p>
            <p>Trip manager with structured data forms</p>
            <p>
                © {year} Hyunseok Byun
            </p>
        </div>
    </footer>
)