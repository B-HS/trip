'use client'

import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { useCreateTrip, useCreateTripFromTemplate } from '@/entities/trip/trip.query'
import type { TripCreateValues } from '@/entities/trip/trip.validate'
import { TripCreateForm } from '@/features/trips/trip-create-form'
import { TripTemplateCard } from '@/features/trips/trip-template-card'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { FadeIn } from '@/shared/ui/motion/fade-in'

const TEMPLATE_DELAY = 0.06

export const TripCreateWidget: FC = () => {
    const t = useTranslations('trips.create')
    const router = useRouter()
    const createTrip = useCreateTrip()
    const createFromTemplate = useCreateTripFromTemplate()
    const templateHighlights = [
        t('days', { n: OSAKA_TRIP_TEMPLATE.days.length }),
        t('schedules', { n: OSAKA_TRIP_TEMPLATE.days.reduce((total, day) => total + day.scheduleItems.length, 0) }),
        t('routes', { n: OSAKA_TRIP_TEMPLATE.days.reduce((total, day) => total + day.routes.length, 0) }),
        t('bookings', { n: OSAKA_TRIP_TEMPLATE.bookings.length }),
    ]

    const handleCreate = (values: TripCreateValues) => createTrip.mutate(values, { onSuccess: (created) => router.push(`/trips/${created.id}/edit`) })

    const handleCreateFromTemplate = () =>
        createFromTemplate.mutate(OSAKA_TRIP_TEMPLATE, { onSuccess: (created) => router.push(`/trips/${created.id}`) })

    return (
        <div className='flex flex-col gap-px'>
            <FadeIn as='section' className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>NEW TRIP</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </FadeIn>
            <div className='grid gap-px lg:grid-cols-2'>
                <FadeIn as='section' className='flex flex-col gap-3 bg-card p-3'>
                    <h2 className='text-sm font-medium text-card-foreground'>{t('blank')}</h2>
                    <TripCreateForm isPending={createTrip.isPending} onSubmit={handleCreate} />
                </FadeIn>
                <FadeIn as='section' className='flex flex-col gap-3 bg-card p-3' delay={TEMPLATE_DELAY}>
                    <h2 className='text-sm font-medium text-card-foreground'>{t('templateTitle')}</h2>
                    <TripTemplateCard
                        title={OSAKA_TRIP_TEMPLATE.title}
                        description={t('templateDescription')}
                        highlights={templateHighlights}
                        isPending={createFromTemplate.isPending}
                        onCreate={handleCreateFromTemplate}
                    />
                </FadeIn>
            </div>
        </div>
    )
}
