'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState, type FC } from 'react'
import { createAiJobAction, decideAiProposalAction, applyAiProposalAction } from '@/entities/ai/ai.action'
import type { AiJob, AiMessage, AiModel, AiProposal } from '@/entities/ai/ai.types'
import { AI_PROVIDERS, AI_PROVIDER_LABELS, type AiProvider } from '@/shared/constant/ai'
import { unwrapActionResult } from '@/shared/lib/action-result'
import { translateMessage } from '@/shared/lib/message-key'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

type AiTripAssistantProps = { tripId: string }
type ApiEnvelope<T> = { success: true; data: T } | { success: false; error: { message: string } }

export const AiTripAssistant: FC<AiTripAssistantProps> = ({ tripId }) => {
    const t = useTranslations('ai')
    const tMessage = useTranslations()
    const [provider, setProvider] = useState<AiProvider>('openai')
    const [models, setModels] = useState<AiModel[]>([])
    const [model, setModel] = useState('')
    const [reasoningEffort, setReasoningEffort] = useState<string>('')
    const [prompt, setPrompt] = useState('')
    const [job, setJob] = useState<AiJob | null>(null)
    const [messages, setMessages] = useState<AiMessage[]>([])
    const [proposal, setProposal] = useState<AiProposal | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        fetch(`/api/ai/models?provider=${provider}`)
            .then((response) => response.json() as Promise<ApiEnvelope<AiModel[]>>)
            .then((body) => {
                if (!active) return
                if (!body.success) throw new Error(translateMessage(tMessage, body.error.message))
                setModels(body.data)
                setModel(body.data[0]?.id ?? '')
            })
            .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : ''))
        return () => {
            active = false
        }
    }, [provider, tMessage])

    useEffect(() => {
        if (!job || (job.status !== 'queued' && job.status !== 'running')) return
        const timer = setInterval(() => {
            fetch(`/api/ai/jobs/${job.id}`)
                .then((response) => response.json() as Promise<ApiEnvelope<AiJob & { conversation: { id: string }; proposal: AiProposal | null }>>)
                .then((body) => {
                    if (!body.success) throw new Error(translateMessage(tMessage, body.error.message))
                    setJob(body.data)
                    if (body.data.proposal) setProposal(body.data.proposal)
                    if (body.data.status === 'done') return fetch(`/api/ai/conversations/${body.data.conversation.id}`)
                    return null
                })
                .then((response) => (response ? (response.json() as Promise<ApiEnvelope<{ messages: AiMessage[] }>>) : null))
                .then((body) => body?.success && setMessages(body.data.messages))
                .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : ''))
        }, 3000)
        return () => clearInterval(timer)
    }, [job, tMessage])

    const selectedModel = models.find((item) => item.id === model)
    const submit = async (kind: 'question' | 'proposal') => {
        if (!model || prompt.trim() === '') return
        setError(null)
        try {
            const created = unwrapActionResult(
                await createAiJobAction({ tripId, provider, model, reasoningEffort: reasoningEffort || null, prompt, kind }),
            )
            setPrompt('')
            setJob({ id: created.jobId, kind, status: 'queued', attempts: 0, error: null, proposalId: null, createdAt: new Date() })
        } catch (reason: unknown) {
            setError(reason instanceof Error ? translateMessage(tMessage, reason.message) : '')
        }
    }

    const decide = async (decision: 'approve' | 'reject') => {
        if (!proposal) return
        try {
            const result = unwrapActionResult(await decideAiProposalAction({ proposalId: proposal.id, decision }))
            setProposal((current) => (current ? { ...current, status: result.status } : current))
        } catch (reason: unknown) {
            setError(reason instanceof Error ? translateMessage(tMessage, reason.message) : '')
        }
    }

    const apply = async () => {
        if (!proposal) return
        try {
            const result = unwrapActionResult(await applyAiProposalAction(proposal.id))
            setProposal((current) => (current ? { ...current, status: result.status } : current))
        } catch (reason: unknown) {
            setError(reason instanceof Error ? translateMessage(tMessage, reason.message) : '')
        }
    }

    return (
        <section className='flex flex-col gap-px bg-background'>
            <div className='flex flex-col gap-1 bg-card p-3'>
                <h2 className='text-lg font-semibold'>{t('title')}</h2>
                <p className='text-xs text-muted-foreground'>{t('description')}</p>
            </div>
            <div className='grid gap-px bg-background md:grid-cols-3'>
                <Select value={provider} onValueChange={(value) => setProvider(value as AiProvider)}>
                    <SelectTrigger className='h-10 rounded-none bg-card' aria-label={t('provider')}>
                        <SelectValue placeholder={t('provider')} />
                    </SelectTrigger>
                    <SelectContent>
                        {AI_PROVIDERS.map((item) => (
                            <SelectItem key={item} value={item}>
                                {AI_PROVIDER_LABELS[item]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className='h-10 rounded-none bg-card' aria-label={t('model')}>
                        <SelectValue placeholder={t('model')} />
                    </SelectTrigger>
                    <SelectContent>
                        {models.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={reasoningEffort}
                    onValueChange={setReasoningEffort}
                    disabled={!selectedModel || selectedModel.reasoningEfforts.length === 0}>
                    <SelectTrigger className='h-10 rounded-none bg-card' aria-label={t('reasoning')}>
                        <SelectValue placeholder={t('reasoning')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value=''>{t('none')}</SelectItem>
                        {selectedModel?.reasoningEfforts.map((effort) => (
                            <SelectItem key={effort} value={effort}>
                                {effort}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='flex flex-col gap-2 bg-card p-3'>
                <label className='text-xs font-medium' htmlFor='ai-trip-prompt'>
                    {t('prompt')}
                </label>
                <Textarea
                    id='ai-trip-prompt'
                    value={prompt}
                    maxLength={8000}
                    placeholder={t('promptPlaceholder')}
                    onChange={(event) => setPrompt(event.target.value)}
                />
                <div className='flex flex-wrap gap-px bg-background'>
                    <Button
                        type='button'
                        variant='cellPrimary'
                        size='cell'
                        disabled={!model || prompt.trim() === ''}
                        onClick={() => submit('question')}>
                        {t('ask')}
                    </Button>
                    <Button type='button' variant='cell' size='cell' disabled={!model || prompt.trim() === ''} onClick={() => submit('proposal')}>
                        {t('propose')}
                    </Button>
                    {job && <span className='flex items-center bg-card px-3 text-xs text-muted-foreground'>{t(job.status)}</span>}
                </div>
                {error && <p className='text-xs text-destructive'>{error}</p>}
            </div>
            {messages.length > 0 && (
                <div className='flex flex-col gap-px bg-background'>
                    {messages.map((message) => (
                        <div className='bg-card p-3 text-sm whitespace-pre-wrap' key={message.id}>
                            <p className='mb-1 text-2xs font-medium text-muted-foreground'>
                                {t(message.role === 'user' ? 'messageRoleUser' : 'messageRoleAssistant')}
                            </p>
                            {message.content}
                        </div>
                    ))}
                </div>
            )}
            {proposal && (
                <div className='flex flex-col gap-2 bg-card p-3'>
                    <h3 className='font-medium'>{t('proposalTitle')}</h3>
                    <p className='text-xs text-muted-foreground'>{t('proposalDescription')}</p>
                    <ul className='list-disc pl-5 text-sm'>
                        {proposal.changes.map((change, index) => (
                            <li key={`${change.operation}-${change.dayIndex}-${change.itemId ?? index}`}>
                                {t(`operations.${change.operation}`)} · {t('day', { day: change.dayIndex + 1 })} ·{' '}
                                {change.title ?? change.itemId ?? ''}
                            </li>
                        ))}
                    </ul>
                    <div className='flex flex-wrap gap-px bg-background'>
                        <Button
                            type='button'
                            variant='cellPrimary'
                            size='cell'
                            disabled={proposal.status !== 'pending'}
                            onClick={() => decide('approve')}>
                            {t('approve')}
                        </Button>
                        <Button
                            type='button'
                            variant='cellDestructive'
                            size='cell'
                            disabled={proposal.status !== 'pending'}
                            onClick={() => decide('reject')}>
                            {t('reject')}
                        </Button>
                        <Button type='button' variant='cell' size='cell' disabled={proposal.status !== 'approved'} onClick={apply}>
                            {t('apply')}
                        </Button>
                    </div>
                </div>
            )}
        </section>
    )
}
