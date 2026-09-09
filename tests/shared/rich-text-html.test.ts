import { describe, expect, test } from 'bun:test'
import { EMPTY_RICH_TEXT_DOCUMENT, type RichTextDocument } from '@/shared/lib/rich-text-document'
import { renderRichTextHtml } from '@/shared/lib/rich-text-html'

const richText = (content: RichTextDocument[]): RichTextDocument => ({ type: 'doc', content })

describe('renderRichTextHtml', () => {
    test('빈 문서는 빈 문단으로 렌더한다', () => {
        expect<string>(renderRichTextHtml(EMPTY_RICH_TEXT_DOCUMENT)).toBe('<p></p>')
    })

    test('제목과 목록을 렌더한다', () => {
        const html = renderRichTextHtml(
            richText([
                { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '제목' }] },
                { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '항목' }] }] }] },
            ]),
        )
        expect(html).toContain('<h2>제목</h2>')
        expect(html).toContain('<li><p>항목</p></li>')
    })

    test('YouTube 노드는 nocookie 임베드 iframe 으로 남는다', () => {
        const html = renderRichTextHtml(richText([{ type: 'youtube', attrs: { src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } }]))
        expect(html).toContain('src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
        expect(html).toContain('width="640"')
        expect(html).toContain('height="360"')
        expect(html).toContain('allowfullscreen')
    })

    test('링크에는 rel 과 target 이 강제된다', () => {
        const html = renderRichTextHtml(
            richText([
                { type: 'paragraph', content: [{ type: 'text', text: '링크', marks: [{ type: 'link', attrs: { href: 'https://example.com' } }] }] },
            ]),
        )
        expect(html).toContain('rel="noopener noreferrer"')
        expect(html).toContain('target="_blank"')
        expect(html).toContain('href="https://example.com"')
    })

    test('http(s) 가 아닌 이미지는 렌더 결과에서 제거된다', () => {
        expect<string>(renderRichTextHtml(richText([{ type: 'image', attrs: { src: 'data:image/png;base64,AAAA' } }]))).toBe('')
        expect<string>(renderRichTextHtml(richText([{ type: 'image', attrs: { src: 'https://cdn.example.com/a.png' } }]))).toContain('loading="lazy"')
    })

    test('본문 텍스트를 이스케이프한다', () => {
        expect<string>(renderRichTextHtml(richText([{ type: 'paragraph', content: [{ type: 'text', text: '<script>alert(1)</script>' }] }]))).toBe(
            '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>',
        )
    })

    test('코드 블록의 언어 클래스는 렌더 결과에서 제거된다', () => {
        const html = renderRichTextHtml(
            richText([{ type: 'codeBlock', attrs: { language: 'fixed inset-0 z-50' }, content: [{ type: 'text', text: 'x' }] }]),
        )

        expect<string>(html).toBe('<pre><code>x</code></pre>')
    })

    test('http(s) 가 아닌 링크는 href 없이 렌더한다', () => {
        const html = renderRichTextHtml(
            richText([
                { type: 'paragraph', content: [{ type: 'text', text: '메일', marks: [{ type: 'link', attrs: { href: 'mailto:a@example.com' } }] }] },
            ]),
        )

        expect<string>(html).toBe('<p><a>메일</a></p>')
    })
})
