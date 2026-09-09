import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { schema } from '@/shared/db/schema'
import { getEnv } from '@/shared/lib/env'

const POOL_CONNECTION_LIMIT = 5

const createDb = () => {
    const pool = mysql.createPool({
        uri: getEnv().DATABASE_URL,
        connectionLimit: POOL_CONNECTION_LIMIT,
        waitForConnections: true,
        timezone: 'Z',
    })
    return drizzle({ client: pool, schema, mode: 'default' })
}

let dbInstance: ReturnType<typeof createDb> | null = null

export const getDb = () => {
    if (dbInstance) return dbInstance
    dbInstance = createDb()
    return dbInstance
}

export type Database = ReturnType<typeof getDb>
