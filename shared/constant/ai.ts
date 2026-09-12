export const AI_PROVIDERS = ['openai', 'anthropic', 'ollama'] as const
export type AiProvider = (typeof AI_PROVIDERS)[number]

export const AI_JOB_STATUSES = ['queued', 'running', 'done', 'failed'] as const
export type AiJobStatus = (typeof AI_JOB_STATUSES)[number]

export const AI_MESSAGE_ROLES = ['user', 'assistant'] as const
export type AiMessageRole = (typeof AI_MESSAGE_ROLES)[number]

export const AI_JOB_KINDS = ['question', 'proposal'] as const
export type AiJobKind = (typeof AI_JOB_KINDS)[number]

export const AI_PROPOSAL_STATUSES = ['pending', 'approved', 'rejected', 'applied'] as const
export type AiProposalStatus = (typeof AI_PROPOSAL_STATUSES)[number]

export const AI_REASONING_EFFORTS = ['low', 'medium', 'high'] as const
export type AiReasoningEffort = (typeof AI_REASONING_EFFORTS)[number]

export const AI_MODEL_CACHE_TTL_MS = 10 * 60 * 1000
export const AI_MAX_PROMPT_LENGTH = 8000
export const AI_MAX_MODEL_LENGTH = 160
export const AI_MAX_ERROR_LENGTH = 500

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    ollama: 'Ollama Cloud',
}

export const isAiProvider = (value: string): value is AiProvider => AI_PROVIDERS.includes(value as AiProvider)
