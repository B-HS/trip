import { useTranslations } from 'next-intl'
import type { FC } from 'react'

type PublicFooterProps = {
    year: string
}

export const PublicFooter: FC<PublicFooterProps> = ({ year }) => {
    const t = useTranslations('common')

    return (
        <footer className='border-t border-border'>
            <div className='mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground'>
                <p className='font-medium text-foreground'>Trip</p>
                <p>{t('footer.tagline')}</p>
                <p>© {year} Hyunseok Byun</p>
            </div>
        </footer>
    )
}
