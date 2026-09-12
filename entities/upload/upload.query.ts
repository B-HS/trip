'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { uploadImage } from '@/entities/upload/upload.api'
import type { UploadKind } from '@/shared/constant/upload'
import { translateMessage } from '@/shared/lib/message-key'

export const useUploadImage = (kind: UploadKind) => {
    const t = useTranslations()
    return useMutation({
        mutationFn: (file: File) => uploadImage(file, kind),
        onError: (error) => toast.error(translateMessage(t, error.message)),
    })
}
