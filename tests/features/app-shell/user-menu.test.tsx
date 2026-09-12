import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'

const Passthrough = ({ children }: PropsWithChildren) => <div>{children}</div>

const DropdownMenuItem = ({ children, asChild, onSelect }: PropsWithChildren<{ asChild?: boolean; onSelect?: () => void }>) =>
    asChild ? <div>{children}</div> : <button onClick={onSelect}>{children}</button>

mock.module('@/shared/ui/dropdown-menu', () => ({
    DropdownMenu: Passthrough,
    DropdownMenuContent: Passthrough,
    DropdownMenuItem,
    DropdownMenuLabel: Passthrough,
    DropdownMenuSeparator: () => null,
    DropdownMenuSub: Passthrough,
    DropdownMenuSubContent: Passthrough,
    DropdownMenuSubTrigger: Passthrough,
    DropdownMenuTrigger: ({ children, ...props }: PropsWithChildren<ComponentProps<'button'>>) => <button {...props}>{children}</button>,
}))
mock.module('@/shared/ui/theme-toggle', () => ({ ThemeToggle: () => null }))
mock.module('@/shared/hooks/use-motion-preference', () => ({ setMotionPreference: () => {}, useMotionPreference: () => 'full' }))

const { UserMenu } = await import('@/features/app-shell/user-menu')

afterEach(cleanup)

describe('UserMenu', () => {
    test('설정 메뉴에 API 토큰 관리 링크를 AI·프로필 설정과 함께 표시한다', () => {
        render(<UserMenu name='지수' email='jisu@example.com' username='jisu' image={null} isCollapsed={false} onSignOut={() => {}} />)

        expect(screen.getByRole('link', { name: '프로필 설정' }).getAttribute('href')).toBe('/settings/profile')
        expect(screen.getByRole('link', { name: 'AI 설정' }).getAttribute('href')).toBe('/settings/ai')
        expect(screen.getByRole('link', { name: 'API 토큰' }).getAttribute('href')).toBe('/settings/api')
    })
})
