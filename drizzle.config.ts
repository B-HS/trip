import { defineConfig } from 'drizzle-kit'
import { getEnv } from './shared/lib/env'

export default defineConfig({
    dialect: 'mysql',
    schema: './shared/db/schema/*.ts',
    out: './drizzle',
    tablesFilter: ['trip_*'],
    dbCredentials: { url: getEnv().DATABASE_URL },
    strict: true,
    verbose: true,
})
