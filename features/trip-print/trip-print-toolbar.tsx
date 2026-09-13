'use client'

import { ArrowLeftIcon, PrinterIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/ui/button'

type TripPrintToolbarProps = {
    backHref: string
}

/** The only interactive chrome on a print route. It is removed from printed output. */
export const TripPrintToolbar: FC<TripPrintToolbarProps> = ({ backHref }) => {
    const t = useTranslations('tripPrint')

    return (
        <nav className='trip-print-toolbar sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-3 py-2 backdrop-blur sm:px-5'>
            <Button variant='cell' size='cell' asChild>
                <Link href={backHref}>
                    <ArrowLeftIcon aria-hidden />
                    {t('back')}
                </Link>
            </Button>
            <Button type='button' variant='cellPrimary' size='cell' onClick={() => window.print()}>
                <PrinterIcon aria-hidden />
                {t('print')}
            </Button>
        </nav>
    )
}
