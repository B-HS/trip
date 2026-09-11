import dayjs from 'dayjs'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { FC } from 'react'
import type { PublicProfile } from '@/entities/profile/profile.type'
import { PROFILE_SETTINGS_LABEL } from '@/features/profile/profile.constant'
import { TRIP_DATE_FORMAT } from '@/shared/constant/community'
import { PROFILE_SETTINGS_PATH } from '@/shared/constant/route'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'

const BANNER_SIZES = '100vw'
const POINTS_LABEL = '포인트'
const JOINED_LABEL = '가입일'

export type ProfileHeaderProps = {
    profile: PublicProfile
    username: string
    isOwner: boolean
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ profile, username, isOwner }) => (
    <header className='flex flex-col gap-px'>
        <div className='relative aspect-3/1 max-h-64 w-full bg-muted'>
            {profile.bannerUrl !== null && <Image className='object-cover' src={profile.bannerUrl} alt='' sizes={BANNER_SIZES} fill />}
        </div>
        <div className='flex flex-col gap-2 bg-card p-3'>
            <Avatar className='size-16' size='lg'>
                {profile.image !== null && <AvatarImage src={profile.image} alt='' />}
                <AvatarFallback>{profile.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <h1 className='text-2xl font-semibold tracking-tight break-keep'>{profile.name}</h1>
            <p className='font-mono text-xs text-muted-foreground'>@{username}</p>
            {profile.bio !== null && <p className='text-xs break-keep whitespace-pre-wrap text-muted-foreground'>{profile.bio}</p>}
        </div>
        <dl className='grid grid-cols-2 gap-px bg-background'>
            <div className='flex h-full flex-col items-start gap-1 bg-card p-3'>
                <dt className='text-2xs tracking-wide text-muted-foreground uppercase'>{POINTS_LABEL}</dt>
                <dd className='font-mono text-xl font-semibold tracking-tight tabular-nums'>{profile.points}</dd>
            </div>
            <div className='flex h-full flex-col items-start gap-1 bg-card p-3'>
                <dt className='text-2xs tracking-wide text-muted-foreground uppercase'>{JOINED_LABEL}</dt>
                <dd className='font-mono text-xl font-semibold tracking-tight tabular-nums'>{dayjs(profile.createdAt).format(TRIP_DATE_FORMAT)}</dd>
            </div>
        </dl>
        {isOwner && (
            <div className='flex flex-wrap items-stretch gap-px bg-background'>
                <Button variant='cell' size='cell' asChild>
                    <Link href={PROFILE_SETTINGS_PATH}>{PROFILE_SETTINGS_LABEL}</Link>
                </Button>
                <div aria-hidden className='min-w-0 flex-1 bg-card' />
            </div>
        )}
    </header>
)
