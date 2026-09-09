'use client'

import { useEffect } from 'react'

/**
 * Warns the user before leaving the page while a form still holds unsaved changes.
 */
export const useUnsavedChanges = (isDirty: boolean) => {
    useEffect(() => {
        if (!isDirty) return

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue = ''
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])
}
