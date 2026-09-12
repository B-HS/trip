import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata, Viewport } from 'next'
import type { FC, PropsWithChildren } from 'react'
import { openGraphLocale, routing } from '@/i18n/routing'
import { JsonLdScript } from '@/features/seo/json-ld-script'
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/shared/lib/json-ld'
import { localizedAlternates, localizedUrl } from '@/shared/lib/seo'
import { SITE_NAME, SITE_URL } from '@/shared/constant/site'
import { QueryProvider } from '@/shared/lib/query-provider'
import { MotionProvider } from '@/shared/ui/motion-provider'
import { Toaster } from '@/shared/ui/sonner'
import { ThemeProvider } from '@/shared/ui/theme-provider'
import { TooltipProvider } from '@/shared/ui/tooltip'
import '../globals.css'

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))

interface LocaleLayoutProps extends PropsWithChildren {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: LocaleLayoutProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.home' })

    return {
        title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
        description: t('description'),
        metadataBase: new URL(SITE_URL),
        openGraph: {
            title: SITE_NAME,
            description: t('description'),
            siteName: SITE_NAME,
            url: localizedUrl('/', locale),
            locale: openGraphLocale(locale),
            type: 'website',
        },
        twitter: { card: 'summary', title: SITE_NAME, description: t('description') },
        robots: { index: true, follow: true },
        alternates: localizedAlternates('/', locale),
    }
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'oklch(0.955 0 0)' },
        { media: '(prefers-color-scheme: dark)', color: 'oklch(0.162 0 0)' },
    ],
}

const RootLayout: FC<LocaleLayoutProps> = async ({ children, params }) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) notFound()
    setRequestLocale(locale)

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className='flex min-h-dvh flex-col'>
                <NextIntlClientProvider>
                    <ThemeProvider>
                        <MotionProvider>
                            <QueryProvider>
                                <TooltipProvider>{children}</TooltipProvider>
                            </QueryProvider>
                        </MotionProvider>
                        <Toaster position='bottom-right' />
                    </ThemeProvider>
                </NextIntlClientProvider>
                <JsonLdScript data={[buildWebSiteJsonLd(locale), buildOrganizationJsonLd()]} />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}

export default RootLayout
