'use client'

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { useEffect, type ComponentProps, type FC } from 'react'

const THEME_HOTKEY = 'd'
const EDITABLE_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT']

const ThemeHotkey: FC = () => {
    const { resolvedTheme, setTheme } = useTheme()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
            if (event.key.toLowerCase() !== THEME_HOTKEY) return
            const { target } = event
            if (target instanceof HTMLElement && (EDITABLE_TAG_NAMES.includes(target.tagName) || target.isContentEditable)) return
            setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [resolvedTheme, setTheme])

    return null
}

export const ThemeProvider: FC<ComponentProps<typeof NextThemesProvider>> = ({ children, ...props }) => (
    <NextThemesProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange {...props}>
        <ThemeHotkey />
        {children}
    </NextThemesProvider>
)
