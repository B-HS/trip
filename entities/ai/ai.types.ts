import type { AiJobKind, AiJobStatus, AiMessageRole, AiProvider, AiReasoningEffort, AiProposalStatus } from '@/shared/constant/ai'

export type AiModel = { id: string; displayName: string; provider: AiProvider; reasoningEfforts: AiReasoningEffort[] }
export type AiKeyStatus = { provider: AiProvider; hint: string; createdAt: Date }
export type AiMessage = { id: string; role: AiMessageRole; content: string; createdAt: Date; provider: AiProvider | null; model: string | null }
export type AiJob = {
    id: string
    kind: AiJobKind
    status: AiJobStatus
    attempts: number
    error: string | null
    proposalId: string | null
    createdAt: Date
}
export type AiProposalChange = {
    operation: 'add' | 'update' | 'delete'
    dayIndex: number
    itemId?: string
    timeLabel?: string
    title?: string
    note?: string | null
    kindId?: string
}
export type AiProposal = { id: string; jobId: string; tripId: string; status: AiProposalStatus; changes: AiProposalChange[] }
