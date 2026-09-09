import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { UploadedImage } from '@/entities/upload/upload.type'
import { RichEditor } from '@/features/editor/rich-editor'
import {
    RICH_EDITOR_DIALOG_CONFIRM,
    RICH_EDITOR_FILE_INPUT_LABEL,
    RICH_EDITOR_LABEL,
    RICH_EDITOR_LINK_DIALOG,
    RICH_EDITOR_YOUTUBE_DIALOG,
} from '@/features/editor/rich-editor.constant'
import { UPLOAD_DISABLED_HINT } from '@/shared/constant/upload'
import type { RichTextDocument } from '@/shared/lib/rich-text-document'
import { TooltipProvider } from '@/shared/ui/tooltip'

const EDITOR_LABEL = '본문'
const UPLOAD_ID = 'upload-1'
const UPLOADED_URL = 'https://cdn.example.com/photo.jpg'
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const UPPERCASE_LINK_URL = 'HTTPS://example.com'

type RenderOptions = {
    content?: RichTextDocument | null
    onChange?: (doc: RichTextDocument) => void
    isUploadEnabled?: boolean
    isUploading?: boolean
    onUploadImage?: (file: File) => Promise<UploadedImage | null>
}

afterEach(cleanup)

const renderEditor = ({
    content = null,
    onChange = () => {},
    isUploadEnabled = true,
    isUploading = false,
    onUploadImage = async () => ({ id: UPLOAD_ID, url: UPLOADED_URL }),
}: RenderOptions = {}) =>
    render(
        <TooltipProvider>
            <RichEditor
                content={content}
                onChange={onChange}
                label={EDITOR_LABEL}
                isUploadEnabled={isUploadEnabled}
                isUploading={isUploading}
                onUploadImage={onUploadImage}
            />
        </TooltipProvider>,
    )

const findToolbar = () => screen.findByRole('button', { name: RICH_EDITOR_LABEL.bold })

const selectImageFile = () =>
    fireEvent.change(screen.getByLabelText(RICH_EDITOR_FILE_INPUT_LABEL), {
        target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    })

