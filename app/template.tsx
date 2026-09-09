import type { FC, PropsWithChildren } from 'react'
import { PageTransition } from '@/shared/ui/motion/page-transition'

const RootTemplate: FC<PropsWithChildren> = ({ children }) => <PageTransition>{children}</PageTransition>

export default RootTemplate
