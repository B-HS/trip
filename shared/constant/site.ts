export const SITE_NAME = 'Trip'
export const SITE_DESCRIPTION = '날짜별 일정, 이동시간, 예매 체크를 한 화면에서 관리하는 여행 노트'
export const SITE_DESCRIPTION_EN = 'A travel notebook for date-based itineraries, travel times, and booking checklists.'

/** The only canonical production origin. Preview deployments intentionally use this origin too. */
export const PRODUCTION_SITE_URL = 'https://trip.gumyo.net'

const validOrigin = (value: string | undefined) => {
    if (!value) return null
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.origin : null
    } catch {
        return null
    }
}

/**
 * Local non-Vercel development may opt into its browser origin. Production and
 * Vercel previews always keep production canonical URLs to avoid duplicate SEO.
 */
export const SITE_URL =
    process.env.NODE_ENV === 'development' && process.env.VERCEL_ENV === undefined
        ? (validOrigin(process.env.NEXT_PUBLIC_APP_URL) ?? PRODUCTION_SITE_URL)
        : PRODUCTION_SITE_URL
