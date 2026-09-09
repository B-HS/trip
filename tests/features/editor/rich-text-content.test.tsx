import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import { RichTextContent } from '@/features/editor/rich-text-content'
import { RICH_TEXT_CLASS } from '@/shared/constant/rich-text'
import { sanitizeRichTextHtml } from '@/shared/lib/rich-text-sanitize'

afterEach(cleanup)

describe('RichTextContent', () => {
    test('rich-text 클래스와 전달한 클래스를 함께 붙인다', () => {
        const { container } = render(<RichTextContent html={sanitizeRichTextHtml('<p>본문</p>')} className='mt-4' />)
        const root = container.firstElementChild

        expect(root?.className).toContain(RICH_TEXT_CLASS)
        expect(root?.className).toContain('mt-4')
    })

    test('className 이 없어도 rich-text 클래스만 붙인다', () => {
        const { container } = render(<RichTextContent html={sanitizeRichTextHtml('<p>본문</p>')} />)

        expect(container.firstElementChild?.className).toBe(RICH_TEXT_CLASS)
    })

    test('전달한 HTML 을 그대로 삽입한다', () => {
        const { container } = render(
            <RichTextContent
                html={sanitizeRichTextHtml('<h2>제목</h2><p>본문</p><iframe src="https://www.youtube-nocookie.com/embed/a"></iframe>')}
            />,
        )

        expect(container.querySelector('h2')?.textContent).toBe('제목')
        expect(container.querySelector('p')?.textContent).toBe('본문')
        expect(container.querySelector('iframe')?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/a')
    })
})
