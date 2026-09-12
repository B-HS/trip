import { useTranslations } from 'next-intl'
import type { FC } from 'react'

type LegalDocumentProps = { kind: 'terms' | 'privacy' }

export const LegalDocument: FC<LegalDocumentProps> = ({ kind }) => {
    const t = useTranslations('legal')
    const sectionKeys =
        kind === 'terms'
            ? ['service', 'account', 'content', 'moderation', 'changes', 'contact']
            : ['collected', 'purpose', 'retention', 'sharing', 'rights', 'contact']

    return (
        <article className='flex max-w-2xl flex-col gap-6'>
            <header className='flex flex-col gap-2'>
                <h1 className='text-2xl font-extrabold tracking-tight'>{t(`${kind}.title`)}</h1>
                <p className='text-sm text-muted-foreground'>{t('effectiveDate')}</p>
            </header>
            <p>{t(`${kind}.intro`)}</p>
            <div className='flex flex-col gap-5'>
                {sectionKeys.map((key) => (
                    <section key={key} className='flex flex-col gap-2'>
                        <p className='text-sm leading-6 text-muted-foreground'>{t(`${kind}.${key}`)}</p>
                    </section>
                ))}
            </div>
        </article>
    )
}
