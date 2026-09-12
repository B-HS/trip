import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { LegalDocument } from '@/features/auth/legal-document'

type TermsPageProps = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: TermsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.terms' })
    return { title: t('title'), description: t('description') }
}

const TermsPage = () => (
    <div className='flex justify-center p-6 md:p-10'>
        <LegalDocument kind='terms' />
    </div>
)

export default TermsPage
