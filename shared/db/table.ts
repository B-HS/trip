import { mysqlTableCreator } from 'drizzle-orm/mysql-core'

export const TABLE_PREFIX = 'trip_'

export const tripTable = mysqlTableCreator((name) => `${TABLE_PREFIX}${name}`)
