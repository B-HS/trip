import { describe, expect, test } from 'bun:test'
import { aiJobInputSchema, aiKeyInputSchema } from '@/entities/ai/ai.validate'

const tripId = '00000000-0000-4000-8000-000000000001'

describe('AI validation', () => {
    test('accepts supported provider key input and trims it', () => {
        expect(aiKeyInputSchema.parse({ provider: 'openai', key: '  sk-test-key-1234  ' })).toEqual({ provider: 'openai', key: 'sk-test-key-1234' })
    })

    test('rejects unknown providers and oversized prompts', () => {
        expect(aiKeyInputSchema.safeParse({ provider: 'unknown', key: 'sk-test-key-1234' }).success).toBe(false)
        expect(aiJobInputSchema.safeParse({ tripId, provider: 'openai', model: 'gpt-5', prompt: 'x'.repeat(8001), kind: 'question' }).success).toBe(
            false,
        )
    })

    test('defaults a job to a question without reasoning', () => {
        expect(aiJobInputSchema.parse({ tripId, provider: 'ollama', model: 'llama3.2', prompt: 'hello' })).toMatchObject({
            kind: 'question',
        })
    })
})
