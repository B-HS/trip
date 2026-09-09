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
                    <div className='flex items-stretch gap-px bg-background'>
                        <Button variant='cell' size='cell' asChild>
                            <Link href='/trips'>내 트립</Link>
                        </Button>
                    </div>
                ) : (
                    <div className='flex items-stretch gap-px bg-background'>
                        <Button variant='cell' size='cell' asChild>
                            <Link href='/login'>로그인</Link>
                        </Button>
                        <Button variant='cellPrimary' size='cell' asChild>
                            <Link href='/signup'>시작하기</Link>
                        </Button>
                    </div>
                ))}
        </>
    )
}
