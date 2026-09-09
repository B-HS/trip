'use client'

import { useEffect, useState } from 'react'
import { resolveCssColor } from '@/shared/ui/three/css-color'

const THEME_ATTRIBUTES = ['class', 'data-theme']

const readGlobeTheme = () => {
    const styles = getComputedStyle(document.documentElement)
    return {
        foreground: resolveCssColor(styles.getPropertyValue('--foreground')),
        mutedForeground: resolveCssColor(styles.getPropertyValue('--muted-foreground')),
        border: resolveCssColor(styles.getPropertyValue('--border')),
    }
}

export type GlobeTheme = ReturnType<typeof readGlobeTheme>

export const useGlobeTheme = () => {
    const [theme, setTheme] = useState<GlobeTheme | null>(() => (typeof document === 'undefined' ? null : readGlobeTheme()))

    useEffect(() => {
        const observer = new MutationObserver(() => setTheme(readGlobeTheme()))
        observer.observe(document.documentElement, { attributes: true, attributeFilter: THEME_ATTRIBUTES })
        return () => observer.disconnect()
    }, [])

    return theme
}
