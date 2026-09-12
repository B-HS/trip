import { track } from '@vercel/analytics'

type AnalyticsValue = string | number | boolean
type AnalyticsProperties = Record<string, AnalyticsValue>

export const ANALYTICS_EVENT = {
    tripCreated: 'trip_created',
    tripCreatedFromTemplate: 'trip_created_from_template',
    shareLinkCopied: 'share_link_copied',
    favoriteToggled: 'favorite_toggled',
    tripImported: 'trip_imported',
    postCreated: 'post_created',
    aiJobRequested: 'ai_job_requested',
} as const

/** Track aggregate product actions only; callers must never pass content, emails, IDs, or URLs. */
export const trackEvent = (name: string, properties?: AnalyticsProperties) => {
    try {
        void track(name, properties)
    } catch {
        // Analytics must never interrupt a successful user action.
    }
}
