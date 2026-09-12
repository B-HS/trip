import { z } from 'zod'

const optionalText = z
    .string()
    .optional()
    .transform((value) => (value === undefined || value.trim() === '' ? undefined : value.trim()))

const optionalUrl = optionalText.pipe(z.url().optional())

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_APP_URL: z.url(),
    SEED_OWNER_EMAIL: z.string().default(''),
    R2_ACCOUNT_ID: optionalText,
    R2_ACCESS_KEY_ID: optionalText,
    R2_SECRET_ACCESS_KEY: optionalText,
    R2_BUCKET: optionalText,
    R2_PUBLIC_BASE_URL: optionalUrl,
    GITHUB_CLIENT_ID: optionalText,
    GITHUB_CLIENT_SECRET: optionalText,
    NAVER_CLIENT_ID: optionalText,
    NAVER_CLIENT_SECRET: optionalText,
    EMAIL_WORKER_URL: optionalUrl,
    EMAIL_WORKER_TOKEN: optionalText,
    EMAIL_FROM: optionalText,
    APP_ENCRYPTION_KEY: optionalText,
    VERCEL_QUEUE_REGION: optionalText,
    VERCEL_QUEUE_TOKEN: optionalText,
    VERCEL_QUEUE_URL: optionalUrl,
    VERCEL_ENV: optionalText,
    CRON_SECRET: optionalText,
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
