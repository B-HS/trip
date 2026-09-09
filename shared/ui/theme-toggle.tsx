'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useSyncExternalStore, type ComponentProps, type FC } from 'react'
import { Button } from '@/shared/ui/button'

const THEME_HOTKEY = 'd'
const EDITABLE_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT']

const subscribeToNothing = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

type ThemeToggleProps = Pick<ComponentProps<typeof Button>, 'className' | 'variant' | 'size'>

export const ThemeToggle: FC<ThemeToggleProps> = ({ className, variant = 'ghost', size = 'icon-sm' }) => {
    const { resolvedTheme, setTheme } = useTheme()
    const isMounted = useSyncExternalStore(subscribeToNothing, getMountedSnapshot, getMountedServerSnapshot)

    const isDark = resolvedTheme === 'dark'
    const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환'

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.metaKey || event.ctrlKey || event.altKey || event.key.toLowerCase() !== THEME_HOTKEY) return
            const { target } = event
            if (target instanceof HTMLElement && (EDITABLE_TAG_NAMES.includes(target.tagName) || target.isContentEditable)) return
            setTheme(isDark ? 'light' : 'dark')
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isDark, setTheme])

    if (!isMounted) return <Button className={className} variant={variant} size={size} disabled aria-hidden tabIndex={-1} />

    return (
        <Button
            className={className}
            variant={variant}
            size={size}
            aria-label={label}
            title={label}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
    )
}
