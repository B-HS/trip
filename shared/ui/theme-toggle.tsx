'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useSyncExternalStore, type ComponentProps, type FC } from 'react'
import { Button } from '@/shared/ui/button'

const subscribeToNothing = () => () => {}
const getMountedSnapshot = () => true
const getMountedServerSnapshot = () => false

type ThemeToggleProps = Pick<ComponentProps<typeof Button>, 'className' | 'variant' | 'size'>

export const ThemeToggle: FC<ThemeToggleProps> = ({ className, variant = 'ghost', size = 'icon-sm' }) => {
    const t = useTranslations('common.themeToggle')
    const { resolvedTheme, setTheme } = useTheme()
    const isMounted = useSyncExternalStore(subscribeToNothing, getMountedSnapshot, getMountedServerSnapshot)

    const isDark = resolvedTheme === 'dark'
    const label = isDark ? t('toLight') : t('toDark')

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
