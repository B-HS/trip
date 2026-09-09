import 'server-only'
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ApiError } from '@/shared/lib/api-response'
import { getEnv } from '@/shared/lib/env'

const R2_REGION = 'auto'
const TRAILING_SLASH_PATTERN = /\/+$/

export const getUploadConfig = () => {
    const env = getEnv()
    if (
        env.R2_ACCOUNT_ID === undefined ||
        env.R2_ACCESS_KEY_ID === undefined ||
        env.R2_SECRET_ACCESS_KEY === undefined ||
        env.R2_BUCKET === undefined ||
        env.R2_PUBLIC_BASE_URL === undefined
    )
        return null
    return {
        accountId: env.R2_ACCOUNT_ID,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucket: env.R2_BUCKET,
        publicBaseUrl: env.R2_PUBLIC_BASE_URL.replace(TRAILING_SLASH_PATTERN, ''),
    }
}

export type UploadConfig = NonNullable<ReturnType<typeof getUploadConfig>>

const requireUploadConfig = () => {
    const config = getUploadConfig()
    if (config === null) throw new ApiError('UPLOAD_NOT_CONFIGURED')
    return config
}

let cachedClient: S3Client | null = null

export const getR2Client = () => {
    if (cachedClient) return cachedClient
    const { accountId, accessKeyId, secretAccessKey } = requireUploadConfig()
    cachedClient = new S3Client({
        region: R2_REGION,
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    })
    return cachedClient
}

export const toPublicUrl = (key: string) => `${requireUploadConfig().publicBaseUrl}/${key}`

export const putObject = async (key: string, body: Uint8Array, contentType: string) => {
    const { bucket } = requireUploadConfig()
    await getR2Client().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
}

export const deleteObject = async (key: string) => {
    const { bucket } = requireUploadConfig()
    await getR2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
