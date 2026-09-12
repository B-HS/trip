import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { LegalDocument } from '@/features/auth/legal-document'
import { createPageMetadata } from '@/shared/lib/metadata'

type PrivacyPageProps = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: PrivacyPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.privacy' })
    return createPageMetadata({ locale, path: '/privacy', title: t('title'), description: t('description') })
}

const PrivacyPage = () => (
    <div className='flex justify-center p-6 md:p-10'>
        <LegalDocument kind='privacy' />
    </div>
)

export default PrivacyPage
