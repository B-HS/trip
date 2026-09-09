import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { username } from 'better-auth/plugins'
import { acceptPendingInvitesForUser } from '@/shared/db/accept-invites'
import { getDb } from '@/shared/db/client'
import { account, session, user, verification } from '@/shared/db/schema/auth'
import { getEnv } from '@/shared/lib/env'
import { AUTH_COOKIE_PREFIX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/shared/constant/auth'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24

const createAuth = () => {
    const env = getEnv()
    return betterAuth({
        appName: 'trip',
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        database: drizzleAdapter(getDb(), { provider: 'mysql', schema: { user, session, account, verification } }),
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
            minPasswordLength: PASSWORD_MIN_LENGTH,
            maxPasswordLength: PASSWORD_MAX_LENGTH,
        },
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
        plugins: [username({ minUsernameLength: USERNAME_MIN_LENGTH, maxUsernameLength: USERNAME_MAX_LENGTH }), nextCookies()],
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
