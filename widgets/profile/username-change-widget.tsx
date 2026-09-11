'use client'

import { useRouter } from 'next/navigation'
import { useState, type FC, type FormEvent } from 'react'
import { useChangeUsername } from '@/entities/profile/profile.query'
import { usernameChangeSchema } from '@/entities/profile/profile.validate'
import {
    USERNAME_INPUT_PLACEHOLDER,
    USERNAME_LABEL,
    USERNAME_SECTION_DESCRIPTION,
    USERNAME_SECTION_TITLE,
    USERNAME_SUBMIT_LABEL,
    USERNAME_SUBMITTING_LABEL,
} from '@/features/profile/profile.constant'
import { USERNAME_MAX_LENGTH } from '@/shared/constant/auth'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

export type UsernameChangeWidgetProps = {
    currentUsername: string | null
}

export const UsernameChangeWidget: FC<UsernameChangeWidgetProps> = ({ currentUsername }) => {
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const changeUsername = useChangeUsername()

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const parsed = usernameChangeSchema.safeParse(username)
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? null)
            return
        }
        setError(null)
        changeUsername.mutate(parsed.data, {
            onSuccess: () => {
                setUsername('')
                router.refresh()
            },
        })
    }

    return (
        <section className='flex flex-col gap-px'>
            <div className='flex min-w-0 flex-1 flex-col gap-1 bg-muted p-3'>
                <h2 className='text-sm font-medium'>{USERNAME_SECTION_TITLE}</h2>
                <p className='text-xs text-muted-foreground'>{USERNAME_SECTION_DESCRIPTION}</p>
            </div>
            <form className='flex flex-col gap-2 bg-card p-3' onSubmit={handleSubmit} noValidate>
                <label className='text-xs font-medium' htmlFor='username-change'>
                    {USERNAME_LABEL}
                </label>
                <Input
                    id='username-change'
                    className='h-10 text-sm'
                    maxLength={USERNAME_MAX_LENGTH}
                    placeholder={USERNAME_INPUT_PLACEHOLDER}
                    defaultValue={currentUsername ?? ''}
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value)
                        if (error !== null) setError(null)
                    }}
                    aria-invalid={error !== null}
                />
                {error !== null && <p className='text-xs text-destructive'>{error}</p>}
                <div className='flex flex-wrap items-stretch gap-px bg-background'>
                    <Button type='submit' variant='cellPrimary' size='cell' disabled={changeUsername.isPending}>
                        {changeUsername.isPending ? USERNAME_SUBMITTING_LABEL : USERNAME_SUBMIT_LABEL}
                    </Button>
                    <div aria-hidden className='min-w-0 flex-1 bg-card' />
                </div>
            </form>
        </section>
    )
}
