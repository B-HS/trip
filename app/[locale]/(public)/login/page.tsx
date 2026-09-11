import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { AuthCard } from '@/features/auth/auth-card'
import { Skeleton } from '@/shared/ui/skeleton'
import { LoginWidget } from '@/widgets/auth/login-widget'

export const metadata: Metadata = {
    title: '로그인',
    description: '이메일 또는 사용자명으로 트립에 로그인합니다.',
}

const LoginPage = () => (
    <div className='grid min-h-[calc(100dvh-3rem)] place-items-center p-4'>
        <AuthCard
            title='로그인'
            description='이메일 또는 사용자명으로 로그인해 주세요.'
            footer={
                <>
                    아직 계정이 없으신가요?{' '}
                    <Link className='font-medium text-foreground underline' href='/signup'>
                        회원가입
                    </Link>
                </>
            }>
            <Suspense fallback={<Skeleton className='h-56 w-full rounded-md' />}>
                <LoginWidget />
            </Suspense>
        </AuthCard>
    </div>
)

export default LoginPage
