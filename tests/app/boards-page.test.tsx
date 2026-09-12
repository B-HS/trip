import { describe, expect, mock, test } from 'bun:test'

let session: { user: { id: string } } | null = { user: { id: 'viewer-1' } }

mock.module('@/shared/lib/session', () => ({
    getServerSession: async () => session,
    requireUser: async () => ({ id: 'viewer-1' }),
}))

const { default: BoardsPage } = await import('@/app/[locale]/(shell)/boards/page')

describe('BoardsPage', () => {
    test('authenticated board index uses the shell content width', async () => {
        const page = await BoardsPage()
        const classNames = new Set(page.props.className.split(/\s+/))

        expect(classNames).toContain('w-full')
        expect(classNames).not.toContain('max-w-7xl')
        expect(page.props.children.props.viewerId).toBe('viewer-1')
    })

    test('public board index keeps its readable max width', async () => {
        session = null

        const page = await BoardsPage()
        const classNames = new Set(page.props.className.split(/\s+/))

        expect(classNames).toContain('mx-auto')
        expect(classNames).toContain('w-full')
        expect(classNames).toContain('max-w-7xl')
        expect(page.props.children.props.viewerId).toBeNull()
    })
})
