'use client'

import Link from 'next/link'
import type { FC } from 'react'
import { BOARDS_PATH, EXPLORE_PATH, HOME_PATH, LOGIN_PATH, SIGNUP_PATH } from '@/shared/constant/route'
import { useSession } from '@/shared/lib/auth-client'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

export const PublicHeaderActions: FC = () => {
    const { data: session, isPending } = useSession()

    return (
        <>
            <ThemeToggle />
            {!isPending &&
                (session ? (
                    <div className='flex items-stretch gap-px bg-background'>
                        <Button variant='cell' size='cell' asChild>
                            <Link href={HOME_PATH}>홈</Link>
                        </Button>
                    </div>
                ) : (
                    <div className='flex items-stretch gap-px bg-background'>
                        <Button variant='cell' size='cell' asChild>
                            <Link href={EXPLORE_PATH}>탐색</Link>
                        </Button>
                        <Button variant='cell' size='cell' asChild>
                            <Link href={BOARDS_PATH}>게시판</Link>
                        </Button>
                        <Button variant='cell' size='cell' asChild>
                            <Link href={LOGIN_PATH}>로그인</Link>
                        </Button>
                        <Button variant='cellPrimary' size='cell' asChild>
                            <Link href={SIGNUP_PATH}>시작하기</Link>
                        </Button>
                    </div>
                ))}
        </>
    )
}
