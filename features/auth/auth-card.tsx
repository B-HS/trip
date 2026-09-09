import type { FC, PropsWithChildren, ReactNode } from 'react'

type AuthCardProps = PropsWithChildren<{
    title: string
    description: string
    footer?: ReactNode
}>

export const AuthCard: FC<AuthCardProps> = ({ title, description, footer, children }) => (
    <section className='flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm'>
        <header className='flex flex-col gap-1'>
            <h1 className='text-xl font-extrabold tracking-tight'>{title}</h1>
            <p className='text-sm text-muted-foreground'>{description}</p>
        </header>
        {children}
        {footer && <div className='text-sm text-muted-foreground'>{footer}</div>}
    </section>
)
