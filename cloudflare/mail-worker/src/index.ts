interface Env {
    SEND_EMAIL: { send(message: EmailMessage): Promise<void> }
    SEND_SECRET: string
    EMAIL_FROM: string
}

declare class EmailMessage {
    constructor(from: string, to: string, raw: string)
}

type EmailPayload = {
    from: string
    to: string
    subject: string
    text: string
    html: string
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const encodeHeader = (value: string) => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(value)))}?=`

const toMime = (payload: EmailPayload) =>
    [
        `From: ${payload.from}`,
        `To: ${payload.to}`,
        `Subject: ${encodeHeader(payload.subject)}`,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="trip-boundary"',
        '',
        '--trip-boundary',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        payload.text,
        '--trip-boundary',
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        '',
        payload.html,
        '--trip-boundary--',
        '',
    ].join('\r\n')

const worker = {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })
        if (request.headers.get('authorization') !== `Bearer ${env.SEND_SECRET}`) return new Response('Unauthorized', { status: 401 })

        let payload: EmailPayload
        try {
            payload = (await request.json()) as EmailPayload
        } catch {
            return new Response('Invalid JSON', { status: 400 })
        }
        if (!payload || !isEmail(payload.to) || payload.from !== env.EMAIL_FROM || !payload.subject || !payload.text || !payload.html) {
            return new Response('Invalid email payload', { status: 400 })
        }

        await env.SEND_EMAIL.send(new EmailMessage(payload.from, payload.to, toMime(payload)))
        return Response.json({ sent: true })
    },
}

export default worker
