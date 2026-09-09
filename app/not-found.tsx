import Link from 'next/link'
import { NOT_FOUND_COPY } from '@/shared/constant/marketing'
import { Button } from '@/shared/ui/button'
import { TripGlobeLazy } from '@/shared/ui/three/trip-globe-lazy'

const NotFoundPage = () => (
    <div className='surface-public flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-16'>
        <div className='w-full max-w-md'>
            <TripGlobeLazy routes={NOT_FOUND_COPY.globeRoutes} variant='panel' />
        </div>
        <div className='flex max-w-md flex-col items-center gap-3 text-center'>
            <span className='text-2xs font-medium tracking-wide text-muted-foreground'>{NOT_FOUND_COPY.eyebrow}</span>
            <h1 className='text-xl font-extrabold tracking-tight text-balance'>{NOT_FOUND_COPY.title}</h1>
            <p className='text-sm leading-7 text-muted-foreground'>{NOT_FOUND_COPY.description}</p>
        </div>
        <div className='flex flex-wrap justify-center gap-2'>
            <Button asChild>
                <Link href={NOT_FOUND_COPY.primaryAction.href}>{NOT_FOUND_COPY.primaryAction.label}</Link>
            </Button>
            <Button asChild variant='outline'>
                <Link href={NOT_FOUND_COPY.secondaryAction.href}>{NOT_FOUND_COPY.secondaryAction.label}</Link>
            </Button>
        </div>
    </div>
)

export default NotFoundPage
