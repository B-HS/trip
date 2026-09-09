import type { TripUser } from '@/entities/trip/trip.type'

export type PublicProfile = Pick<TripUser, 'id' | 'name' | 'username' | 'image' | 'bannerUrl' | 'bio'> & {
    points: number
    createdAt: string
}

export type ProfileSettings = Pick<PublicProfile, 'name' | 'username' | 'image' | 'bannerUrl' | 'bio'>
