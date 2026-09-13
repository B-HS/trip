import { describe, expect, test } from 'bun:test'
import { shouldRenderAiTripAssistant } from '@/widgets/trip-viewer/ai-entrypoint'

describe('trip viewer AI entry point', () => {
    test('is hidden when the server capability is disabled', () => {
        expect(shouldRenderAiTripAssistant('member', false, 'trip-id')).toBe(false)
    })

    test('is available for a configured member trip', () => {
        expect(shouldRenderAiTripAssistant('member', true, 'trip-id')).toBe(true)
    })

    test('is never available for public trips or missing trip ids', () => {
        expect(shouldRenderAiTripAssistant('public', true, 'trip-id')).toBe(false)
        expect(shouldRenderAiTripAssistant('member', true)).toBe(false)
    })
})
