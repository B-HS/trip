import { afterEach, describe, expect, mock, test } from 'bun:test'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AirportCombobox } from '@/features/trip-editor/airport-combobox'

const AIRPORT_COUNT = 43
const CLEAR_SELECTOR = '[data-slot="combobox-clear"]'

afterEach(cleanup)

const renderCombobox = (value: string | null) => {
    const onChange = mock((code: string | null) => code)
    const { container } = render(<AirportCombobox id='departure-airport' value={value} onChange={onChange} />)
    return { container, input: screen.getByRole<HTMLInputElement>('combobox'), onChange }
}

const openList = async () => {
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(AIRPORT_COUNT))
}

describe('AirportCombobox', () => {
    test('값이 null 이면 아무 공항도 고르지 않은 상태로 비워 둔다', () => {
        const { input, container } = renderCombobox(null)
        expect(input.value).toBe('')
        expect(input.getAttribute('placeholder')).toBe('공항 검색')
        expect(container.querySelector(CLEAR_SELECTOR)).toBeNull()
    })

    test('값이 있으면 그 공항을 표시한다', () => {
        expect(renderCombobox('KIX').input.value).toBe('KIX · 칸사이(오사카)')
    })

    test('고른 공항은 비우기 버튼으로 null 로 되돌린다', async () => {
        const { container, onChange } = renderCombobox('KIX')
        const clear = container.querySelector<HTMLButtonElement>(CLEAR_SELECTOR)
        expect(clear).not.toBeNull()

        fireEvent.click(clear!)
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
        expect(onChange.mock.calls[0]![0]).toBeNull()
    })

    test('목록에 코드와 이름·도시를 함께 보여준다', async () => {
        renderCombobox(null)
        await openList()
        expect(screen.getAllByRole('option')[0]?.textContent).toBe('ICN인천(서울)')
    })

    test('도시로 검색해 고르면 코드로 onChange 를 호출한다', async () => {
        const { input, onChange } = renderCombobox(null)
        await openList()
        fireEvent.change(input, { target: { value: '오사카' } })

        await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(2))
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['KIX칸사이(오사카)', 'ITM이타미(오사카)'])

        fireEvent.click(screen.getAllByRole('option')[0]!)
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
        expect(onChange.mock.calls[0]![0]).toBe('KIX')
    })

    test('공항 이름으로도 검색한다', async () => {
        const { input } = renderCombobox(null)
        await openList()
        fireEvent.change(input, { target: { value: '히스로' } })

        await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
        expect(screen.getAllByRole('option')[0]?.textContent).toBe('LHR히스로(런던)')
    })

    test('코드로도 검색하고 없으면 안내를 보여준다', async () => {
        const { input } = renderCombobox(null)
        await openList()
        fireEvent.change(input, { target: { value: 'pus' } })
        await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
        expect(screen.getAllByRole('option')[0]?.textContent).toBe('PUS김해(부산)')

        fireEvent.change(input, { target: { value: '없는공항' } })
        await waitFor(() => expect(screen.getByText('일치하는 공항이 없습니다.')).toBeDefined())
    })
})
