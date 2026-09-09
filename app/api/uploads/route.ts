import dayjs from 'dayjs'
import { unstable_rethrow } from 'next/navigation'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { UPLOAD_KINDS } from '@/shared/constant/upload'
import { getDb } from '@/shared/db/client'
import { tripUpload } from '@/shared/db/schema/trip'
import { errorResponseStatus, toErrorResponse } from '@/shared/lib/action-result'
import { ApiError, successResponse } from '@/shared/lib/api-response'
import { getUploadConfig, putObject, toPublicUrl } from '@/shared/lib/r2'
import { getServerSession } from '@/shared/lib/session'
import { buildUploadKey, hasImageSignature, UPLOAD_ISSUE, validateUploadMeta } from '@/shared/lib/upload-validation'

const YEAR_FORMAT = 'YYYY'

const uploadKindSchema = z.enum(UPLOAD_KINDS)

export const POST = async (request: Request) => {
    try {
        const session = await getServerSession()
        if (!session) throw new ApiError('UNAUTHORIZED')
        if (getUploadConfig() === null) throw new ApiError('UPLOAD_NOT_CONFIGURED')

        const formData = await request.formData()
        const kind = uploadKindSchema.parse(formData.get('kind'))
        const file = formData.get('file')
        if (!(file instanceof File)) throw new ApiError('VALIDATION_ERROR', UPLOAD_ISSUE.EMPTY)

        const meta = validateUploadMeta({ size: file.size, type: file.type })
        if (!meta.ok) throw new ApiError('VALIDATION_ERROR', meta.issue)

        const body = new Uint8Array(await file.arrayBuffer())
        if (!hasImageSignature(body, meta.mime)) throw new ApiError('VALIDATION_ERROR', UPLOAD_ISSUE.CONTENT_MISMATCH)

        const key = buildUploadKey({ kind, year: dayjs().format(YEAR_FORMAT), mime: meta.mime, uuid: crypto.randomUUID() })
        await putObject(key, body, meta.mime)

        const id = crypto.randomUUID()
        const url = toPublicUrl(key)
        await getDb().insert(tripUpload).values({ id, ownerId: session.user.id, kind, key, url, mime: meta.mime, size: file.size })
        return NextResponse.json(successResponse({ id, url }))
    } catch (error) {
        unstable_rethrow(error)
        const body = toErrorResponse(error)
        return NextResponse.json(body, { status: errorResponseStatus(body) })
    }
}
