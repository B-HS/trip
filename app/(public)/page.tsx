import type { Metadata } from 'next'
import { INTRO_METADATA } from '@/shared/constant/marketing'
import { IntroWidget } from '@/widgets/intro/intro-widget'

export const metadata: Metadata = {
    title: INTRO_METADATA.title,
    description: INTRO_METADATA.description,
}

const IntroPage = () => <IntroWidget />

export default IntroPage
