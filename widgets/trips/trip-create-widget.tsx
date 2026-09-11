'use client'

import { useRouter } from '@/i18n/navigation'
import type { FC } from 'react'
import { useCreateTrip, useCreateTripFromTemplate } from '@/entities/trip/trip.query'
import type { TripCreateValues } from '@/entities/trip/trip.validate'
import { TripCreateForm } from '@/features/trips/trip-create-form'
import { TripTemplateCard } from '@/features/trips/trip-template-card'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { FadeIn } from '@/shared/ui/motion/fade-in'

const TEMPLATE_DELAY = 0.06

const TEMPLATE_DESCRIPTION = '원본 오사카 일정을 그대로 옮긴 예시입니다. 만든 뒤 편집기에서 날짜와 일정을 원하는 대로 바꿀 수 있습니다.'

const TEMPLATE_HIGHLIGHTS = [
    `${OSAKA_TRIP_TEMPLATE.days.length}일`,
    `${OSAKA_TRIP_TEMPLATE.days.reduce((total, day) => total + day.scheduleItems.length, 0)}개 일정`,
    `${OSAKA_TRIP_TEMPLATE.days.reduce((total, day) => total + day.routes.length, 0)}개 이동 경로`,
    `${OSAKA_TRIP_TEMPLATE.bookings.length}개 예매 항목`,
]

export const TripCreateWidget: FC = () => {
    const router = useRouter()
    const createTrip = useCreateTrip()
    const createFromTemplate = useCreateTripFromTemplate()

    const handleCreate = (values: TripCreateValues) => createTrip.mutate(values, { onSuccess: (created) => router.push(`/trips/${created.id}/edit`) })

    const handleCreateFromTemplate = () =>
        createFromTemplate.mutate(OSAKA_TRIP_TEMPLATE, { onSuccess: (created) => router.push(`/trips/${created.id}`) })

    return (
        <div className='flex flex-col gap-px'>
            <FadeIn as='section' className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>NEW TRIP</p>
                <h1 className='text-2xl font-semibold tracking-tight'>새 트립</h1>
                <p className='text-xs text-muted-foreground'>기본 정보만 먼저 만들고 편집기에서 일정을 채우거나, 예시 트립으로 바로 시작하세요.</p>
            </FadeIn>
            <div className='grid gap-px lg:grid-cols-2'>
                <FadeIn as='section' className='flex flex-col gap-3 bg-card p-3'>
                    <h2 className='text-sm font-medium text-card-foreground'>빈 트립 만들기</h2>
                    <TripCreateForm isPending={createTrip.isPending} onSubmit={handleCreate} />
                </FadeIn>
                <FadeIn as='section' className='flex flex-col gap-3 bg-card p-3' delay={TEMPLATE_DELAY}>
                    <h2 className='text-sm font-medium text-card-foreground'>예시로 시작하기</h2>
                    <TripTemplateCard
                        title={OSAKA_TRIP_TEMPLATE.title}
                        description={TEMPLATE_DESCRIPTION}
                        highlights={TEMPLATE_HIGHLIGHTS}
                        isPending={createFromTemplate.isPending}
                        onCreate={handleCreateFromTemplate}
                    />
                </FadeIn>
            </div>
        </div>
    )
}
