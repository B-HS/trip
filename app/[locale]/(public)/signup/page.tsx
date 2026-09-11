import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { AuthCard } from '@/features/auth/auth-card'
import { Skeleton } from '@/shared/ui/skeleton'
import { SignupWidget } from '@/widgets/auth/signup-widget'

type SignupPageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: SignupPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.signup' })
    return { title: t('title'), description: t('description') }
}

const SignupPage = () => {
    const t = useTranslations('auth.signup')

    return (
        <div className='grid min-h-[calc(100dvh-3rem)] place-items-center p-4'>
            <AuthCard
                title={t('cardTitle')}
                description={t('cardDescription')}
                footer={
                    <>
                        {t('footerText')}{' '}
                        <Link className='font-medium text-foreground underline' href='/login'>
                            {t('loginLink')}
                        </Link>
                    </>
                }>
                <Suspense fallback={<Skeleton className='h-96 w-full rounded-md' />}>
                    <SignupWidget />
                </Suspense>
            </AuthCard>
        </div>
    )
}

export default SignupPage
