import { withDeveloperApi } from '@/shared/lib/developer-api-handler'
import { assertDeveloperApiScope } from '@/shared/lib/developer-api-token'

export const GET = async (request: Request) =>
    withDeveloperApi(request, async ({ auth }) => {
        assertDeveloperApiScope(auth, 'token:inspect')
        return {
            token: {
                id: auth.token.id,
                label: auth.token.label,
                scopes: auth.scopes,
                prefix: auth.token.tokenPrefix,
                last4: auth.token.tokenLast4,
                createdAt: auth.token.createdAt.toISOString(),
                expiresAt: auth.token.expiresAt?.toISOString() ?? null,
                lastUsedAt: auth.token.lastUsedAt?.toISOString() ?? null,
            },
            capabilities: auth.scopes,
            subject: { userId: auth.userId },
        }
    })
