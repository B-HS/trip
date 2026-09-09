import Link from 'next/link'
import { NOT_FOUND_COPY } from '@/shared/constant/marketing'
import { Button } from '@/shared/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/shared/ui/empty'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'

const NotFoundPage = () => (
    <div className='surface-public flex flex-1 flex-col bg-background'>
        <Empty className='gap-8 px-6 py-16'>
            <EmptyHeader className='max-w-md gap-3'>
                <EmptyMedia className='mb-4 w-full max-w-md'>
                    <TripGlobeLazy routes={NOT_FOUND_COPY.globeRoutes} variant='panel' />
                </EmptyMedia>
                <span className='text-2xs font-medium tracking-wide text-muted-foreground'>{NOT_FOUND_COPY.eyebrow}</span>
                <h1 className='text-xl font-extrabold tracking-tight text-balance'>{NOT_FOUND_COPY.title}</h1>
                <EmptyDescription className='leading-7'>{NOT_FOUND_COPY.description}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className='w-fit flex-row flex-wrap items-stretch justify-center gap-px bg-background'>
                <Button asChild variant='cellPrimary' size='cell'>
                    <Link href={NOT_FOUND_COPY.primaryAction.href}>{NOT_FOUND_COPY.primaryAction.label}</Link>
                </Button>
                <Button asChild variant='cell' size='cell'>
                    <Link href={NOT_FOUND_COPY.secondaryAction.href}>{NOT_FOUND_COPY.secondaryAction.label}</Link>
                </Button>
            </EmptyContent>
        </Empty>
    </div>
)

export default NotFoundPage
