'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { CopyIcon, DownloadIcon, ExternalLinkIcon } from 'lucide-react'
import { useEffect, useRef, type FC } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { shareSettingsSchema, type ShareSettingsInput, type ShareSettingsValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_UNDEFINED, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const SHARE_PATH = '/s/'

type SharePanelProps = {
    canManage: boolean
    defaultValues: ShareSettingsInput
    savedSlug: string | null
    onSubmit: EditorSubmit<ShareSettingsValues>
    onExport: () => void
    isPending: boolean
    isExporting: boolean
}

export const SharePanel: FC<SharePanelProps> = ({ canManage, defaultValues, savedSlug, onSubmit, onExport, isPending, isExporting }) => {
    const didResetRef = useRef(false)
    const form = useForm<ShareSettingsInput, unknown, ShareSettingsValues>({ resolver: zodResolver(shareSettingsSchema), defaultValues })
    const [isPublic, slug] = useWatch({ control: form.control, name: ['isPublic', 'slug'] })

    const { errors, isDirty } = form.formState
    const previewSlug = slug ?? savedSlug
    const savedUrl = savedSlug === null ? null : `${APP_URL}${SHARE_PATH}${savedSlug}`
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onSubmit(values)
        if (isSaved) form.reset(values)
    })
    const handleCopy = async () => {
        if (savedUrl === null) return
        try {
            await navigator.clipboard.writeText(savedUrl)
            toast.success('공유 링크를 복사했습니다.')
        } catch {
            toast.error('링크를 복사하지 못했습니다.')
        }
    }

    useEffect(() => {
        if (didResetRef.current) return
        didResetRef.current = true
        form.reset(defaultValues)
    }, [defaultValues, form])

    return (
        <div className='flex flex-col gap-px bg-background'>
            {canManage && (
                <EditorFormShell
                    isDirty={isDirty}
                    isPending={isPending}
                    onSubmit={handleSubmit}
                    onReset={() => form.reset()}
                    hint='공유 설정을 저장합니다.'>
                    <EditorPanel title='공개 링크' description='공개하면 로그인 없이도 읽기 전용으로 볼 수 있습니다.'>
                        <div className='flex items-center gap-2'>
                            <Switch
                                id='share-is-public'
                                checked={isPublic ?? false}
                                onCheckedChange={(checked) => form.setValue('isPublic', checked, { shouldDirty: true })}
                            />
                            <Label className='text-xs font-medium text-muted-foreground' htmlFor='share-is-public'>
                                공개 링크 사용
                            </Label>
                        </div>
                        <EditorField
                            label='공유 주소'
                            htmlFor='share-slug'
                            error={errors.slug?.message}
                            hint='영문 소문자, 숫자, 하이픈만 사용할 수 있습니다. 비워 두면 자동으로 만듭니다.'>
                            <Input
                                id='share-slug'
                                className={`${EDITOR_INPUT_CLASS} font-mono`}
                                placeholder='osaka-2026'
                                aria-invalid={!!errors.slug}
                                {...form.register('slug', EMPTY_TO_UNDEFINED)}
                            />
                        </EditorField>
                        <p className='font-mono text-xs break-all text-muted-foreground'>
                            {previewSlug === null || previewSlug === ''
                                ? '저장하면 공유 주소가 만들어집니다.'
                                : `${APP_URL}${SHARE_PATH}${previewSlug}`}
                        </p>
                        <div className='flex flex-wrap items-center gap-2'>
                            <Button type='button' variant='outline' size='sm' disabled={savedUrl === null} onClick={handleCopy}>
                                <CopyIcon />
                                링크 복사
                            </Button>
                            {savedUrl === null ? (
                                <Button type='button' variant='outline' size='sm' disabled>
                                    <ExternalLinkIcon />새 탭에서 열기
                                </Button>
                            ) : (
                                <Button variant='outline' size='sm' asChild>
                                    <a href={savedUrl} target='_blank' rel='noopener noreferrer'>
                                        <ExternalLinkIcon />새 탭에서 열기
                                    </a>
                                </Button>
                            )}
                        </div>
                    </EditorPanel>
                </EditorFormShell>
            )}
            <EditorPanel title='내보내기' description='구조화된 JSON 으로 내려받아 다른 여행을 만들 때 사용할 수 있습니다.'>
                <div>
                    <Button type='button' variant='outline' size='sm' disabled={isExporting} onClick={onExport}>
                        <DownloadIcon />
                        {isExporting ? '내보내는 중…' : 'JSON 내보내기'}
                    </Button>
                </div>
            </EditorPanel>
        </div>
    )
}
