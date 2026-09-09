import { describe, expect, test } from 'bun:test'
import DOMPurify from 'isomorphic-dompurify'
import { sanitizeRichTextHtml } from '@/shared/lib/rich-text-sanitize'

describe('sanitizeRichTextHtml', () => {
    test('youtube-nocookie 임베드 iframe 은 남긴다', () => {
        const html =
            '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="360"></iframe></div>'
        const clean = sanitizeRichTextHtml(html)
        expect(clean).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')
        expect(clean).toContain('data-youtube-video')
    })

    test('youtube.com 임베드 iframe 도 남기고 허용 속성을 유지한다', () => {
        const clean = sanitizeRichTextHtml(
            '<iframe src="https://www.youtube.com/embed/abc" allowfullscreen="true" frameborder="0" loading="lazy"></iframe>',
        )
        expect(clean).toContain('<iframe')
        expect(clean).toContain('allowfullscreen')
        expect(clean).toContain('frameborder')
        expect(clean).toContain('loading')
    })

    test('허용 목록 밖의 iframe 은 제거한다', () => {
        expect<string>(sanitizeRichTextHtml('<p>본문</p><iframe src="https://evil.com/embed/x"></iframe>')).toBe('<p>본문</p>')
        expect<string>(sanitizeRichTextHtml('<iframe src="https://www.youtube.com.evil.com/embed/x"></iframe>')).toBe('')
        expect<string>(sanitizeRichTextHtml('<iframe></iframe>')).toBe('')
    })

    test('script 와 이벤트 핸들러 속성을 제거한다', () => {
        expect<string>(sanitizeRichTextHtml('<p>본문</p><script>alert(1)</script>')).toBe('<p>본문</p>')
        expect<string>(sanitizeRichTextHtml('<img src="https://cdn.example.com/a.png" onerror="alert(1)">')).not.toContain('onerror')
        expect<string>(sanitizeRichTextHtml('<style>body{display:none}</style><p>본문</p>')).toBe('<p>본문</p>')
    })

    test('http(s) 링크에는 rel 과 target 을 강제한다', () => {
        const clean = sanitizeRichTextHtml('<a href="https://example.com">링크</a>')
        expect(clean).toContain('rel="noopener noreferrer"')
        expect(clean).toContain('target="_blank"')
    })

    test('http(s) 가 아닌 href 는 제거한다', () => {
        const clean = sanitizeRichTextHtml('<a href="javascript:alert(1)" target="_blank">링크</a>')
        expect(clean).not.toContain('javascript:')
        expect(clean).not.toContain('href')
        expect(clean).not.toContain('target')
        expect<string>(sanitizeRichTextHtml('<a href="mailto:a@example.com">메일</a>')).not.toContain('mailto:')
    })

    test('http(s) 가 아닌 이미지는 제거한다', () => {
        expect<string>(sanitizeRichTextHtml('<img src="data:image/png;base64,AAAA">')).toBe('')
        expect<string>(sanitizeRichTextHtml('<p>본문</p><img src="javascript:alert(1)">')).toBe('<p>본문</p>')
        expect<string>(sanitizeRichTextHtml('<img src="https://cdn.example.com/a.png" loading="lazy">')).toContain('https://cdn.example.com/a.png')
    })

    test('대문자 스킴 주소는 그대로 남긴다', () => {
        const link = sanitizeRichTextHtml('<a href="HTTPS://example.com">링크</a>')
        expect(link).toContain('HTTPS://example.com')
        expect(link).toContain('rel="noopener noreferrer"')
        expect<string>(sanitizeRichTextHtml('<img src="HTTPS://cdn.example.com/a.png">')).toContain('HTTPS://cdn.example.com/a.png')
        expect<string>(sanitizeRichTextHtml('<iframe src="HTTPS://WWW.YOUTUBE.COM/embed/x"></iframe>')).toContain('<iframe')
    })

    test('허용 목록 밖의 태그와 속성을 제거한다', () => {
        expect<string>(sanitizeRichTextHtml('<form action="https://evil.com"><input name="a"><button>보내기</button></form>')).toBe('보내기')
        expect<string>(sanitizeRichTextHtml('<svg><image href="data:image/svg+xml;base64,AAAA"></image></svg>')).toBe('')
        expect<string>(sanitizeRichTextHtml('<p style="position:fixed;inset:0">본문</p>')).toBe('<p>본문</p>')
        expect<string>(sanitizeRichTextHtml('<iframe src="https://www.youtube.com/embed/x" name="foo" id="bar"></iframe>')).toBe(
            '<iframe src="https://www.youtube.com/embed/x"></iframe>',
        )
    })

    test('class 속성은 남기지 않는다', () => {
        expect<string>(sanitizeRichTextHtml('<a href="https://example.com" class="fixed inset-0 z-50">링크</a>')).not.toContain('class')
        expect<string>(sanitizeRichTextHtml('<pre><code class="language-fixed inset-0">본문</code></pre>')).toBe('<pre><code>본문</code></pre>')
    })

    test('정책 훅은 다른 sanitize 호출로 새지 않는다', () => {
        sanitizeRichTextHtml('<a href="https://example.com">링크</a>')
        const other = DOMPurify.sanitize('<a href="mailto:a@example.com">메일</a>')

        expect(other).toContain('mailto:a@example.com')
        expect(other).not.toContain('target')
    })
})
