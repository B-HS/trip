'use client'

import { ChevronDownIcon, LanguagesIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { FC } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type AppLocale } from '@/i18n/routing'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'

const LOCALE_MENU_CONTENT_CLASS = 'flex min-w-32 flex-col gap-px rounded-none bg-background p-px shadow-none ring-0'
const LOCALE_MENU_ITEM_CLASS = 'rounded-none bg-card px-4 py-2.5 text-xs font-medium focus:bg-muted focus:text-foreground'

export const LocaleSwitcher: FC = () => {
    const t = useTranslations('common.localeSwitcher')
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()

    const switchLocale = (next: AppLocale) => {
        router.replace(pathname, { locale: next })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='cell' size='cell' aria-label={t('menuAria')}>
                    <LanguagesIcon aria-hidden />
                    {t(`names.${locale}`)}
                    <ChevronDownIcon aria-hidden />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={LOCALE_MENU_CONTENT_CLASS}>
                {routing.locales.map((item) => (
                    <DropdownMenuItem className={LOCALE_MENU_ITEM_CLASS} key={item} onSelect={() => switchLocale(item)}>
                        {t(`names.${item}`)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
