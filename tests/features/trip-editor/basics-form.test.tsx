import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { TripBasicsFormInput, TripBasicsFormValues } from '@/entities/trip/trip.validate'
import { BasicsForm } from '@/features/trip-editor/basics-form'
import { TooltipProvider } from '@/shared/ui/tooltip'

const DEFAULT_VALUES = {
    title: '오사카 여행 노트',
    eyebrow: null,
    destination: '오사카',
    departureAirportCode: null,
    startDate: '2026-10-01',
    endDate: '2026-10-07',
    customNights: null,
    customDays: null,
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

const renderForm = (onSubmit: (values: TripBasicsFormValues) => Promise<boolean>, defaultValues: TripBasicsFormInput = DEFAULT_VALUES) =>
    render(
        <TooltipProvider>
            <BasicsForm defaultValues={defaultValues} onSubmit={onSubmit} isPending={false} />
        </TooltipProvider>,
    )

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

    test('박과 일 중 하나만 채우면 오류를 보여주고 onSubmit 을 호출하지 않는다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.change(screen.getByLabelText('박'), { target: { value: '6' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(screen.getByText('박과 일은 함께 입력해 주세요.')).toBeDefined())
        expect(onSubmit).not.toHaveBeenCalled()
    })

    test('박과 일을 함께 채우면 숫자로 제출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.change(screen.getByLabelText('박'), { target: { value: '7' } })
        fireEvent.change(screen.getByLabelText('일'), { target: { value: '5' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0]).toEqual({ ...DEFAULT_VALUES, customNights: 7, customDays: 5 })
    })

    test('출발 공항이 없으면 빈 채로 두고 안내 문구를 보여준다', () => {
        renderForm(async () => true)
        expect(screen.getByLabelText<HTMLInputElement>('출발 공항').value).toBe('')
        expect(screen.getByText('고르지 않으면 기본 ICN 으로 계산합니다.')).toBeDefined()
    })

    test('고른 출발 공항을 비우면 null 로 제출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        const { container } = renderForm(onSubmit, { ...DEFAULT_VALUES, departureAirportCode: 'KIX' })
        fireEvent.click(container.querySelector<HTMLButtonElement>('[data-slot="combobox-clear"]')!)

        await waitFor(() => expect(screen.getByLabelText<HTMLInputElement>('출발 공항').value).toBe(''))
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0].departureAirportCode).toBeNull()
    })

    test('저장된 출발 공항을 보여주고 그대로 제출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit, { ...DEFAULT_VALUES, departureAirportCode: 'KIX' })
        expect(screen.getByLabelText<HTMLInputElement>('출발 공항').value).toBe('KIX · 칸사이(오사카)')
        fireEvent.change(screen.getByLabelText('제목'), { target: { value: '교토 여행 노트' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0].departureAirportCode).toBe('KIX')
    })

    test('출발 공항을 고르면 코드로 제출한다', async () => {
        const onSubmit = mock(async (values: TripBasicsFormValues) => values.title.length > 0)
        renderForm(onSubmit)
        fireEvent.click(within(screen.getByLabelText('출발 공항').parentElement!).getByRole('button'))

        await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0))
        fireEvent.change(screen.getByLabelText('출발 공항'), { target: { value: '김해' } })
        await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
        fireEvent.click(screen.getAllByRole('option')[0]!)

        await waitFor(() => expect(screen.getByLabelText<HTMLInputElement>('출발 공항').value).toBe('PUS · 김해(부산)'))
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0].departureAirportCode).toBe('PUS')
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
