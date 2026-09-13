import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'bun:test'

const globalStyles = readFileSync(resolve(import.meta.dir, '../../app/globals.css'), 'utf8')

describe('dedicated print CSS contract', () => {
    test('uses a layered print palette instead of flattening every descendant color', () => {
        expect(globalStyles).not.toContain('.trip-print-surface :where(*)')
        expect(globalStyles).toContain('--trip-print-ink: #171717')
        expect(globalStyles).toContain('--trip-print-muted: #6b6b6b')
        expect(globalStyles).toContain('--trip-print-line: #d6d4cf')
        expect(globalStyles).toContain('--muted-foreground: var(--trip-print-muted)')
    })

    test('reveals the stable page-transition ancestor during print', () => {
        expect(globalStyles).toContain("[data-page-transition='true']")
        expect(globalStyles).toContain('opacity: 1 !important')
        expect(globalStyles).toContain('visibility: visible !important')
    })
})
