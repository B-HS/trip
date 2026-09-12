import 'server-only'
import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { AI_REASONING_EFFORTS, type AiProvider, type AiReasoningEffort } from '@/shared/constant/ai'
import type { AiModel } from '@/entities/ai/ai.types'

type ProviderModelPayload = { id: string; displayName?: string; reasoningEfforts?: AiReasoningEffort[] }
export type ProviderResult = { text: string; inputTokens: number; outputTokens: number }

const providerError = (provider: AiProvider, response: Response) => new Error(`${provider} provider request failed (${response.status})`)

const parseJson = async (response: Response): Promise<Record<string, unknown>> => {
    const body: unknown = await response.json().catch(() => ({}))
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
}

const modelId = (value: unknown) => (typeof value === 'string' && value.length > 0 && value.length <= 160 ? value : null)
const reasoningForOpenAi = (id: string): AiReasoningEffort[] => (/^(o[134]|gpt-5)/i.test(id) ? [...AI_REASONING_EFFORTS] : [])
// Anthropic's adaptive effort is only advertised for Claude 3.7+ and later families.
// Keep older Claude 3.x models selectable without presenting an unsupported control.
const reasoningForAnthropic = (id: string): AiReasoningEffort[] =>
    /claude-(?:3-7|[4-9])|claude-(?:opus|sonnet|haiku)-[4-9]/i.test(id) ? [...AI_REASONING_EFFORTS] : []

export const listProviderModels = async (provider: AiProvider, apiKey: string): Promise<AiModel[]> => {
    if (process.env.AI_PROVIDER_MOCK === '1') return [{ id: 'mock-model', displayName: 'Mock model', provider, reasoningEfforts: [] }]
    let response: Response
    if (provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' })
    } else if (provider === 'anthropic') {
        response = await fetch('https://api.anthropic.com/v1/models', {
            headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            cache: 'no-store',
        })
    } else {
        response = await fetch('https://ollama.com/api/tags', { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' })
    }
    if (!response.ok) throw providerError(provider, response)
    const body = await parseJson(response)
    const rows = Array.isArray(body.data) ? body.data : Array.isArray(body.models) ? body.models : []
    return rows
        .map((row): ProviderModelPayload | null => {
            if (!row || typeof row !== 'object') return null
            const value = row as Record<string, unknown>
            const id = modelId(value.id) ?? modelId(value.name) ?? modelId(value.model)
            if (!id) return null
            const reasoningEfforts = provider === 'openai' ? reasoningForOpenAi(id) : provider === 'anthropic' ? reasoningForAnthropic(id) : []
            return { id, displayName: id, reasoningEfforts }
        })
        .filter((model): model is ProviderModelPayload => model !== null)
        .map((model) => ({ id: model.id, displayName: model.displayName ?? model.id, provider, reasoningEfforts: model.reasoningEfforts ?? [] }))
}

export const generateProviderText = async (
    provider: AiProvider,
    apiKey: string,
    model: string,
    prompt: string,
    reasoningEffort?: AiReasoningEffort | null,
): Promise<ProviderResult> => {
    if (process.env.AI_PROVIDER_MOCK === '1') return { text: `Mock response: ${prompt.slice(0, 120)}`, inputTokens: 0, outputTokens: 0 }
    const languageModel =
        provider === 'openai'
            ? createOpenAI({ apiKey })(model)
            : provider === 'anthropic'
              ? createAnthropic({ apiKey })(model)
              : createOpenAICompatible({ name: 'ollama', apiKey, baseURL: 'https://ollama.com/v1', includeUsage: true }).chatModel(model)
    const providerOptions = reasoningEffort
        ? provider === 'openai'
            ? { openai: { reasoningEffort } }
            : provider === 'anthropic'
              ? { anthropic: { effort: reasoningEffort } }
              : undefined
        : undefined
    const result = await generateText({
        model: languageModel,
        prompt,
        maxOutputTokens: 4096,
        maxRetries: 0,
        providerOptions: providerOptions as never,
    })
    if (!result.text) throw new Error(`${provider} provider returned an empty response`)
    return { text: result.text, inputTokens: Number(result.usage.inputTokens ?? 0), outputTokens: Number(result.usage.outputTokens ?? 0) }
}
