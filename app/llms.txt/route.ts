import { findRecentPublicTrips } from '@/entities/trip/trip.repository.explore'
import { SITE_DESCRIPTION_EN, SITE_NAME, SITE_URL } from '@/shared/constant/site'

export const revalidate = 3600

const safeMarkdownText = (value: string) =>
    value
        .replace(/[\r\n]+/g, ' ')
        .replace(/[\[\]]/g, '')
        .trim()

export async function GET() {
    let trips: Awaited<ReturnType<typeof findRecentPublicTrips>> = []
    try {
        trips = await findRecentPublicTrips(20)
    } catch {
        // The static site overview remains useful while a database is unavailable.
    }

    const lines = [
        `# ${SITE_NAME}`,
        '',
        `> ${SITE_DESCRIPTION_EN}`,
        '',
        'Trip is a travel notebook for date-based itineraries, transportation, lodging, booking checklists, and public trip sharing.',
        '',
        '## Public pages',
        '',
        `- [Home](${SITE_URL}/): Product overview and public community highlights.`,
        `- [Explore](${SITE_URL}/explore): Public travel itineraries.`,
        `- [Boards](${SITE_URL}/boards): Public community boards and discussions.`,
        `- [Sitemap](${SITE_URL}/sitemap.xml): Complete crawlable URL index with locale alternates.`,
    ]

    if (trips.length > 0) {
        lines.push('', '## Recent public trips', '')
        for (const trip of trips) {
            lines.push(
                `- [${safeMarkdownText(trip.title)}](${SITE_URL}/s/${encodeURIComponent(trip.shareSlug)}): ${safeMarkdownText(trip.destination)} (${trip.startDate} to ${trip.endDate}).`,
            )
        }
    }

    return new Response(`${lines.join('\n')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
