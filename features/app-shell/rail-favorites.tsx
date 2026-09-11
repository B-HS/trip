'use client'

import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { RailFavoriteItem, type RailFavorite } from '@/features/app-shell/rail-favorite-item'

const TRIP_PATH_PREFIX = '/trips/'

type RailFavoritesProps = {
    favorites: RailFavorite[]
    activePath: string
    isCollapsed: boolean
    onNavigate?: () => void
}

export const RailFavorites: FC<RailFavoritesProps> = ({ favorites, activePath, isCollapsed, onNavigate }) => {
    const t = useTranslations('common')
    if (isCollapsed && favorites.length === 0) return null

    return (
        <section className='flex flex-col pt-3' aria-label={t('nav.favorites')}>
            {!isCollapsed && <h2 className='px-3 pb-1 text-2xs font-medium tracking-wide text-sidebar-foreground/60'>{t('nav.favorites')}</h2>}
            {favorites.length === 0
                ? !isCollapsed && <p className='px-3 py-1 text-xs text-sidebar-foreground/60'>{t('nav.favoritesEmpty')}</p>
                : favorites.map((favorite) => (
                      <RailFavoriteItem
                          key={favorite.id}
                          id={favorite.id}
                          title={favorite.title}
                          code={favorite.code}
                          isActive={activePath.startsWith(`${TRIP_PATH_PREFIX}${favorite.id}`)}
                          isCollapsed={isCollapsed}
                          onNavigate={onNavigate}
                      />
                  ))}
        </section>
    )
}
