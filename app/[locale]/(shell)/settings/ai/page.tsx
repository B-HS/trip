import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { listAiKeys } from '@/entities/ai/ai.repository'
import { AiSettingsWidget } from '@/widgets/ai/ai-settings-widget'
import { isAiCapabilityEnabled } from '@/shared/lib/ai-capabilities'
import { requireUser } from '@/shared/lib/session'
import { SITE_NAME } from '@/shared/constant/site'
import { createPageMetadata } from '@/shared/lib/metadata'

type AiSettingsPageProps = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: AiSettingsPageProps): Promise<Metadata> => {
    const { locale } = await params
    if (!isAiCapabilityEnabled()) return createPageMetadata({ locale, path: '/settings/ai', title: SITE_NAME, indexable: false })
    const t = await getTranslations({ locale, namespace: 'ai' })
    return createPageMetadata({
        locale,
        path: '/settings/ai',
        title: t('settingsTitle'),
        description: t('settingsDescription'),
        indexable: false,
    })
}

const AiSettingsPage = async () => {
    if (!isAiCapabilityEnabled()) notFound()
    const user = await requireUser()
    const keys = await listAiKeys(user.id)
    return <AiSettingsWidget keys={keys} isConfigured />
}

export default AiSettingsPage
