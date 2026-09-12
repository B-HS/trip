import { ImageResponse } from 'next/og'
import { getPublicTrip } from '@/entities/trip/trip.cache'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type OpenGraphImageProps = { params: Promise<{ locale: string; slug: string }> }

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
    const { slug } = await params
    let trip: Awaited<ReturnType<typeof getPublicTrip>> = null
    try {
        trip = await getPublicTrip(slug)
    } catch {
        // Keep a valid fallback image when the database is temporarily unavailable.
    }
    const title = trip?.title ?? 'Trip'
    const destination = trip?.destination ?? 'Travel itinerary'
    const period = trip ? `${trip.startDate} — ${trip.endDate}` : 'Public travel notes'

    return new ImageResponse(
        <div
            style={{
                background: '#f6f6f3',
                color: '#171717',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
                padding: '72px',
                width: '100%',
            }}>
            <div style={{ display: 'flex', fontSize: 28, letterSpacing: 8, textTransform: 'uppercase' }}>TRIP</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ color: '#5b5b5b', display: 'flex', fontSize: 30 }}>{destination}</div>
                <div style={{ display: 'flex', fontSize: 66, fontWeight: 700, lineHeight: 1.1, maxWidth: 1020 }}>{title}</div>
                <div style={{ color: '#5b5b5b', display: 'flex', fontSize: 28 }}>{period}</div>
            </div>
            <div style={{ color: '#777', display: 'flex', fontSize: 24 }}>trip.gumyo.net</div>
        </div>,
        { ...size },
    )
}
