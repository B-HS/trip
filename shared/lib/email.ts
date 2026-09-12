import type { User } from 'better-auth'
import { getEnv } from '@/shared/lib/env'

type VerificationEmailData = {
    user: User
    url: string
}

const EMAIL_SUBJECT = 'Trip 이메일 주소를 인증해 주세요'

const escapeText = (value: string) =>
    value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)

export const sendVerificationEmail = async ({ user, url }: VerificationEmailData) => {
    const env = getEnv()
    if (!env.EMAIL_WORKER_URL || !env.EMAIL_WORKER_TOKEN || !env.EMAIL_FROM) throw new Error('EMAIL_DELIVERY_NOT_CONFIGURED')

    const username = escapeText(user.name)
    const safeUrl = escapeText(url)
    const text = `${user.name}님,\n\nTrip 가입을 완료하려면 아래 링크를 열어 이메일 주소를 인증해 주세요.\n\n${url}\n\n이 링크는 한 시간 동안 유효합니다.`
    const html = `<p>${username}님,</p><p>Trip 가입을 완료하려면 아래 링크를 열어 이메일 주소를 인증해 주세요.</p><p><a href="${safeUrl}">이메일 주소 인증하기</a></p><p>이 링크는 한 시간 동안 유효합니다.</p>`

    const response = await fetch(env.EMAIL_WORKER_URL, {
        method: 'POST',
        headers: { 'authorization': `Bearer ${env.EMAIL_WORKER_TOKEN}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from: env.EMAIL_FROM, to: user.email, subject: EMAIL_SUBJECT, text, html }),
    })
    if (!response.ok) throw new Error(`EMAIL_DELIVERY_FAILED_${response.status}`)
}
