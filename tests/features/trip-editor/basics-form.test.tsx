import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { TripBasicsFormInput, TripBasicsFormValues } from '@/entities/trip/trip.validate'
import { BasicsForm } from '@/features/trip-editor/basics-form'

const DEFAULT_VALUES = {
    title: '오사카 여행 노트',
    eyebrow: null,
    destination: '오사카',
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    periodNote: null,
    disclaimer: null,
    verifiedOn: null,
    bufferPolicy: null,
    bookingNote: null,
    footerNote: null,
    destinations: [],
} satisfies TripBasicsFormInput

const ROW_ANIMATION_SETTLE_MS = 300

afterEach(cleanup)

const renderForm = (onSubmit: (values: TripBasicsFormValues) => Promise<boolean>) =>
    render(<BasicsForm defaultValues={DEFAULT_VALUES} onSubmit={onSubmit} isPending={false} />)

describe('BasicsForm', () => {
    test('기본값을 입력 필드에 채운다', () => {
        renderForm(async () => true)
        expect(screen.getByLabelText<HTMLInputElement>('제목').value).toBe('오사카 여행 노트')
        expect(screen.getByLabelText<HTMLInputElement>('목적지').value).toBe('오사카')
        expect(screen.getByLabelText<HTMLInputElement>('시작일').value).toBe('2026-10-01')
        expect(screen.getByLabelText<HTMLInputElement>('윗줄 문구').value).toBe('')
    })

    test('변경 전에는 저장 버튼이 비활성이다', () => {
        renderForm(async () => true)
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '저장' }).disabled).toBe(true)
    })

    test('제출하면 파싱된 값으로 onSubmit 을 호출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.change(screen.getByLabelText('제목'), { target: { value: '교토 여행 노트' } })
        fireEvent.change(screen.getByLabelText('윗줄 문구'), { target: { value: '2박 3일' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0]).toEqual({ ...DEFAULT_VALUES, title: '교토 여행 노트', eyebrow: '2박 3일' })
    })

    test('나라를 추가하면 목적지까지 함께 제출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.click(screen.getByRole('button', { name: '나라 추가' }))
        fireEvent.change(screen.getByLabelText('도시'), { target: { value: '오사카' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0].destinations).toEqual([{ countryCode: 'JP', city: '오사카' }])
        await new Promise((resolve) => setTimeout(resolve, ROW_ANIMATION_SETTLE_MS))
    })

    test('필수 값이 비면 오류를 보여주고 onSubmit 을 호출하지 않는다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.change(screen.getByLabelText('목적지'), { target: { value: '' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(screen.getByLabelText<HTMLInputElement>('목적지').getAttribute('aria-invalid')).toBe('true'))
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
