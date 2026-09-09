import { and, eq } from 'drizzle-orm'
import { createTripFromTemplate } from '@/entities/trip/trip.repository'
import { OSAKA_TRIP_TEMPLATE } from '@/shared/constant/template/osaka'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'
import { trip } from '@/shared/db/schema/trip'
import { getEnv } from '@/shared/lib/env'
import { tripTemplateSchema } from '@/shared/lib/trip-template'

const EXIT_OK = 0
const EXIT_FAIL = 1

const run = async () => {
    const email = getEnv().SEED_OWNER_EMAIL.trim().toLowerCase()
    if (email.length === 0) {
        process.stderr.write('SEED_OWNER_EMAIL 을 .env 에 설정한 뒤 다시 실행하세요\n')
        return EXIT_FAIL
    }
    const db = getDb()
    const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.email, email))
    if (!owner) {
        process.stdout.write(`먼저 ${email} 로 회원가입한 뒤 다시 실행하세요\n`)
        return EXIT_FAIL
    }
    const template = tripTemplateSchema.parse(OSAKA_TRIP_TEMPLATE)
    const [existing] = await db
        .select({ id: trip.id })
        .from(trip)
        .where(and(eq(trip.ownerId, owner.id), eq(trip.title, template.title)))
    if (existing) {
        process.stdout.write(`이미 "${template.title}" 여행이 있어 건너뜁니다 (${existing.id})\n`)
        return EXIT_OK
    }
    const created = await createTripFromTemplate(owner.id, template)
    process.stdout.write(`오사카 예시 여행을 만들었습니다: ${created.id}\n`)
    return EXIT_OK
}

process.exit(await run())
