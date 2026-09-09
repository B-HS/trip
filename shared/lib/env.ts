import { z } from 'zod'

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    SEED_OWNER_EMAIL: z.string().default(''),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

let cachedEnv: Env | null = null

export const getEnv = () => {
    if (cachedEnv) return cachedEnv
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
        const missing = result.error.issues.map((issue) => issue.path.join('.')).join(', ')
        throw new Error(`Missing or invalid env: ${missing}`)
    }
    cachedEnv = result.data
    return cachedEnv
}
