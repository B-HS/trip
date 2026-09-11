import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { PostAuthor } from '@/entities/community/community.type'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { BlockedUsersSection } = await import('@/features/profile/blocked-users-section')

const USERS: PostAuthor[] = [
    { id: 'user-1', name: '현석', username: 'hyunseok', image: null },
    { id: 'user-2', name: '지연', username: 'jiyeon', image: null },
]

afterEach(cleanup)

describe('BlockedUsersSection', () => {
    test('목록이 비면 빈 문구를 보여준다', () => {
        render(<BlockedUsersSection users={[]} isPending={false} onUnblock={() => {}} />)

        expect(screen.getByText('차단한 사용자가 없습니다.')).toBeDefined()
        expect(screen.queryByRole('button')).toBeNull()
    })

    test('차단한 사용자마다 차단해제 셀을 보여준다', () => {
        render(<BlockedUsersSection users={USERS} isPending={false} onUnblock={() => {}} />)

        expect(screen.getAllByRole('button', { name: '차단 해제' })).toHaveLength(2)
    })

    test('차단해제 셀을 누르면 해당 사용자 id를 넘긴다', () => {
        const calls: string[] = []
        render(<BlockedUsersSection users={USERS} isPending={false} onUnblock={(id) => calls.push(id)} />)

        fireEvent.click(screen.getAllByRole('button', { name: '차단 해제' })[0])

        expect(calls).toEqual(['user-1'])
    })

    test('대기 중이면 차단해제 셀이 비활성화된다', () => {
        render(<BlockedUsersSection users={USERS} isPending onUnblock={() => {}} />)

        screen.getAllByRole('button').forEach((button) => expect(button.hasAttribute('disabled')).toBe(true))
    })
})
