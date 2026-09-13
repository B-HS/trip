export type AiTripViewerMode = 'member' | 'public'

export const shouldRenderAiTripAssistant = (mode: AiTripViewerMode, isAiEnabled: boolean, tripId?: string): tripId is string =>
    mode === 'member' && isAiEnabled && Boolean(tripId)
