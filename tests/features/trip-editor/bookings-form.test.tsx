import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { BookingInput, BookingValues } from '@/entities/trip/trip.validate'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { BookingsForm } from '@/features/trip-editor/bookings-form'
import { TooltipProvider } from '@/shared/ui/tooltip'

const UPLOAD_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
const UPLOADED_URL = 'https://cdn.example.com/uploads/booking/2026/photo.jpg'
const BOOKING_TITLE = '키린 코베공장'
const ROW_ANIMATION_SETTLE_MS = 300

const DEFAULT_VALUES = [] satisfies BookingInput[]

type RenderOptions = {
    onSubmit?: (values: BookingValues[]) => Promise<boolean>
    isUploadEnabled?: boolean
    onUploadImage?: (file: File) => Promise<UploadedImage | null>
}

const renderForm = ({ onSubmit = async () => true, isUploadEnabled = true, onUploadImage = async () => null }: RenderOptions = {}) =>
    render(
        <TooltipProvider>
            <BookingsForm
                defaultValues={DEFAULT_VALUES}
                onSubmit={onSubmit}
                isPending={false}
                isUploadEnabled={isUploadEnabled}
                isUploading={false}
                onUploadImage={onUploadImage}
            />
        </TooltipProvider>,
    )

const addBooking = () => {
    fireEvent.click(screen.getByRole('button', { name: '예매 추가' }))
    fireEvent.change(screen.getByLabelText('항목'), { target: { value: BOOKING_TITLE } })
}

const settleRows = () => new Promise((resolve) => setTimeout(resolve, ROW_ANIMATION_SETTLE_MS))

afterEach(cleanup)

describe('BookingsForm 첨부', () => {
    test('예매 행에 첨부 개수를 보여준다', async () => {
        renderForm()
        addBooking()
        expect(screen.getByText('첨부 0')).toBeDefined()
        await settleRows()
    })

    test('링크 첨부를 추가해 라벨과 주소를 제출한다', async () => {
        const onSubmit = mock<(values: BookingValues[]) => Promise<boolean>>(async () => true)
        renderForm({ onSubmit })
        addBooking()
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        fireEvent.change(screen.getByLabelText('첨부 라벨'), { target: { value: '예매 확인 메일' } })
        fireEvent.change(screen.getByLabelText('첨부 주소'), { target: { value: 'https://ticket.example.com' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0][0]?.attachments).toEqual([
            { kind: 'link', url: 'https://ticket.example.com', label: '예매 확인 메일', uploadId: null },
        ])
        await settleRows()
    })

    test('http 가 아닌 첨부 주소는 오류를 보여주고 제출하지 않는다', async () => {
        const onSubmit = mock<(values: BookingValues[]) => Promise<boolean>>(async () => true)
        renderForm({ onSubmit })
        addBooking()
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        fireEvent.change(screen.getByLabelText('첨부 주소'), { target: { value: 'javascript:alert(1)' } })
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(screen.getByText('첨부 주소는 http 또는 https 주소여야 합니다.')).toBeDefined())
        expect(onSubmit).not.toHaveBeenCalled()
        await settleRows()
    })

    test('업로드가 성공하면 이미지 첨부 행을 추가해 제출한다', async () => {
        const onSubmit = mock<(values: BookingValues[]) => Promise<boolean>>(async () => true)
        const onUploadImage = mock<(file: File) => Promise<UploadedImage | null>>(async () => ({ id: UPLOAD_ID, url: UPLOADED_URL }))
        renderForm({ onSubmit, onUploadImage })
        addBooking()
        fireEvent.change(screen.getByLabelText('첨부 이미지 파일 선택'), {
            target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
        })

        await waitFor(() => expect(screen.getByText('첨부 1')).toBeDefined())
        expect(onUploadImage).toHaveBeenCalledTimes(1)
        expect(screen.getByLabelText<HTMLInputElement>('이미지 주소').value).toBe(UPLOADED_URL)
        fireEvent.click(screen.getByRole('button', { name: '저장' }))

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
        expect(onSubmit.mock.calls[0]![0][0]?.attachments).toEqual([{ kind: 'image', url: UPLOADED_URL, label: null, uploadId: UPLOAD_ID }])
        await settleRows()
    })

    test('저장소가 설정되지 않으면 업로드 버튼을 막고 안내한다', async () => {
        renderForm({ isUploadEnabled: false })
        addBooking()
        expect(screen.getByRole<HTMLButtonElement>('button', { name: '이미지 업로드' }).disabled).toBe(true)
        expect(screen.getByText('저장소가 설정되지 않았습니다.')).toBeDefined()
        await settleRows()
    })

    test('첨부 삭제 버튼으로 행을 지운다', async () => {
        renderForm()
        addBooking()
        fireEvent.click(screen.getByRole('button', { name: '링크 추가' }))
        expect(screen.getByText('첨부 1')).toBeDefined()
        fireEvent.click(screen.getByRole('button', { name: '첨부 삭제' }))

        await waitFor(() => expect(screen.getByText('첨부 0')).toBeDefined())
        await settleRows()
    })
})
