'use client'
'use no memo'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2Icon, UserPlusIcon } from 'lucide-react'
import { useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import type { TripInviteView, TripMemberView } from '@/entities/trip/trip.type'
import { memberInviteSchema, type MemberInviteInput, type MemberRoleInput } from '@/entities/trip/trip.validate'
import { EditorField } from '@/features/trip-editor/editor-field'
import { EDITOR_INPUT_CLASS, type EditorSubmit } from '@/features/trip-editor/editor-form'
import { EditorPanel } from '@/features/trip-editor/editor-panel'
import type { MemberInviteValues } from '@/features/trip-editor/editor-schema'
import { MEMBER_ROLE_LABEL } from '@/shared/constant/trip'
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
            <EditorPanel title='멤버' description='편집자는 내용을 수정할 수 있고, 열람자는 보기만 가능합니다.' count={members.length}>
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
                                <TableHead className='h-8 w-40 text-xs text-muted-foreground'>이름</TableHead>
                                <TableHead className='h-8 text-xs text-muted-foreground'>이메일</TableHead>
                                <TableHead className='h-8 w-32 text-xs text-muted-foreground'>권한</TableHead>
                                <TableHead className='h-8 w-16 text-xs text-muted-foreground'>관리</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.userId}>
                                    <TableCell className='truncate'>{member.name}</TableCell>
                                    <TableCell className='max-w-0 truncate font-mono'>{member.email}</TableCell>
                                    <TableCell>
                                        {member.role === 'owner' ? (
                                            <Badge variant='secondary'>{MEMBER_ROLE_LABEL.owner}</Badge>
                                        ) : (
                                            <NativeSelect
                                                className='w-full'
                                                size='sm'
                                                aria-label={`${member.name} 권한`}
                                                value={member.role}
                                                disabled={isPending}
                                                onChange={(event) =>
                                                    onChangeRole(member.userId, event.target.value === 'viewer' ? 'viewer' : 'editor')
                                                }>
                                                {ASSIGNABLE_ROLES.map((role) => (
                                                    <NativeSelectOption key={role} value={role}>
                                                        {MEMBER_ROLE_LABEL[role]}
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
                                                aria-label={`${member.name} 삭제`}
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
            <EditorPanel title='초대' description='가입하지 않은 이메일로 초대하면 가입 시 자동으로 참여합니다.' count={invites.length}>
                <form className='flex flex-wrap items-end gap-3' onSubmit={handleSubmit} noValidate>
                    <EditorField label='이메일' htmlFor='invite-email' error={errors.email?.message} className='min-w-48 flex-1'>
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
                    <EditorField label='권한' htmlFor='invite-role' error={errors.role?.message} className='w-32 flex-none'>
                        <NativeSelect id='invite-role' className='w-full' size='sm' aria-invalid={!!errors.role} {...form.register('role')}>
                            {ASSIGNABLE_ROLES.map((role) => (
                                <NativeSelectOption key={role} value={role}>
                                    {MEMBER_ROLE_LABEL[role]}
                                </NativeSelectOption>
                            ))}
                        </NativeSelect>
                    </EditorField>
                    <Button type='submit' size='sm' disabled={isPending}>
                        <UserPlusIcon />
                        {isPending ? '저장 중…' : '초대'}
                    </Button>
                </form>
                {invites.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>대기 중인 초대가 없습니다.</p>
                ) : (
                    <ul className='flex flex-col gap-2'>
                        {invites.map((invite) => (
                            <li key={invite.id} className='flex items-center justify-between gap-2 text-xs'>
                                <span className='min-w-0 flex-1 truncate font-mono'>{invite.email}</span>
                                <Badge variant='outline'>{MEMBER_ROLE_LABEL[invite.role]}</Badge>
                                <Button
                                    className='size-6'
                                    type='button'
                                    variant='ghost'
                                    size='icon-xs'
                                    aria-label={`${invite.email} 초대 취소`}
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
                        <AlertDialogTitle>멤버를 삭제할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {removingMember === undefined
                                ? '이 멤버는 더 이상 여행을 볼 수 없습니다.'
                                : `${removingMember.name} 님은 더 이상 이 여행을 볼 수 없습니다.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <Button type='button' variant='destructive' disabled={isPending} onClick={handleRemove}>
                            삭제
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
