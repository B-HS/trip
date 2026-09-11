import { useTranslations } from 'next-intl'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { AuthCard } from '@/features/auth/auth-card'
import { Skeleton } from '@/shared/ui/skeleton'
import { LoginWidget } from '@/widgets/auth/login-widget'

type LoginPageProps = {
    params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: LoginPageProps): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'metadata.login' })
    return { title: t('title'), description: t('description') }
}

const LoginPage = () => {
    const t = useTranslations('auth.login')

    return (
        <div className='grid min-h-[calc(100dvh-3rem)] place-items-center p-4'>
            <AuthCard
                title={t('cardTitle')}
                description={t('cardDescription')}
                footer={
                    <>
                        {t('footerText')}{' '}
                        <Link className='font-medium text-foreground underline' href='/signup'>
                            {t('signupLink')}
                        </Link>
                    </>
                }>
                <Suspense fallback={<Skeleton className='h-56 w-full rounded-md' />}>
                    <LoginWidget />
                </Suspense>
            </AuthCard>
        </div>
    )
}

export default LoginPage
