'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2Icon, UserPlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import type { TripInviteView, TripMemberView } from '@/entities/trip/trip.type'
import { memberInviteSchema, type MemberInviteInput, type MemberRoleInput } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import type { MemberInviteValues } from '@/features/trip-editor/editor-schema'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const ASSIGNABLE_ROLES = ['editor', 'viewer'] as const satisfies MemberRoleInput[]
const SKELETON_ROWS = [0, 1, 2]

type MembersPanelProps = {
    members: TripMemberView[]
    invites: TripInviteView[]
    isLoading: boolean
    isPending: boolean
    onInvite: EditorSubmit<MemberInviteValues>
    onChangeRole: (userId: string, role: MemberRoleInput) => void
    onRemoveMember: (userId: string) => void
    onRemoveInvite: (inviteId: string) => void
}

export const MembersPanel: FC<MembersPanelProps> = ({
    members,
    invites,
    isLoading,
    isPending,
    onInvite,
    onChangeRole,
    onRemoveMember,
    onRemoveInvite,
}) => {
    const t = useTranslations('tripEditor.members')
    const [removingUserId, setRemovingUserId] = useState<string | null>(null)
    const form = useForm<MemberInviteInput, unknown, MemberInviteValues>({
        resolver: zodResolver(memberInviteSchema),
        defaultValues: { email: '', role: 'editor' },
    })

    const { errors } = form.formState
    const removingMember = members.find((member) => member.userId === removingUserId)
    const handleSubmit = form.handleSubmit(async (values) => {
        const isSaved = await onInvite(values)
        if (isSaved) form.reset()
    })
    const handleRemove = () => {
        if (removingUserId === null) return
        onRemoveMember(removingUserId)
        setRemovingUserId(null)
    }

    return (
        <div className='flex flex-col gap-px bg-background'>
            <EditorPanel title={t('title')} description={t('description')} count={members.length}>
                {isLoading ? (
                    <div className='flex flex-col gap-2'>
                        {SKELETON_ROWS.map((row) => (
                            <Skeleton key={row} className='h-8 w-full' />
                        ))}
                    </div>
                ) : (
                    <Table className='text-xs'>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='h-8 w-40 text-xs text-muted-foreground'>{t('name')}</TableHead>
                                <TableHead className='h-8 text-xs text-muted-foreground'>{t('email')}</TableHead>
                                <TableHead className='h-8 w-32 text-xs text-muted-foreground'>{t('role')}</TableHead>
                                <TableHead className='h-8 w-16 text-xs text-muted-foreground'>{t('manage')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.userId}>
                                    <TableCell className='truncate'>{member.name}</TableCell>
                                    <TableCell className='max-w-0 truncate font-mono'>{member.email}</TableCell>
                                    <TableCell>
                                        {member.role === 'owner' ? (
                                            <Badge variant='secondary'>{t('roles.owner')}</Badge>
                                        ) : (
                                            <NativeSelect
                                                className='w-full'
                                                size='sm'
                                                aria-label={t('roleAria', { name: member.name })}
                                                value={member.role}
                                                disabled={isPending}
                                                onChange={(event) =>
                                                    onChangeRole(member.userId, event.target.value === 'viewer' ? 'viewer' : 'editor')
                                                }>
                                                {ASSIGNABLE_ROLES.map((role) => (
                                                    <NativeSelectOption key={role} value={role}>
                                                        {t(`roles.${role}`)}
                                                    </NativeSelectOption>
                                                ))}
                                            </NativeSelect>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {member.role !== 'owner' && (
                                            <Button
                                                className='size-6'
                                                type='button'
                                                variant='ghost'
                                                size='icon-xs'
                                                aria-label={t('removeAria', { name: member.name })}
                                                disabled={isPending}
                                                onClick={() => setRemovingUserId(member.userId)}>
                                                <Trash2Icon />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </EditorPanel>
            <EditorPanel title={t('inviteTitle')} description={t('inviteDescription')} count={invites.length}>
                <form className='flex flex-wrap items-end gap-3' onSubmit={handleSubmit} noValidate>
                    <EditorField label={t('email')} htmlFor='invite-email' error={errors.email?.message} className='min-w-48 flex-1'>
                        <Input
                            id='invite-email'
                            className={EDITOR_INPUT_CLASS}
                            type='email'
                            placeholder='trip@example.com'
                            autoComplete='email'
                            aria-invalid={!!errors.email}
                            {...form.register('email')}
                        />
                    </EditorField>
                    <EditorField label={t('role')} htmlFor='invite-role' error={errors.role?.message} className='w-32 flex-none'>
                        <NativeSelect id='invite-role' className='w-full' size='sm' aria-invalid={!!errors.role} {...form.register('role')}>
                            {ASSIGNABLE_ROLES.map((role) => (
                                <NativeSelectOption key={role} value={role}>
                                    {t(`roles.${role}`)}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </EditorField>
                    <div className='flex gap-px bg-background'>
                        <Button type='submit' variant='cellPrimary' size='cell' disabled={isPending}>
                            <UserPlusIcon />
                            {isPending ? t('saving') : t('invite')}
                        </Button>
                    </div>
                </form>
                {invites.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>{t('noInvites')}</p>
                ) : (
                    <ul className='flex flex-col gap-2'>
                        {invites.map((invite) => (
                            <li key={invite.id} className='flex items-center justify-between gap-2 text-xs'>
                                <span className='min-w-0 flex-1 truncate font-mono'>{invite.email}</span>
                                <Badge variant='outline'>{t(`roles.${invite.role}`)}</Badge>
                                <Button
                                    className='size-6'
                                    type='button'
                                    variant='ghost'
                                    size='icon-xs'
                                    aria-label={t('cancelInviteAria', { email: invite.email })}
                                    disabled={isPending}
                                    onClick={() => onRemoveInvite(invite.id)}>
                                    <Trash2Icon />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </EditorPanel>
            <AlertDialog open={removingUserId !== null} onOpenChange={(isOpen) => !isOpen && setRemovingUserId(null)}>
                <AlertDialogContent size='sm'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('removeTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {removingMember === undefined ? t('removeDefault') : t('removeDescription', { name: removingMember.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='gap-px bg-background'>
                        <AlertDialogCancel variant='cell' size='cell'>
                            {t('cancel')}
                        </AlertDialogCancel>
                        <Button type='button' variant='cellDestructive' size='cell' disabled={isPending} onClick={handleRemove}>
                            {t('remove')}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
