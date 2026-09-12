import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { listDeveloperApiTokens } from '@/shared/lib/developer-api-token'
import { requireUser } from '@/shared/lib/session'
import { DeveloperApiSettings } from '@/widgets/developer-api/developer-api-settings'

type Props = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'developerApi' })
    return { title: t('title'), description: t('description') }
}

export default async function DeveloperApiPage() {
    const user = await requireUser()
    const tokens = await listDeveloperApiTokens(user.id)
    return (
        <DeveloperApiSettings
            initialTokens={tokens.map((token) => ({
                ...token,
                expiresAt: token.expiresAt?.toISOString() ?? null,
                revokedAt: token.revokedAt?.toISOString() ?? null,
            }))}
        />
    )
}
