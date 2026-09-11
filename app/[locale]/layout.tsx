import { Analytics } from '@vercel/analytics/next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Metadata, Viewport } from 'next'
import type { FC, PropsWithChildren } from 'react'
import { routing } from '@/i18n/routing'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/constant/site'
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

const openGraphLocale = (locale: string) => (locale === 'ja' ? 'ja_JP' : locale === 'en' ? 'en_US' : 'ko_KR')

export const generateMetadata = async ({ params }: LocaleLayoutProps): Promise<Metadata> => {
    const { locale } = await params

    return {
        title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
        description: SITE_DESCRIPTION,
        metadataBase: new URL(SITE_URL),
        openGraph: {
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            siteName: SITE_NAME,
            url: SITE_URL,
            locale: openGraphLocale(locale),
            type: 'website',
        },
        twitter: { card: 'summary', title: SITE_NAME, description: SITE_DESCRIPTION },
        robots: { index: true, follow: true },
        alternates: {
            languages: { 'x-default': SITE_URL, 'ko': SITE_URL, 'en': `${SITE_URL}/en`, 'ja': `${SITE_URL}/ja` },
        },
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
                <Analytics />
            </body>
        </html>
    )
}

export default RootLayout
