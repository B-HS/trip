'use server'

import { revalidatePath } from 'next/cache'
import {
    decideAiProposal,
    applyAiProposal,
    createAiJob,
    deleteAiKey as removeAiKey,
    getAiUsageSummary,
    listAiModels,
    saveAiKey,
} from '@/entities/ai/ai.repository'
import { aiJobInputSchema, aiKeyInputSchema, aiProposalDecisionSchema, aiProviderSchema } from '@/entities/ai/ai.validate'
import { runAction } from '@/shared/lib/action-result'
import { requireUser } from '@/shared/lib/session'
import { enqueueAiJob } from '@/shared/lib/ai-queue'
import { ANALYTICS_EVENT, trackEvent } from '@/shared/lib/analytics'

export const saveAiKeyAction = async (input: unknown) => {
    const user = await requireUser()
    return runAction(async () => {
        const values = aiKeyInputSchema.parse(input)
        await saveAiKey(user.id, values.provider, values.key)
        revalidatePath('/settings/ai')
        return { provider: values.provider }
    })
}

export const deleteAiKeyAction = async (provider: string) => {
    const user = await requireUser()
    return runAction(async () => {
        const value = aiProviderSchema.parse(provider)
        await removeAiKey(user.id, value)
        revalidatePath('/settings/ai')
        return { provider: value }
    })
}

export const createAiJobAction = async (input: unknown) => {
    const user = await requireUser()
    return runAction(async () => {
        const values = aiJobInputSchema.parse(input)
        const job = await createAiJob(user.id, values)
        await enqueueAiJob(job.jobId)
        trackEvent(ANALYTICS_EVENT.aiJobRequested, { kind: values.kind })
        return job
    })
}

export const decideAiProposalAction = async (input: unknown) => {
    const user = await requireUser()
    return runAction(async () => {
        const values = aiProposalDecisionSchema.parse(input)
        return decideAiProposal(user.id, values.proposalId, values.decision)
    })
}

export const applyAiProposalAction = async (proposalId: string) => {
    const user = await requireUser()
    return runAction(() => applyAiProposal(user.id, proposalId))
}

export const getAiUsageAction = async () => {
    const user = await requireUser()
    return runAction(() => getAiUsageSummary(user.id))
}

export const getAiModelsAction = async (provider: string) => {
    const user = await requireUser()
    return runAction(async () => listAiModels(user.id, aiProviderSchema.parse(provider)))
}
