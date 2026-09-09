import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { FC, PropsWithChildren } from 'react'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/shared/constant/site'
import { QueryProvider } from '@/shared/lib/query-provider'
import { Toaster } from '@/shared/ui/sonner'
import { ThemeProvider } from '@/shared/ui/theme-provider'
import { TooltipProvider } from '@/shared/ui/tooltip'
import './globals.css'

export const metadata: Metadata = {
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION, siteName: SITE_NAME, url: SITE_URL, locale: 'ko_KR', type: 'website' },
    twitter: { card: 'summary', title: SITE_NAME, description: SITE_DESCRIPTION },
    robots: { index: true, follow: true },
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'oklch(0.955 0 0)' },
        { media: '(prefers-color-scheme: dark)', color: 'oklch(0.162 0 0)' },
    ],
}

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang='ko' suppressHydrationWarning>
        <body className='flex min-h-dvh flex-col'>
            <ThemeProvider>
                <QueryProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </QueryProvider>
                <Toaster position='bottom-right' />
            </ThemeProvider>
            <Analytics />
        </body>
    </html>
)

export default RootLayout
