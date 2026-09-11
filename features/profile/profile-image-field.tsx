'use client'

import { UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef, type ChangeEvent, type FC } from 'react'
import { UPLOAD_IMAGE_ACCEPT } from '@/shared/constant/upload'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

const BANNER_SIZES = '(max-width: 1024px) 100vw, 640px'

export type ProfileImageFieldProps = {
    label: string
    shape: 'avatar' | 'banner'
    previewUrl: string | null
    isUploadEnabled: boolean
    isUploading: boolean
    onUpload: (file: File) => void
    onRemove: () => void
}

export const ProfileImageField: FC<ProfileImageFieldProps> = ({ label, shape, previewUrl, isUploadEnabled, isUploading, onUpload, onRemove }) => {
    const t = useTranslations('profile.image')
    const tError = useTranslations('error')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        onUpload(file)
    }

    return (
        <div className='flex flex-col gap-2'>
            <p className='text-xs font-medium text-muted-foreground'>{label}</p>
            {shape === 'avatar' ? (
                <Avatar className='size-16' size='lg'>
                    {previewUrl !== null && <AvatarImage src={previewUrl} alt='' />}
                    <AvatarFallback>
                        <UserIcon className='size-6' aria-hidden />
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className='relative aspect-3/1 w-full max-w-160 bg-muted'>
                    {previewUrl !== null && <Image className='object-cover' src={previewUrl} alt='' sizes={BANNER_SIZES} fill />}
                </div>
            )}
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <Button
                    type='button'
                    variant='cell'
                    size='cell'
                    disabled={!isUploadEnabled || isUploading}
                    onClick={() => fileInputRef.current?.click()}>
                    {isUploading ? t('uploading') : t('upload')}
                </Button>
                <Button type='button' variant='cell' size='cell' disabled={previewUrl === null} onClick={onRemove}>
                    {t('remove')}
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
            {!isUploadEnabled && <p className='text-xs text-muted-foreground'>{tError('uploadDisabled')}</p>}
            <input ref={fileInputRef} className='hidden' type='file' accept={UPLOAD_IMAGE_ACCEPT} aria-label={label} onChange={handleFileChange} />
        </div>
    )
}
