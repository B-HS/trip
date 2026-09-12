import { expect, test } from 'bun:test'
import { PUBLIC_TRIP_CACHE_VERSION } from '@/shared/constant/cache'

test('public trip cache version includes the revision-bearing DTO shape', () => {
    expect(PUBLIC_TRIP_CACHE_VERSION).toBe('5')
})
