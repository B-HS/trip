import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { requireUser } from '@/shared/lib/session'
import { TripCreateWidget } from '@/widgets/trips/trip-create-widget'
import { createPageMetadata } from '@/shared/lib/metadata'

type NewTripPageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: NewTripPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.tripNew' })
    return createPageMetadata({ locale, path: '/trips/new', title: t('title'), description: t('description'), indexable: false })
}

const NewTripPage = async () => {
    await requireUser()

    return <TripCreateWidget />
}

export default NewTripPage
