import 'server-only'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { getEnv } from '@/shared/lib/env'

const ALGORITHM = 'aes-256-gcm'
const KEY_BYTES = 32
const IV_BYTES = 12

const getEncryptionKey = () => {
    const value = getEnv().APP_ENCRYPTION_KEY
    if (!value) throw new Error('AI encryption is not configured')
    const key = Buffer.from(value, 'base64')
    if (key.length !== KEY_BYTES) throw new Error('AI encryption key must be a base64 encoded 32-byte value')
    return key
}

export const isEncryptionConfigured = () => {
    try {
        getEncryptionKey()
        return true
    } catch {
        return false
    }
}

export type EncryptedSecret = { ciphertext: string; iv: string; tag: string; hint: string }

export const encryptSecret = (secret: string): EncryptedSecret => {
    if (secret.trim() === '') throw new Error('Secret cannot be empty')
    const iv = randomBytes(IV_BYTES)
    const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv)
    const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return { ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), tag: tag.toString('base64'), hint: secret.slice(-4) }
}

export const decryptSecret = (value: Pick<EncryptedSecret, 'ciphertext' | 'iv' | 'tag'>) => {
    const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(value.iv, 'base64'))
    decipher.setAuthTag(Buffer.from(value.tag, 'base64'))
    return Buffer.concat([decipher.update(Buffer.from(value.ciphertext, 'base64')), decipher.final()]).toString('utf8')
}
