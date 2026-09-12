'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { CopyIcon, DownloadIcon, ExternalLinkIcon, UploadIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
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
    const t = useTranslations('tripEditor.share')
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
            toast.success(t('copySuccess'))
        } catch {
            toast.error(t('copyFailed'))
        }
    }
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file === undefined) return
        const template = parseTripTemplateJson(await file.text())
        if (template === null) {
            toast.error(t('invalidJson'))
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
                <EditorFormShell isDirty={isDirty} isPending={isPending} onSubmit={handleSubmit} onReset={() => form.reset()} hint={t('saveHint')}>
                    <EditorPanel title={t('publicLink')} description={t('publicLinkDescription')}>
                        <div className='flex items-center gap-2'>
                            <Switch
                                id='share-is-public'
                                checked={isPublic ?? false}
                                onCheckedChange={(checked) => form.setValue('isPublic', checked, { shouldDirty: true })}
                            />
                            <Label className='text-xs font-medium text-muted-foreground' htmlFor='share-is-public'>
                                {t('enablePublicLink')}
                            </Label>
                        </div>
                        <EditorField label={t('shareAddress')} htmlFor='share-slug' error={errors.slug?.message} hint={t('slugHint')}>
                            <Input
                                id='share-slug'
                                className={`${EDITOR_INPUT_CLASS} font-mono`}
                                placeholder='osaka-2026'
                                aria-invalid={!!errors.slug}
                                {...form.register('slug', EMPTY_TO_UNDEFINED)}
                            />
                        </EditorField>
                        <p className='font-mono text-xs break-all text-muted-foreground'>
                            {previewSlug === null || previewSlug === '' ? t('slugAfterSave') : `${APP_URL}${SHARE_PATH}${previewSlug}`}
                        </p>
                        <div className='flex w-fit flex-wrap items-stretch gap-px bg-background'>
                            <Button type='button' variant='cell' size='cell' disabled={savedUrl === null} onClick={handleCopy}>
                                <CopyIcon />
                                {t('copyLink')}
                            </Button>
                            {savedUrl === null ? (
                                <Button type='button' variant='cell' size='cell' disabled>
                                    <ExternalLinkIcon />
                                    {t('openNewTab')}
                                </Button>
                            ) : (
                                <Button variant='cell' size='cell' asChild>
                                    <a href={savedUrl} target='_blank' rel='noopener noreferrer'>
                                        <ExternalLinkIcon />
                                        {t('openNewTab')}
                                    </a>
                                </Button>
                            )}
                        </div>
                    </EditorPanel>
                </EditorFormShell>
            )}
            <EditorPanel title={t('transferTitle')} description={t('transferDescription')}>
                <div className='flex w-fit flex-wrap items-stretch gap-px bg-background'>
                    <Button type='button' variant='cell' size='cell' disabled={isExporting} onClick={onExport}>
                        <DownloadIcon />
                        {isExporting ? t('exporting') : t('export')}
                    </Button>
                    <Button type='button' variant='cell' size='cell' disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon />
                        {isImporting ? t('importing') : t('import')}
                    </Button>
                    <input ref={fileInputRef} className='hidden' type='file' accept={IMPORT_ACCEPT} onChange={handleFileChange} />
                </div>
            </EditorPanel>
            <AlertDialog open={pendingTemplate !== null} onOpenChange={() => setPendingTemplate(null)}>
                <AlertDialogContent className='rounded-none'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingTemplate === null
                                ? ''
                                : t('importSummary', {
                                      title: pendingTemplate.title,
                                      days: pendingTemplate.days.length,
                                      bookings: pendingTemplate.bookings.length,
                                  })}
                            <span className='mt-1 block'>{t('replaceWarning')}</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background sm:ml-auto sm:w-fit'>
                        <AlertDialogCancel variant='cell' size='cell' disabled={isImporting}>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant='cellPrimary' size='cell' disabled={isImporting} onClick={handleImport}>
                            {isImporting ? t('importing') : t('confirmImport')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
