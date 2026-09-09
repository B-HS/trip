'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { uploadImage } from '@/entities/upload/upload.api'
import type { UploadKind } from '@/shared/constant/upload'

export const useUploadImage = (kind: UploadKind) =>
    useMutation({
        mutationFn: (file: File) => uploadImage(file, kind),
        onError: (error) => toast.error(error.message),
    })
