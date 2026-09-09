import type { UploadedImage } from '@/entities/upload/upload.type'
import type { UploadKind } from '@/shared/constant/upload'
import { clientFetch } from '@/shared/lib/fetch'

const UPLOADS_PATH = '/api/uploads'

export const uploadImage = (file: File, kind: UploadKind) => {
    const body = new FormData()
    body.append('file', file)
    body.append('kind', kind)
    return clientFetch<UploadedImage>(UPLOADS_PATH, { method: 'POST', body })
}
