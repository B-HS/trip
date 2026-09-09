import * as authSchema from '@/shared/db/schema/auth'
import * as tripSchema from '@/shared/db/schema/trip'

export const schema = { ...authSchema, ...tripSchema }
