import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { TripVisibilityToggle } from '@/features/trip-viewer/trip-visibility-toggle'

afterEach(cleanup)

describe('TripVisibilityToggle', () => {
    test('announces the confirmed public state and exposes a switch', () => {
        render(<TripVisibilityToggle isPublic isPending={false} onChange={() => {}} />)

        expect(screen.getByText('공개 여부: 공개')).toBeDefined()
        expect(screen.getByRole('switch', { name: '공개 여부를 공개 상태로 설정' })).toBeDefined()
        expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
    })

    test('sends the requested state and disables while saving', () => {
        const onChange = mock(() => {})
        render(<TripVisibilityToggle isPublic={false} isPending={false} onChange={onChange} />)

        fireEvent.click(screen.getByRole('switch'))
        expect(onChange).toHaveBeenCalledWith(true)

        cleanup()
        render(<TripVisibilityToggle isPublic={false} isPending onChange={onChange} />)
        expect(screen.getByRole('switch')).toHaveProperty('disabled', true)
    })
})
