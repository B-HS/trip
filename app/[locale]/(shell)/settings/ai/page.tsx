import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { listAiKeys } from '@/entities/ai/ai.repository'
import { AiSettingsWidget } from '@/widgets/ai/ai-settings-widget'
import { isEncryptionConfigured } from '@/shared/lib/crypto'
import { requireUser } from '@/shared/lib/session'

type AiSettingsPageProps = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: AiSettingsPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'ai' })
    return { title: t('settingsTitle'), description: t('settingsDescription') }
}

const AiSettingsPage = async () => {
    const user = await requireUser()
    const isConfigured = isEncryptionConfigured()
    const keys = isConfigured ? await listAiKeys(user.id) : []
    return <AiSettingsWidget keys={keys} isConfigured={isConfigured} />
}

export default AiSettingsPage
