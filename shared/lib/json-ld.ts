import type { PostDetail } from '@/entities/community/community.type'
import type { PublicProfile } from '@/entities/profile/profile.type'
import type { PublicTrip } from '@/entities/trip/trip.type'
import { localizedUrl } from '@/shared/lib/seo'

export type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[]
export type JsonLdObject = { [key: string]: JsonLdValue }

const context = 'https://schema.org'

const asDateTime = (date: string) => (date.includes('T') ? date : `${date}T00:00:00`)

export const buildWebSiteJsonLd = (locale = 'ko'): JsonLdObject => ({
    '@context': context,
    '@type': 'WebSite',
    'name': 'Trip',
    'url': localizedUrl('/', locale),
    'inLanguage': locale,
})

export const buildOrganizationJsonLd = (): JsonLdObject => ({
    '@context': context,
    '@type': 'Organization',
    'name': 'Trip',
    'url': localizedUrl('/'),
})

const buildPlace = (name: string, address?: string | null): JsonLdObject => ({
    '@type': 'Place',
    name,
    ...(address ? { address: { '@type': 'PostalAddress', 'streetAddress': address } } : {}),
})

const asTripDateTime = (date: string, time: string | null | undefined) => {
    if (!time) return null
    const normalized = /^\d{1,2}:\d{2}(?::\d{2})?$/.test(time) ? (time.length === 5 ? `${time}:00` : time) : null
    return normalized === null ? null : `${date}T${normalized}`
}

export const buildTouristTripJsonLd = (trip: PublicTrip, url: string, description?: string | null): JsonLdObject => {
    const outbound = trip.flights.find((flight) => flight.direction === 'outbound') ?? trip.flights[0]
    const inbound = [...trip.flights].reverse().find((flight) => flight.direction === 'inbound') ?? trip.flights.at(-1)
    const departureTime = outbound ? asTripDateTime(trip.startDate, outbound.departTime) : null
    const arrivalTime = inbound ? asTripDateTime(trip.endDate, inbound.arriveTime) : null

    const itineraryItems = [
        ...trip.destinations.map((destination, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'item': buildPlace(destination.city ?? destination.countryCode),
        })),
        ...trip.days.map((day, index) => ({
            '@type': 'ListItem',
            'position': trip.destinations.length + index + 1,
            'item': {
                '@type': 'TouristAttraction',
                'name': day.title,
                ...(day.overview ? { description: day.overview } : {}),
                ...(day.date ? { additionalProperty: { '@type': 'PropertyValue', 'name': 'date', 'value': day.date } } : {}),
            },
        })),
    ]

    return {
        '@context': context,
        '@type': 'TouristTrip',
        'name': trip.title,
        url,
        'description': description ?? `${trip.destination} travel itinerary`,
        ...(departureTime ? { departureTime } : {}),
        ...(arrivalTime ? { arrivalTime } : {}),
        'touristType': 'Travel itinerary',
        'itinerary': {
            '@type': 'ItemList',
            'numberOfItems': itineraryItems.length,
            'itemListElement': itineraryItems,
        },
    }
}

export const buildArticleJsonLd = (post: PostDetail, url: string): JsonLdObject => ({
    '@context': context,
    '@type': 'Article',
    'headline': post.title,
    'description': post.excerpt,
    'articleBody': post.excerpt,
    url,
    'datePublished': asDateTime(post.createdAt),
    'dateModified': asDateTime(post.updatedAt),
    'author': {
        '@type': 'Person',
        'name': post.author.name,
        ...(post.author.username ? { url: localizedUrl(`/u/${encodeURIComponent(post.author.username)}`) } : {}),
    },
    'publisher': { '@type': 'Organization', 'name': 'Trip', 'url': localizedUrl('/') },
    'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
})

export const buildQaPageJsonLd = (post: PostDetail, url: string, acceptedAnswer?: { text: string; author?: string }): JsonLdObject => ({
    '@context': context,
    '@type': 'QAPage',
    'mainEntity': {
        '@type': 'Question',
        'name': post.title,
        'text': post.excerpt,
        'answerCount': post.commentCount,
        'dateCreated': asDateTime(post.createdAt),
        'author': { '@type': 'Person', 'name': post.author.name },
        ...(acceptedAnswer
            ? {
                  acceptedAnswer: {
                      '@type': 'Answer',
                      'text': acceptedAnswer.text,
                      ...(acceptedAnswer.author ? { author: { '@type': 'Person', 'name': acceptedAnswer.author } } : {}),
                  },
              }
            : {}),
    },
    url,
})

export const buildProfilePageJsonLd = (profile: PublicProfile, url: string): JsonLdObject => ({
    '@context': context,
    '@type': 'ProfilePage',
    url,
    'dateCreated': asDateTime(profile.createdAt),
    'mainEntity': {
        '@type': 'Person',
        'name': profile.name,
        ...(profile.username ? { identifier: profile.username } : {}),
        ...(profile.bio ? { description: profile.bio } : {}),
        ...(profile.image ? { image: profile.image } : {}),
        url,
    },
})

/** Serialize JSON-LD without allowing a user-authored `</script>` to escape the tag. */
export const serializeJsonLd = (value: JsonLdValue | JsonLdValue[]) =>
    JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
