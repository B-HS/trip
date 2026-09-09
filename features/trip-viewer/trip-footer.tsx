import type { FC } from 'react'

type TripFooterProps = {
    footerNote: string | null
}

export const TripFooter: FC<TripFooterProps> = ({ footerNote }) => {
    if (!footerNote) return null

    return <footer className='bg-card p-3 text-xs leading-relaxed break-keep text-muted-foreground'>{footerNote}</footer>
}
