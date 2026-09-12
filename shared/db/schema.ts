import * as authSchema from '@/shared/db/schema/auth'
import * as aiSchema from '@/shared/db/schema/ai'
import * as communitySchema from '@/shared/db/schema/community'
import * as tripSchema from '@/shared/db/schema/trip'

export const schema = { ...authSchema, ...aiSchema, ...communitySchema, ...tripSchema }
