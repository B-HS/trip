'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { CopyIcon, DownloadIcon, ExternalLinkIcon, UploadIcon } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FC, type MouseEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { shareSettingsSchema, type ShareSettingsInput, type ShareSettingsValues } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, EMPTY_TO_UNDEFINED, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorFormShell } from '@/features/trip-editor/editor-form-shell'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import { parseTripTemplateJson, type TripTemplate } from '@/shared/lib/trip-template'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const SHARE_PATH = '/s/'
const IMPORT_ACCEPT = 'application/json,.json'

type SharePanelProps = {
    canManage: boolean
    defaultValues: ShareSettingsInput
    savedSlug: string | null
    onSubmit: EditorSubmit<ShareSettingsValues>
    onExport: () => void
    onImport: (template: TripTemplate) => Promise<boolean>
    isPending: boolean
    isExporting: boolean
    isImporting: boolean
}

export const SharePanel: FC<SharePanelProps> = ({
    canManage,
    defaultValues,
    savedSlug,
    onSubmit,
    onExport,
    onImport,
    isPending,
    isExporting,
    isImporting,
}) => {
    const didResetRef = useRef(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [pendingTemplate, setPendingTemplate] = useState<TripTemplate | null>(null)
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
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        const template = parseTripTemplateJson(await file.text())
        if (template === null) {
            toast.error('올바른 트립 JSON 이 아닙니다.')
            return
        }
        setPendingTemplate(template)
    }
    const handleImport = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        if (pendingTemplate === null) return
        const isImported = await onImport(pendingTemplate)
        if (isImported) setPendingTemplate(null)
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
                        <div className='flex w-fit flex-wrap items-stretch gap-px bg-background'>
                            <Button type='button' variant='cell' size='cell' disabled={savedUrl === null} onClick={handleCopy}>
                                <CopyIcon />
                                링크 복사
                            </Button>
                            {savedUrl === null ? (
                                <Button type='button' variant='cell' size='cell' disabled>
                                    <ExternalLinkIcon />새 탭에서 열기
                                </Button>
                            ) : (
                                <Button variant='cell' size='cell' asChild>
                                    <a href={savedUrl} target='_blank' rel='noopener noreferrer'>
                                        <ExternalLinkIcon />새 탭에서 열기
                                    </a>
                                </Button>
                            )}
                        </div>
                    </EditorPanel>
                </EditorFormShell>
            )}
            <EditorPanel title='내보내기·가져오기' description='구조화된 JSON 으로 내려받거나, 내보낸 JSON 을 가져와 현재 내용을 교체할 수 있습니다.'>
                <div className='flex w-fit flex-wrap items-stretch gap-px bg-background'>
                    <Button type='button' variant='cell' size='cell' disabled={isExporting} onClick={onExport}>
                        <DownloadIcon />
                        {isExporting ? '내보내는 중…' : 'JSON 내보내기'}
                    </Button>
                    <Button type='button' variant='cell' size='cell' disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon />
                        {isImporting ? '가져오는 중…' : 'JSON 가져오기'}
                    </Button>
                    <input ref={fileInputRef} className='hidden' type='file' accept={IMPORT_ACCEPT} onChange={handleFileChange} />
                </div>
            </EditorPanel>
            <AlertDialog open={pendingTemplate !== null} onOpenChange={() => setPendingTemplate(null)}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>이 JSON 으로 교체할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingTemplate === null
                                ? ''
                                : `${pendingTemplate.title} · 날짜 ${pendingTemplate.days.length}개 · 예매 ${pendingTemplate.bookings.length}개`}
                            <span className='mt-1 block'>현재 내용이 모두 교체됩니다. 체크·메모도 초기화됩니다.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={isImporting}>
                            취소
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellPrimary' size='cell' disabled={isImporting} onClick={handleImport}>
                            {isImporting ? '가져오는 중…' : '가져오기'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
