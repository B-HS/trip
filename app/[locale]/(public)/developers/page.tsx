import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'developerPortal' })
    return { title: t('title'), description: t('description') }
}

export default async function DevelopersPage() {
    const t = await getTranslations('developerPortal')
    return (
        <main className='mx-auto flex w-full max-w-6xl flex-col gap-px bg-background px-4 py-8 sm:px-8'>
            <section className='flex flex-col gap-4 bg-card p-6 sm:p-10'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>TRIP / API V1</p>
                <h1 className='max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl'>{t('title')}</h1>
                <p className='max-w-2xl text-base text-muted-foreground'>{t('description')}</p>
                <div className='flex flex-wrap gap-px bg-background'>
                    <Link href='/api/v1/openapi.json' className='bg-primary px-4 py-3 text-sm text-primary-foreground'>
                        {t('openapi')}
                    </Link>
                    <Link href='/login' className='bg-card px-4 py-3 text-sm'>
                        {t('getStarted')}
                    </Link>
                </div>
            </section>
            <div className='grid gap-px bg-background md:grid-cols-3'>
                <section className='flex flex-col gap-2 bg-card p-6'>
                    <h2 className='text-lg font-semibold'>{t('authenticationTitle')}</h2>
                    <p className='text-sm text-muted-foreground'>{t('authentication')}</p>
                    <code className='bg-muted p-3 text-xs'>Authorization: Bearer trip_pat_…</code>
                </section>
                <section className='flex flex-col gap-2 bg-card p-6'>
                    <h2 className='text-lg font-semibold'>{t('scopesTitle')}</h2>
                    <p className='text-sm text-muted-foreground'>{t('scopes')}</p>
                    <code className='bg-muted p-3 text-xs'>trips:read · trips:write · token:inspect</code>
                </section>
                <section className='flex flex-col gap-2 bg-card p-6'>
                    <h2 className='text-lg font-semibold'>{t('agentTitle')}</h2>
                    <p className='text-sm text-muted-foreground'>{t('agent')}</p>
                </section>
            </div>
            <section className='flex flex-col gap-3 bg-card p-6 sm:p-10'>
                <h2 className='text-2xl font-semibold'>{t('quickstartTitle')}</h2>
                <p className='text-sm text-muted-foreground'>{t('quickstart')}</p>
                <pre className='overflow-x-auto bg-muted p-4 text-xs'>
                    <code>{`curl https://trip.gumyo.net/api/v1/trips \\\n  -H 'Authorization: Bearer trip_pat_REDACTED'`}</code>
                </pre>
            </section>
            <section className='grid gap-px bg-background md:grid-cols-2'>
                <div className='bg-card p-6'>
                    <h2 className='text-lg font-semibold'>{t('safetyTitle')}</h2>
                    <p className='mt-2 text-sm text-muted-foreground'>{t('safety')}</p>
                </div>
                <div className='bg-card p-6'>
                    <h2 className='text-lg font-semibold'>{t('limitsTitle')}</h2>
                    <p className='mt-2 text-sm text-muted-foreground'>{t('limits')}</p>
                </div>
            </section>
        </main>
    )
}
