import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, render } from '@testing-library/react'
import type { PropsWithChildren } from 'react'

type MotionDivProps = PropsWithChildren<{ 'className'?: string; 'data-page-transition'?: string }>

const MotionDiv = ({ children, className, 'data-page-transition': pageTransition }: MotionDivProps) => (
    <div className={className} data-page-transition={pageTransition}>
        {children}
    </div>
)

mock.module('motion/react', () => ({
    motion: { div: MotionDiv, li: MotionDiv, ol: MotionDiv },
    AnimatePresence: ({ children }: PropsWithChildren) => children,
}))

const { PageTransition } = await import('@/shared/ui/motion/page-transition')

afterEach(cleanup)

describe('PageTransition', () => {
    test('marks its stable ancestor so print CSS can reveal a document before hydration animation settles', () => {
        const { container } = render(
            <PageTransition>
                <main className='trip-print-surface'>Document</main>
            </PageTransition>,
        )

        expect(container.querySelector('[data-page-transition="true"]')).not.toBeNull()
    })
})
