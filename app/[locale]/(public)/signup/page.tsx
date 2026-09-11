import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import { AuthCard } from '@/features/auth/auth-card'
import { Skeleton } from '@/shared/ui/skeleton'
import { SignupWidget } from '@/widgets/auth/signup-widget'

export const metadata: Metadata = {
    title: '회원가입',
    description: '트립 계정을 만들고 여행 일정을 관리합니다.',
}

const SignupPage = () => (
    <div className='grid min-h-[calc(100dvh-3rem)] place-items-center p-4'>
        <AuthCard
            title='회원가입'
            description='계정을 만들고 여행 일정을 정리해 보세요.'
            footer={
                <>
                    이미 계정이 있으신가요?{' '}
                    <Link className='font-medium text-foreground underline' href='/login'>
                        로그인
                    </Link>
                </>
            }>
            <Suspense fallback={<Skeleton className='h-96 w-full rounded-md' />}>
                <SignupWidget />
            </Suspense>
        </AuthCard>
    </div>
)

export default SignupPage
