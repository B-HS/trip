'use client'

import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
    useExportTrip,
    useImportTrip,
    useInviteMember,
    useRemoveInvite,
    useRemoveMember,
    useTripMembers,
    useUpdateMemberRole,
    useUpdateShareSettings,
} from '@/entities/trip/trip.query'
import type { ShareSettingsValues } from '@/entities/trip/trip.validate'
import type { MemberInviteValues } from '@/features/trip-editor/editor-schema'
import { MembersPanel } from '@/features/trip-editor/members-panel'
import { SharePanel } from '@/features/trip-editor/share-panel'
import type { TripTemplate } from '@/shared/lib/trip-template'
import { toShareDefaults } from '@/widgets/trip-editor/trip-editor.mapper'
import type { TripEditorTabProps } from '@/widgets/trip-editor/trip-editor.type'

const JSON_INDENT = 4
const EXPORT_MIME_TYPE = 'application/json'

export const ShareTab: FC<TripEditorTabProps> = ({ tripId, detail, onSaved }) => {
    const t = useTranslations('tripEditor')
    const isOwner = detail.viewerRole === 'owner'
    const members = useTripMembers(isOwner ? tripId : '')
    const updateShareSettings = useUpdateShareSettings(tripId)
    const inviteMember = useInviteMember(tripId)
    const updateMemberRole = useUpdateMemberRole(tripId)
    const removeMember = useRemoveMember(tripId)
    const removeInvite = useRemoveInvite(tripId)
    const exportTrip = useExportTrip(tripId)
    const importTrip = useImportTrip(tripId)

    const isMemberPending = inviteMember.isPending || updateMemberRole.isPending || removeMember.isPending || removeInvite.isPending
    const handleShareSubmit = async (values: ShareSettingsValues) => {
        try {
            await updateShareSettings.mutateAsync(values)
            onSaved()
            return true
        } catch {
            return false
        }
    }
    const handleInvite = async (values: MemberInviteValues) => {
        try {
            await inviteMember.mutateAsync(values)
            return true
        } catch {
            return false
        }
    }
    const handleExport = async () => {
        const template = await exportTrip.mutateAsync().catch(() => null)
        if (template === null) return
        const url = URL.createObjectURL(new Blob([JSON.stringify(template, null, JSON_INDENT)], { type: EXPORT_MIME_TYPE }))
        const link = document.createElement('a')
        link.href = url
        link.download = `trip-${detail.shareSlug ?? detail.id}.json`
        link.click()
        URL.revokeObjectURL(url)
        toast.success(t('exportSuccess'))
    }
    const handleImport = async (template: TripTemplate) => {
        try {
            await importTrip.mutateAsync(template)
            onSaved()
            return true
        } catch {
            return false
        }
    }

    return (
        <div className='flex flex-col gap-px bg-background'>
            <SharePanel
                canManage={isOwner}
                defaultValues={toShareDefaults(detail)}
                savedSlug={detail.shareSlug}
                onSubmit={handleShareSubmit}
                onExport={handleExport}
                onImport={handleImport}
                isPending={updateShareSettings.isPending}
                isExporting={exportTrip.isPending}
                isImporting={importTrip.isPending}
            />
            {isOwner && (
                <MembersPanel
                    members={members.data?.members ?? []}
                    invites={members.data?.invites ?? []}
                    isLoading={members.isLoading}
                    isPending={isMemberPending}
                    onInvite={handleInvite}
                    onChangeRole={(userId, role) => updateMemberRole.mutate({ userId, role })}
                    onRemoveMember={(userId) => removeMember.mutate(userId)}
                    onRemoveInvite={(inviteId) => removeInvite.mutate(inviteId)}
                />
            )}
        </div>
    )
}
