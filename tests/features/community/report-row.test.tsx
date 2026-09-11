import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps, PropsWithChildren } from 'react'
import type { ReportView } from '@/entities/community/community.type'

const LinkStub = ({ href, children, ...props }: PropsWithChildren<{ href: string }> & ComponentProps<'a'>) => (
    <a href={href} {...props}>
        {children}
    </a>
)

mock.module('next/link', () => ({ default: LinkStub }))

const { ReportRow } = await import('@/features/community/report-row')

const BASE_REPORT: ReportView = {
    id: 'report-1',
    kind: 'post',
    targetId: 'post-1',
    reason: 'spam',
    memo: '도배가 심합니다.',
    status: 'open',
    reporter: { id: 'user-2', name: '지연', username: 'jiyeon', image: null },
    targetLabel: '오사카 여행 후기',
    createdAt: '2026-09-11T04:05:00.000Z',
}

const noop = () => {}

const renderRow = (report: ReportView) =>
    render(<ReportRow report={report} isPending={false} onHide={noop} onDismiss={noop} onBan={noop} onUnban={noop} onRestore={noop} />)

afterEach(cleanup)

describe('ReportRow', () => {
    test('대상 미리보기·사유·신고자를 보여준다', () => {
        renderRow(BASE_REPORT)

        expect(screen.getByText('오사카 여행 후기')).toBeDefined()
        expect(screen.getByText('스팸')).toBeDefined()
        expect(screen.getByRole('link', { name: '지연' }).getAttribute('href')).toBe('/u/jiyeon')
    })

    test('글 신고는 숨김·복구 셀을 보여준다', () => {
        renderRow(BASE_REPORT)

        expect(screen.getByRole('button', { name: '숨김' })).toBeDefined()
        expect(screen.getByRole('button', { name: '게시글 복구' })).toBeDefined()
        expect(screen.queryByRole('button', { name: '차단해제' })).toBeNull()
    })

    test('댓글 신고는 복구를 숨긴다', () => {
        renderRow({ ...BASE_REPORT, kind: 'comment', targetId: 'comment-1' })

        expect(screen.getByRole('button', { name: '숨김' })).toBeDefined()
        expect(screen.queryByRole('button', { name: '게시글 복구' })).toBeNull()
    })

    test('사용자 신고는 차단해제만 보여주고 숨김·복구는 숨긴다', () => {
        renderRow({ ...BASE_REPORT, kind: 'user', targetId: 'user-3' })

        expect(screen.getByRole('button', { name: '차단해제' })).toBeDefined()
        expect(screen.queryByRole('button', { name: '숨김' })).toBeNull()
        expect(screen.queryByRole('button', { name: '게시글 복구' })).toBeNull()
    })

    test('모든 신고에 기각·차단 셀을 보여준다', () => {
        renderRow(BASE_REPORT)

        expect(screen.getByRole('button', { name: '기각' })).toBeDefined()
        expect(screen.getByRole('button', { name: '차단' })).toBeDefined()
    })

    test('대기 중이면 모든 액션 셀이 비활성화된다', () => {
        render(<ReportRow report={BASE_REPORT} isPending onHide={noop} onDismiss={noop} onBan={noop} onUnban={noop} onRestore={noop} />)

        screen.getAllByRole('button').forEach((button) => expect(button.hasAttribute('disabled')).toBe(true))
    })

    test('버튼을 누르면 각 핸들러를 부른다', () => {
        const calls: string[] = []
        render(
            <ReportRow
                report={BASE_REPORT}
                isPending={false}
                onHide={() => calls.push('hide')}
                onDismiss={() => calls.push('dismiss')}
                onBan={() => calls.push('ban')}
                onUnban={() => calls.push('unban')}
                onRestore={() => calls.push('restore')}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: '숨김' }))
        fireEvent.click(screen.getByRole('button', { name: '기각' }))
        fireEvent.click(screen.getByRole('button', { name: '게시글 복구' }))

        expect(calls).toEqual(['hide', 'dismiss', 'restore'])
    })
})
