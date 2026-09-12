import type { Env } from '@/shared/lib/env'
import { SOCIAL_PROVIDERS, type SocialProvider } from '@/shared/constant/auth'

type AuthCapabilityEnv = Pick<
    Env,
    'GITHUB_CLIENT_ID' | 'GITHUB_CLIENT_SECRET' | 'NAVER_CLIENT_ID' | 'NAVER_CLIENT_SECRET' | 'EMAIL_WORKER_URL' | 'EMAIL_WORKER_TOKEN' | 'EMAIL_FROM'
>

const hasPair = (first: string | undefined, second: string | undefined) => Boolean(first && second)

export const getAuthCapabilities = (env: AuthCapabilityEnv) => {
    const socialProviders: SocialProvider[] = []
    if (hasPair(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)) socialProviders.push('github')
    if (hasPair(env.NAVER_CLIENT_ID, env.NAVER_CLIENT_SECRET)) socialProviders.push('naver')

    return {
        socialProviders,
        emailVerification: Boolean(env.EMAIL_WORKER_URL && env.EMAIL_WORKER_TOKEN && env.EMAIL_FROM),
    }
}

export const isSocialProvider = (provider: string): provider is SocialProvider => SOCIAL_PROVIDERS.includes(provider as SocialProvider)
