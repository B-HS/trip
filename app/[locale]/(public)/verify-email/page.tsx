import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { AuthCard } from '@/features/auth/auth-card'
import { VerifyEmailWidget } from '@/widgets/auth/verify-email-widget'

type VerifyEmailPageProps = { params: Promise<{ locale: string }>; searchParams: Promise<{ error?: string }> }

export const generateMetadata = async ({ params }: VerifyEmailPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'verification' })
    return { title: t('title') }
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
    const t = await getTranslations('verification')
    const { error } = await searchParams
    return (
        <div className='grid min-h-[calc(100dvh-3rem)] place-items-center p-4'>
            <AuthCard
                title={t('title')}
                description={error ? t('invalid') : t('success')}
                footer={
                    <Link className='font-medium text-foreground underline' href='/login'>
                        {t('login')}
                    </Link>
                }>
                <div className='flex flex-col gap-4'>
                    <h2 className='text-sm font-semibold'>{t('resendTitle')}</h2>
                    <VerifyEmailWidget />
                </div>
            </AuthCard>
        </div>
    )
}

export default VerifyEmailPage
