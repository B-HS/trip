import { ExternalLinkIcon } from 'lucide-react'
import type { FC } from 'react'
import type { TripFlight, TripLodging } from '@/entities/trip/trip.type'
import { formatPeriodLabel, formatRatio, formatVerifiedOn, toPercent } from '@/features/trip-viewer/trip-viewer-format'
import { cn } from '@/shared/lib/utils'
import { AnimatedProgress } from '@/shared/ui/motion/animated-progress'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'

type TripSidebarProps = {
    eyebrow: string | null
    title: string
    startDate: string
    endDate: string
    periodNote: string | null
    completedCount: number
    totalCount: number
    flights: readonly TripFlight[]
    lodgings: readonly TripLodging[]
    disclaimer: string | null
    verifiedOn: string | null
    isPrintLayout?: boolean
}

const FLIGHT_TERMINAL_FALLBACK = '—'

export const TripSidebar: FC<TripSidebarProps> = ({
    eyebrow,
    title,
    startDate,
    endDate,
    periodNote,
    completedCount,
    totalCount,
    flights,
    lodgings,
    disclaimer,
    verifiedOn,
    isPrintLayout = false,
}) => (
    <aside className={cn('flex flex-col gap-3 bg-card p-3 text-card-foreground', isPrintLayout && 'break-inside-avoid')}>
        <div>
            {eyebrow && <p className='text-2xs font-medium tracking-wide text-muted-foreground'>{eyebrow}</p>}
            <h1 className='mt-2 text-2xl leading-tight font-semibold tracking-tight break-keep text-foreground'>{title}</h1>
        </div>
        <div className='text-sm text-foreground'>
            <p className='font-mono tabular-nums'>{formatPeriodLabel(startDate, endDate)}</p>
            {periodNote && <p className='mt-1 text-xs text-muted-foreground'>{periodNote}</p>}
        </div>
        <div className='flex flex-col gap-1'>
            <span aria-live='polite' className='text-xs text-muted-foreground'>
                {formatRatio(completedCount, totalCount)} 일정 완료
            </span>
            <AnimatedProgress value={toPercent(completedCount, totalCount)} label='전체 일정 완료율' />
        </div>
        {flights.length > 0 && (
            <section className='flex flex-col gap-2'>
                <h2 className='text-sm font-medium text-foreground'>확정 항공편</h2>
                {flights.map((flight) => (
                    <div key={flight.id} className='flex flex-col gap-1 border-t border-border pt-2'>
                        <span className='text-xs text-muted-foreground'>{flight.label}</span>
                        <div className='flex items-baseline justify-between gap-2'>
                            <strong className='font-mono text-sm font-medium tabular-nums'>
                                {flight.departCode} {flight.departTime}
                            </strong>
                            <span className='text-xs text-muted-foreground'>{flight.departTerminal ?? FLIGHT_TERMINAL_FALLBACK}</span>
                        </div>
                        <div className='flex items-baseline justify-between gap-2'>
                            <strong className='font-mono text-sm font-medium tabular-nums'>
                                {flight.arriveCode} {flight.arriveTime}
                            </strong>
                            <span className='text-xs text-muted-foreground'>{flight.arriveTerminal ?? FLIGHT_TERMINAL_FALLBACK}</span>
                        </div>
                        {flight.flightNumber && <span className='font-mono text-2xs text-muted-foreground'>{flight.flightNumber}</span>}
                        {flight.note && <span className='text-xs text-muted-foreground'>{flight.note}</span>}
                    </div>
                ))}
            </section>
        )}
        {lodgings.length > 0 && (
            <section className='flex flex-col gap-2'>
                <h2 className='text-sm font-medium text-foreground'>모든 날의 출발점</h2>
                {lodgings.map((lodging) => (
                    <div key={lodging.id} className='flex flex-col gap-1 border-t border-border pt-2'>
                        <strong className='text-sm leading-snug font-medium break-keep'>{lodging.name}</strong>
                        {lodging.nameLocal && <span className='text-xs text-muted-foreground'>{lodging.nameLocal}</span>}
                        {lodging.accessNote && <span className='text-xs text-muted-foreground'>{lodging.accessNote}</span>}
                        {lodging.url && (
                            <a
                                className='inline-flex w-fit items-center gap-1 text-xs font-medium underline'
                                href={lodging.url}
                                target='_blank'
                                rel='noopener noreferrer'>
                                숙소 위치 확인
                                <ExternalLinkIcon aria-hidden className='size-3' />
                            </a>
                        )}
                    </div>
                ))}
            </section>
        )}
        {(disclaimer || verifiedOn) && (
            <p className='text-xs text-muted-foreground'>
                {disclaimer}
                {disclaimer && verifiedOn && <br />}
                {verifiedOn && `정보 확인 ${formatVerifiedOn(verifiedOn)}`}
            </p>
        )}
        {!isPrintLayout && flights.length > 0 && (
            <div className='mt-auto print:hidden'>
                <TripGlobeLazy
                    routes={flights.map((flight) => ({ from: flight.departCode, to: flight.arriveCode }))}
                    variant='mini'
                    interactive={false}
                />
            </div>
        )}
    </aside>
)
