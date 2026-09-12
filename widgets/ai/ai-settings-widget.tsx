'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC } from 'react'
import { deleteAiKeyAction, saveAiKeyAction } from '@/entities/ai/ai.action'
import type { AiKeyStatus } from '@/entities/ai/ai.types'
import { AI_PROVIDERS, AI_PROVIDER_LABELS, type AiProvider } from '@/shared/constant/ai'
import { unwrapActionResult } from '@/shared/lib/action-result'
import { translateMessage } from '@/shared/lib/message-key'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

type AiSettingsWidgetProps = { keys: AiKeyStatus[]; isConfigured: boolean }

export const AiSettingsWidget: FC<AiSettingsWidgetProps> = ({ keys: initialKeys, isConfigured }) => {
    const t = useTranslations('ai')
    const tMessage = useTranslations()
    const [keys, setKeys] = useState(initialKeys)
    const [provider, setProvider] = useState<AiProvider>('openai')
    const [secret, setSecret] = useState('')
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const configured = new Map(keys.map((key) => [key.provider, key]))

    const save = async () => {
        setPending(true)
        setError(null)
        try {
            const result = unwrapActionResult(await saveAiKeyAction({ provider, key: secret }))
            setKeys((current) => [
                ...current.filter((key) => key.provider !== result.provider),
                { provider: result.provider, hint: secret.slice(-4), createdAt: new Date() },
            ])
            setSecret('')
        } catch (reason: unknown) {
            setError(reason instanceof Error ? translateMessage(tMessage, reason.message) : '')
        } finally {
            setPending(false)
        }
    }

    const remove = async (target: AiProvider) => {
        setPending(true)
        setError(null)
        try {
            unwrapActionResult(await deleteAiKeyAction(target))
            setKeys((current) => current.filter((key) => key.provider !== target))
        } catch (reason: unknown) {
            setError(reason instanceof Error ? translateMessage(tMessage, reason.message) : '')
        } finally {
            setPending(false)
        }
    }

    return (
        <div className='flex flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('settingsTitle')}</h1>
                <p className='text-xs text-muted-foreground'>{t('settingsDescription')}</p>
            </section>
            {!isConfigured && <p className='bg-destructive/10 p-3 text-sm text-destructive'>{t('encryptionUnavailable')}</p>}
            {error && <p className='bg-destructive/10 p-3 text-sm text-destructive'>{error}</p>}
            {AI_PROVIDERS.map((item) => {
                const saved = configured.get(item)
                return (
                    <section className='flex flex-col gap-3 bg-card p-3' key={item}>
                        <div className='flex items-center justify-between gap-2'>
                            <h2 className='font-medium'>{AI_PROVIDER_LABELS[item]}</h2>
                            <span className='text-xs text-muted-foreground'>
                                {saved ? t('configured', { hint: saved.hint }) : t('notConfigured')}
                            </span>
                        </div>
                        <div className='flex flex-wrap items-center gap-px bg-background'>
                            <Input
                                aria-label={`${t('key')} — ${AI_PROVIDER_LABELS[item]}`}
                                className='min-w-0 flex-1 rounded-none bg-card'
                                type='password'
                                value={provider === item ? secret : ''}
                                placeholder={t('keyPlaceholder')}
                                disabled={!isConfigured || pending}
                                onFocus={() => setProvider(item)}
                                onChange={(event) => {
                                    setProvider(item)
                                    setSecret(event.target.value)
                                }}
                            />
                            <Button
                                type='button'
                                variant='cellPrimary'
                                size='cell'
                                disabled={!isConfigured || pending || provider !== item || secret.length < 8}
                                onClick={save}>
                                {saved ? t('replaceKey') : t('saveKey')}
                            </Button>
                            {saved && (
                                <Button type='button' variant='cellDestructive' size='cell' disabled={pending} onClick={() => remove(item)}>
                                    {t('deleteKey')}
                                </Button>
                            )}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}
