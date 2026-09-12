import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { Link } from '@/i18n/navigation'
import { DEVELOPERS_PATH } from '@/shared/constant/route'

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
                <nav className='mt-2 flex flex-wrap gap-px bg-background' aria-label={t('footer.navigation')}>
                    <Link
                        className='bg-card px-3 py-2 text-xs font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50'
                        href={DEVELOPERS_PATH}>
                        {t('nav.developers')}
                    </Link>
                </nav>
                <p>© {year} Hyunseok Byun</p>
            </div>
        </footer>
    )
}
