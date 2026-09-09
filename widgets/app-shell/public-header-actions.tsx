'use client'

import Link from 'next/link'
import type { FC } from 'react'
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
                    <Button size='sm' variant='ghost' asChild>
                        <Link href='/trips'>내 트립</Link>
                    </Button>
                ) : (
                    <>
                        <Button size='sm' variant='ghost' asChild>
                            <Link href='/login'>로그인</Link>
                        </Button>
                        <Button size='sm' asChild>
                            <Link href='/signup'>시작하기</Link>
                        </Button>
                    </>
                ))}
        </>
    )
}
