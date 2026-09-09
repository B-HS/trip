import * as authSchema from '@/shared/db/schema/auth'
import * as communitySchema from '@/shared/db/schema/community'
import * as tripSchema from '@/shared/db/schema/trip'

export const schema = { ...authSchema, ...communitySchema, ...tripSchema }
