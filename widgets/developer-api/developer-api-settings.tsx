'use client'

import { useTranslations } from 'next-intl'
import { useState, type FC } from 'react'
import { Link } from '@/i18n/navigation'
import { clientFetch } from '@/shared/lib/fetch'
import { DEVELOPERS_PATH } from '@/shared/constant/route'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import type { ApiTokenScope } from '@/shared/constant/developer-api'

type Token = {
    id: string
    tokenPrefix: string
    tokenLast4: string
    label: string
    scopes: ApiTokenScope[]
    expiresAt: string | null
    revokedAt: string | null
}
type Props = { initialTokens: Token[] }

export const DeveloperApiSettings: FC<Props> = ({ initialTokens }) => {
    const t = useTranslations('developerApi')
    const [tokens, setTokens] = useState(initialTokens)
    const [label, setLabel] = useState('')
    const [read, setRead] = useState(true)
    const [write, setWrite] = useState(false)
    const [inspect, setInspect] = useState(false)
    const [expiresAt, setExpiresAt] = useState('')
    const [issued, setIssued] = useState<string | null>(null)
    const [pending, setPending] = useState(false)
    const [error, setError] = useState(false)

    const refresh = async () => {
        const result = await clientFetch<{ items: Token[] }>('/api/developer-tokens')
        setTokens(result.items)
    }

    const create = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setPending(true)
        setError(false)
        try {
            const scopes = [read ? 'trips:read' : null, write ? 'trips:write' : null, inspect ? 'token:inspect' : null].filter(Boolean)
            const result = await clientFetch<Token & { token: string }>('/api/developer-tokens', {
                method: 'POST',
                body: JSON.stringify({ label, scopes, expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59.000Z`).toISOString() : null }),
            })
            setIssued(result.token)
            setLabel('')
            await refresh()
        } catch {
            setError(true)
        } finally {
            setPending(false)
        }
    }

    const revoke = async (id: string) => {
        if (!window.confirm(t('revokeConfirm'))) return
        try {
            await clientFetch(`/api/developer-tokens/${id}`, { method: 'DELETE' })
            await refresh()
        } catch {
            setError(true)
        }
    }

    return (
        <div className='flex flex-1 flex-col gap-px'>
            <section className='flex flex-col gap-1 bg-card p-3'>
                <p className='font-mono text-2xs tracking-widest text-muted-foreground uppercase'>API</p>
                <h1 className='text-2xl font-semibold tracking-tight'>{t('title')}</h1>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </section>
            <section className='flex flex-col gap-px bg-background'>
                <Button variant='cell' size='cell' asChild>
                    <Link href={DEVELOPERS_PATH}>{t('viewDocs')}</Link>
                </Button>
            </section>
            <form className='flex flex-col gap-3 bg-card p-3' onSubmit={create}>
                <label className='flex flex-col gap-1 text-xs font-medium' htmlFor='api-token-label'>
                    {t('label')}
                    <Input
                        id='api-token-label'
                        required
                        maxLength={80}
                        value={label}
                        placeholder={t('labelPlaceholder')}
                        onChange={(event) => setLabel(event.target.value)}
                    />
                </label>
                <fieldset className='flex flex-col gap-2 text-xs'>
                    <legend className='font-medium'>{t('scopes')}</legend>
                    <label>
                        <input type='checkbox' checked={read} onChange={(event) => setRead(event.target.checked)} /> {t('read')}
                    </label>
                    <label>
                        <input type='checkbox' checked={write} onChange={(event) => setWrite(event.target.checked)} /> {t('write')}
                    </label>
                    <label>
                        <input type='checkbox' checked={inspect} onChange={(event) => setInspect(event.target.checked)} /> {t('inspect')}
                    </label>
                </fieldset>
                <label className='flex flex-col gap-1 text-xs font-medium' htmlFor='api-token-expiry'>
                    {t('expires')}
                    <Input id='api-token-expiry' type='date' value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
                </label>
                <Button type='submit' variant='cellPrimary' size='cell' disabled={pending || (!read && !write && !inspect)}>
                    {t('create')}
                </Button>
                {error ? (
                    <p role='alert' className='text-xs text-destructive'>
                        {t('error')}
                    </p>
                ) : null}
            </form>
            {issued ? (
                <section className='flex flex-col gap-2 bg-primary/10 p-3'>
                    <strong className='text-sm'>{t('created')}</strong>
                    <p className='text-xs'>{t('copyWarning')}</p>
                    <code className='text-xs break-all'>{issued}</code>
                    <Button
                        type='button'
                        variant='cell'
                        size='cell'
                        onClick={() => void navigator.clipboard.writeText(issued).then(() => setIssued(null))}>
                        {t('copy')}
                    </Button>
                </section>
            ) : null}
            <section className='flex flex-col gap-px bg-background'>
                {tokens.length === 0 ? (
                    <p className='bg-card p-3 text-xs text-muted-foreground'>{t('empty')}</p>
                ) : (
                    tokens.map((token) => (
                        <div key={token.id} className='flex flex-wrap items-center gap-3 bg-card p-3 text-xs'>
                            <div className='min-w-48 flex-1'>
                                <p className='font-medium'>{token.label}</p>
                                <code>
                                    {token.tokenPrefix}…{token.tokenLast4}
                                </code>
                            </div>
                            <span>{token.revokedAt ? t('revoked') : t('active')}</span>
                            {!token.revokedAt ? (
                                <Button type='button' variant='cellDestructive' size='cell' onClick={() => void revoke(token.id)}>
                                    {t('revoke')}
                                </Button>
                            ) : null}
                        </div>
                    ))
                )}
            </section>
            <div aria-hidden className='min-h-0 flex-1 bg-card' />
        </div>
    )
}
