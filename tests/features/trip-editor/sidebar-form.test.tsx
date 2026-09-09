import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { SidebarInput, SidebarValues } from '@/entities/trip/trip.validate'
import { SidebarForm } from '@/features/trip-editor/sidebar-form'

const DEFAULT_VALUES = { sidebarNote: null, links: [] } satisfies SidebarInput

const ROW_ANIMATION_SETTLE_MS = 300

afterEach(cleanup)

const renderForm = (onSubmit: (values: SidebarValues) => Promise<boolean>) =>
    render(<SidebarForm defaultValues={DEFAULT_VALUES} onSubmit={onSubmit} isPending={false} />)

const settleRows = () => new Promise((resolve) => setTimeout(resolve, ROW_ANIMATION_SETTLE_MS))

describe('SidebarForm', () => {
    test('링크가 없으면 빈 안내를 보여준다', () => {
        renderForm(async () => true)
        expect(screen.getByText('등록된 링크가 없습니다.')).toBeDefined()
    })

    test('변경 전에는 저장 버튼이 비활성이다', () => {
        renderForm(async () => true)
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '저장' }).disabled).toBe(true)
    })

    test('소개 문구와 링크를 함께 제출한다', async () => {
        const onSubmit = mock<(values: SidebarValues) => Promise<boolean>>(async () => true)
        renderForm(onSubmit)
        fireEvent.change(screen.getByLabelText('소개 문구'), { target: { value: '예매 링크를 모아 두었습니다.' } })
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        fireEvent.change(screen.getByLabelText('라벨'), { target: { value: '공식 예매' } })
        fireEvent.change(screen.getByLabelText('주소'), { target: { value: 'https://ticket.example.com' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0]).toEqual({
            sidebarNote: '예매 링크를 모아 두었습니다.',
            links: [{ label: '공식 예매', url: 'https://ticket.example.com', description: null }],
        })
        await settleRows()
    })

    test('http 가 아닌 주소는 오류를 보여주고 onSubmit 을 호출하지 않는다', async () => {
        const onSubmit = mock<(values: SidebarValues) => Promise<boolean>>(async () => true)
        renderForm(onSubmit)
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        fireEvent.change(screen.getByLabelText('라벨'), { target: { value: '안내' } })
        fireEvent.change(screen.getByLabelText('주소'), { target: { value: 'javascript:alert(1)' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(screen.getByText('링크는 http 또는 https 주소여야 합니다.')).toBeDefined())
        expect(onSubmit).not.toHaveBeenCalled()
        await settleRows()
    })

    test('추가한 링크를 삭제하면 빈 안내로 돌아간다', async () => {
        renderForm(async () => true)
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        expect(screen.getByLabelText('라벨')).toBeDefined()
        fireEvent.click(screen.getByRole('button', { name: '링크 삭제' }))

        await waitFor(() => expect(screen.getByText('등록된 링크가 없습니다.')).toBeDefined())
        await settleRows()
    })
})
