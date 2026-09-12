import type { MetadataRoute } from 'next'
import { findPublicPostsForSitemap, findBoards } from '@/entities/community/community.repository'
import { findPublicProfilesForSitemap } from '@/entities/profile/profile.repository'
import { findPublicTripsForSitemap } from '@/entities/trip/trip.repository.explore'
import { routing } from '@/i18n/routing'
import { localizedPath } from '@/shared/lib/seo'
import { SITE_URL } from '@/shared/constant/site'
import { DEVELOPERS_PATH } from '@/shared/constant/route'

export const revalidate = 3600

type SitemapRecord = {
    path: string
    lastModified?: Date | string
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
    priority?: number
}

const toEntry = ({ path, lastModified, changeFrequency = 'weekly', priority = 0.6 }: SitemapRecord): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${localizedPath(path, routing.defaultLocale)}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    alternates: {
        languages: {
            'x-default': `${SITE_URL}${localizedPath(path, routing.defaultLocale)}`,
            'ko': `${SITE_URL}${localizedPath(path, 'ko')}`,
            'en': `${SITE_URL}${localizedPath(path, 'en')}`,
            'ja': `${SITE_URL}${localizedPath(path, 'ja')}`,
        },
    },
})

const safeRecords = async <T>(load: () => Promise<T[]>) => {
    try {
        return await load()
    } catch {
        // Keep static public URLs available when the database is unavailable during a build.
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [boards, trips, posts, profiles] = await Promise.all([
        safeRecords(findBoards),
        safeRecords(findPublicTripsForSitemap),
        safeRecords(findPublicPostsForSitemap),
        safeRecords(findPublicProfilesForSitemap),
    ])

    const staticRecords: SitemapRecord[] = [
        { path: '/', changeFrequency: 'weekly', priority: 1 },
        { path: '/explore', changeFrequency: 'daily', priority: 0.8 },
        { path: '/boards', changeFrequency: 'daily', priority: 0.8 },
        { path: DEVELOPERS_PATH, changeFrequency: 'weekly', priority: 0.6 },
        { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
        { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    ]

    const boardRecords: SitemapRecord[] = boards.map((board) => ({
        path: `/boards/${encodeURIComponent(board.key)}`,
        lastModified: board.createdAt,
        changeFrequency: 'daily',
        priority: 0.7,
    }))
    const tripRecords: SitemapRecord[] = trips.flatMap((trip) =>
        trip.shareSlug === null
            ? []
            : [{ path: `/s/${encodeURIComponent(trip.shareSlug)}`, lastModified: trip.updatedAt, changeFrequency: 'weekly' as const, priority: 0.8 }],
    )
    const postRecords: SitemapRecord[] = posts.map((post) => ({
        path: `/boards/${encodeURIComponent(post.boardKey)}/${encodeURIComponent(post.id)}`,
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }))
    const profileRecords: SitemapRecord[] = profiles.flatMap((profile) =>
        profile.username === null
            ? []
            : [
                  {
                      path: `/u/${encodeURIComponent(profile.username)}`,
                      lastModified: profile.updatedAt,
                      changeFrequency: 'weekly' as const,
                      priority: 0.5,
                  },
              ],
    )

    return [...staticRecords, ...boardRecords, ...tripRecords, ...postRecords, ...profileRecords].map(toEntry)
}
