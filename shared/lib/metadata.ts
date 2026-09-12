import type { Metadata } from 'next'
import { openGraphLocale } from '@/i18n/routing'
import { localizedAlternates, localizedUrl, noIndexRobots } from '@/shared/lib/seo'
import { SITE_NAME } from '@/shared/constant/site'

type PageMetadataOptions = {
    locale: string
    path: string
    title: string
    description?: string
    indexable?: boolean
    type?: 'website' | 'article'
    images?: Array<{ url: string; width?: number; height?: number; alt?: string }>
}

export const createPageMetadata = ({
    locale,
    path,
    title,
    description,
    indexable = true,
    type = 'website',
    images,
}: PageMetadataOptions): Metadata => ({
    title,
    ...(description ? { description } : {}),
    alternates: localizedAlternates(path, locale),
    robots: indexable ? { index: true, follow: true } : noIndexRobots,
    openGraph: {
        title,
        ...(description ? { description } : {}),
        siteName: SITE_NAME,
        url: localizedUrl(path, locale),
        locale: openGraphLocale(locale),
        type,
        ...(images ? { images } : {}),
    },
    twitter: {
        card: images ? 'summary_large_image' : 'summary',
        title,
        ...(description ? { description } : {}),
        ...(images ? { images } : {}),
    },
})