describe('RichEditor', () => {
    test('본문 영역에 aria-label 과 rich-text 클래스를 붙인다', async () => {
        renderEditor()
        const content = await screen.findByLabelText(EDITOR_LABEL)

        expect(content.className).toContain('rich-text')
    })

    test('툴바 셀 14개를 라벨과 함께 보여준다', async () => {
        renderEditor()
        await findToolbar()

        expect(screen.getAllByRole('button')).toHaveLength(Object.keys(RICH_EDITOR_LABEL).length)
        Object.values(RICH_EDITOR_LABEL).forEach((label) => expect(screen.getByRole('button', { name: label })).toBeDefined())
    })

    test('되돌리기와 다시하기는 처음에 비활성이다', async () => {
        renderEditor()
        await findToolbar()

        expect(screen.getByRole<HTMLButtonElement>('button', { name: RICH_EDITOR_LABEL.undo }).disabled).toBe(true)
        expect(screen.getByRole<HTMLButtonElement>('button', { name: RICH_EDITOR_LABEL.redo }).disabled).toBe(true)
    })

    test('저장소가 설정되지 않으면 이미지 셀을 비활성화한다', async () => {
        renderEditor({ isUploadEnabled: false })
        await findToolbar()

        expect(screen.getByRole<HTMLButtonElement>('button', { name: RICH_EDITOR_LABEL.image }).disabled).toBe(true)
    })

    test('비활성 이미지 셀에도 툴팁으로 이유를 알린다', async () => {
        renderEditor({ isUploadEnabled: false })
        fireEvent.focusIn(await screen.findByRole('button', { name: RICH_EDITOR_LABEL.image }))

        await waitFor(() => expect(screen.getAllByText(UPLOAD_DISABLED_HINT).length).toBeGreaterThan(0))
    })

    test('업로드 중이면 이미지 셀을 비활성화한다', async () => {
        renderEditor({ isUploading: true })
        await findToolbar()

        expect(screen.getByRole<HTMLButtonElement>('button', { name: RICH_EDITOR_LABEL.image }).disabled).toBe(true)
    })

    test('굵게 셀을 누르면 aria-pressed 가 켜진다', async () => {
        renderEditor()
        fireEvent.click(await findToolbar())

        await waitFor(() => expect(screen.getByRole('button', { name: RICH_EDITOR_LABEL.bold }).getAttribute('aria-pressed')).toBe('true'))
    })

    test('이미지 파일을 고르면 업로드 결과를 본문에 넣고 onChange 로 알린다', async () => {
        const onUploadImage = mock<(file: File) => Promise<UploadedImage | null>>(async () => ({ id: UPLOAD_ID, url: UPLOADED_URL }))
        const onChange = mock<(doc: RichTextDocument) => void>(() => {})
        renderEditor({ onChange, onUploadImage })
        await findToolbar()
        selectImageFile()

        await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(document.querySelector('.rich-text img')?.getAttribute('src')).toBe(UPLOADED_URL))
        expect(onChange).toHaveBeenCalled()
    })

    test('업로드가 실패하면 본문을 바꾸지 않는다', async () => {
        const onUploadImage = mock<(file: File) => Promise<UploadedImage | null>>(async () => null)
        const onChange = mock<(doc: RichTextDocument) => void>(() => {})
        renderEditor({ onChange, onUploadImage })
        await findToolbar()
        selectImageFile()

        await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(1))
        expect(document.querySelector('.rich-text img')).toBeNull()
        expect(onChange).not.toHaveBeenCalled()
    })

    test('링크 다이얼로그는 http 가 아닌 주소를 거부한다', async () => {
        renderEditor()
        await findToolbar()
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_LABEL.link }))

        const input = await screen.findByLabelText(RICH_EDITOR_LINK_DIALOG.label)
        fireEvent.change(input, { target: { value: 'javascript:alert(1)' } })
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_DIALOG_CONFIRM }))

        await waitFor(() => expect(screen.getByText(RICH_EDITOR_LINK_DIALOG.invalid)).toBeDefined())
        expect(screen.getByLabelText(RICH_EDITOR_LINK_DIALOG.label)).toBeDefined()
    })

    test('링크 다이얼로그는 대문자 스킴 주소를 받아들인다', async () => {
        renderEditor()
        await findToolbar()
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_LABEL.link }))

        fireEvent.change(await screen.findByLabelText(RICH_EDITOR_LINK_DIALOG.label), { target: { value: UPPERCASE_LINK_URL } })
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_DIALOG_CONFIRM }))

        await waitFor(() => expect(screen.queryByLabelText(RICH_EDITOR_LINK_DIALOG.label)).toBeNull())
        expect(screen.queryByText(RICH_EDITOR_LINK_DIALOG.invalid)).toBeNull()
    })

    test('YouTube 다이얼로그는 잘못된 주소를 거부하고 올바른 주소는 본문에 넣는다', async () => {
        const onChange = mock<(doc: RichTextDocument) => void>(() => {})
        renderEditor({ onChange })
        await findToolbar()
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_LABEL.youtube }))

        const input = await screen.findByLabelText(RICH_EDITOR_YOUTUBE_DIALOG.label)
        fireEvent.change(input, { target: { value: 'https://example.com/watch' } })
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_DIALOG_CONFIRM }))
        await waitFor(() => expect(screen.getByText(RICH_EDITOR_YOUTUBE_DIALOG.invalid)).toBeDefined())

        fireEvent.change(screen.getByLabelText(RICH_EDITOR_YOUTUBE_DIALOG.label), { target: { value: YOUTUBE_URL } })
        fireEvent.click(screen.getByRole('button', { name: RICH_EDITOR_DIALOG_CONFIRM }))

        await waitFor(() =>
            expect(document.querySelector('.rich-text iframe')?.getAttribute('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ'),
        )
        expect(onChange).toHaveBeenCalled()
    })
})
