'use client'

import { useEffect } from 'react'

const SUBMIT_SHORTCUT_KEY = 's'

export const useSubmitShortcut = (onSubmit: () => void) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== SUBMIT_SHORTCUT_KEY) return
            event.preventDefault()
            onSubmit()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onSubmit])
}
