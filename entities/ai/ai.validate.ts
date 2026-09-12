import { z } from 'zod'
import { AI_MAX_MODEL_LENGTH, AI_MAX_PROMPT_LENGTH, AI_PROVIDERS, AI_REASONING_EFFORTS } from '@/shared/constant/ai'

export const aiProviderSchema = z.enum(AI_PROVIDERS)
export const aiReasoningEffortSchema = z.enum(AI_REASONING_EFFORTS).nullable().optional()
export const aiModelSchema = z.string().trim().min(1).max(AI_MAX_MODEL_LENGTH)
export const aiPromptSchema = z.string().trim().min(1).max(AI_MAX_PROMPT_LENGTH)

export const aiKeyInputSchema = z.object({ provider: aiProviderSchema, key: z.string().trim().min(8).max(500) })
export const aiJobInputSchema = z.object({
    tripId: z.string().uuid(),
    conversationId: z.string().uuid().optional(),
    provider: aiProviderSchema,
    model: aiModelSchema,
    reasoningEffort: aiReasoningEffortSchema,
    prompt: aiPromptSchema,
    kind: z.enum(['question', 'proposal']).default('question'),
})
export const aiProposalDecisionSchema = z.object({ proposalId: z.string().uuid(), decision: z.enum(['approve', 'reject']) })
