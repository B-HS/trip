import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import mysql from 'mysql2'
import { getEnv } from '../shared/lib/env'

const MIGRATIONS_FOLDER = './drizzle'
const MIGRATIONS_TABLE = 'trip___drizzle_migrations'

const describeError = (error: unknown) => {
    if (!(error instanceof Error)) return String(error)
    const cause = error.cause instanceof Error ? ` (cause: ${error.cause.message})` : ''
    return `${error.message}${cause}`
}

const run = async () => {
    const connection = mysql.createConnection({ uri: getEnv().DATABASE_URL, multipleStatements: true })
    const db = drizzle({ client: connection, logger: false })
    try {
        await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER, migrationsTable: MIGRATIONS_TABLE })
        process.stdout.write('migrations applied\n')
    } catch (error) {
        process.stderr.write(`migration failed: ${describeError(error)}\n`)
        process.exitCode = 1
    } finally {
        await connection.promise().end()
    }
}

await run()
