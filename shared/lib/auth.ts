import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { admin, username } from 'better-auth/plugins'
import { genericOAuth } from 'better-auth/plugins/generic-oauth'
import { acceptPendingInvitesForUser } from '@/shared/db/accept-invites'
import { getDb } from '@/shared/db/client'
import { account, session, user, verification } from '@/shared/db/schema/auth'
import { getEnv } from '@/shared/lib/env'
import { getAuthCapabilities } from '@/shared/lib/auth-capabilities'
import { sendVerificationEmail } from '@/shared/lib/email'
import {
    ADMIN_ROLE,
    AUTH_COOKIE_PREFIX,
    DEFAULT_USER_ROLE,
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH,
} from '@/shared/constant/auth'

const DISABLED_AUTH_PATHS = ['/update-user']

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24

const createAuth = () => {
    const env = getEnv()
    const capabilities = getAuthCapabilities(env)
    const socialProviders = {
        ...(capabilities.socialProviders.includes('github')
            ? { github: { clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! } }
            : {}),
    }
    const socialPlugins = capabilities.socialProviders.includes('naver')
        ? [
              genericOAuth({
                  config: [
                      {
                          providerId: 'naver',
                          clientId: env.NAVER_CLIENT_ID!,
                          clientSecret: env.NAVER_CLIENT_SECRET!,
                          authorizationUrl: 'https://nid.naver.com/oauth2.0/authorize',
                          tokenUrl: 'https://nid.naver.com/oauth2.0/token',
                          userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
                          scopes: ['name', 'email', 'profile_image'],
                          getUserInfo: async ({ accessToken }) => {
                              const response = await fetch('https://openapi.naver.com/v1/nid/me', {
                                  headers: { authorization: `Bearer ${accessToken}` },
                              })
                              if (!response.ok) return null
                              const payload = (await response.json()) as {
                                  response?: { id?: string; email?: string; nickname?: string; profile_image?: string }
                              }
                              const profile = payload.response
                              if (!profile?.id || !profile.email) return null
                              return {
                                  id: profile.id,
                                  email: profile.email,
                                  name: profile.nickname ?? profile.email,
                                  image: profile.profile_image,
                                  emailVerified: false,
                              }
                          },
                      },
                  ],
              }),
          ]
        : []
    return betterAuth({
        appName: 'trip',
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(getDb(), { provider: 'mysql', schema: { user, session, account, verification } }),
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: capabilities.emailVerification,
            minPasswordLength: PASSWORD_MIN_LENGTH,
            maxPasswordLength: PASSWORD_MAX_LENGTH,
        },
        emailVerification: capabilities.emailVerification
            ? {
                  sendOnSignUp: true,
                  sendOnSignIn: true,
                  expiresIn: 60 * 60,
                  sendVerificationEmail: async ({ user, url }) => sendVerificationEmail({ user, url }),
              }
            : undefined,
        socialProviders,
        session: { expiresIn: SESSION_MAX_AGE_SECONDS, updateAge: SESSION_UPDATE_AGE_SECONDS },
        databaseHooks: {
            user: {
                create: {
                    after: async (createdUser) => {
                        await acceptPendingInvitesForUser({ id: createdUser.id, email: createdUser.email })
                    },
                },
            },
        },
        advanced: { cookiePrefix: AUTH_COOKIE_PREFIX },
        disabledPaths: DISABLED_AUTH_PATHS,
        plugins: [
            username({ minUsernameLength: USERNAME_MIN_LENGTH, maxUsernameLength: USERNAME_MAX_LENGTH }),
            admin({ defaultRole: DEFAULT_USER_ROLE, adminRoles: [ADMIN_ROLE] }),
            nextCookies(),
            ...socialPlugins,
        ],
    })
}

let authInstance: ReturnType<typeof createAuth> | null = null

export const getAuth = () => {
    if (authInstance) return authInstance
    authInstance = createAuth()
    return authInstance
}

export type Auth = ReturnType<typeof getAuth>
export type Session = Auth['$Infer']['Session']
