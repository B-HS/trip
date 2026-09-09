import type { Metadata } from 'next'
import { TripCreateWidget } from '@/widgets/trips/trip-create-widget'

export const metadata: Metadata = {
    title: '새 트립',
    description: '기본 정보로 빈 트립을 만들거나 오사카 예시 트립으로 시작합니다.',
}

const NewTripPage = () => <TripCreateWidget />

export default NewTripPage
