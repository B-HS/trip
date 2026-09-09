import { eq } from 'drizzle-orm'
import { ADMIN_ROLE } from '@/shared/constant/auth'
import { getDb } from '@/shared/db/client'
import { user } from '@/shared/db/schema/auth'

const EXIT_OK = 0
const EXIT_FAIL = 1
const EMAIL_ARGUMENT_INDEX = 2

const run = async () => {
    const email = (process.argv[EMAIL_ARGUMENT_INDEX] ?? '').trim().toLowerCase()
    if (email.length === 0) {
        process.stderr.write('사용법: bun run admin:set <email>\n')
        return EXIT_FAIL
    }
    const db = getDb()
    const [target] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.email, email))
    if (!target) {
        process.stderr.write(`${email} 로 가입한 사용자를 찾을 수 없습니다\n`)
        return EXIT_FAIL
    }
    if (target.role === ADMIN_ROLE) {
        process.stdout.write(`이미 관리자입니다: ${email}\n`)
        return EXIT_OK
    }
    await db.update(user).set({ role: ADMIN_ROLE }).where(eq(user.id, target.id))
    process.stdout.write(`관리자로 지정했습니다: ${email}\n`)
    return EXIT_OK
}

process.exit(await run())
