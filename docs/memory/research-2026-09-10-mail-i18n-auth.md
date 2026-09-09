# 리서치 메모 — Cloudflare 메일 · next-intl · better-auth 인증 확장 · korean-law-mcp (2026-09-10, Sonnet 3건 병렬, 4분)

> 5·6단계(i18n·인증 확장) 착수용 사실 목록. 구현 직전 공식 문서로 재확인한다. `[미확인]` 은 1차 출처를 못 찾은 항목.

## Cloudflare 아웃바운드 메일

### 답변

[질문 1] 2026년 9월 기준 Cloudflare 아웃바운드 이메일 발송 수단은 두 갈래로 나뉜다.

- **레거시 Email Routing `send_email` 바인딩**(`wrangler.toml`의 `[[send_email]]`, `cloudflare:email`의 `EmailMessage`): 제한 없이(`destination_address`/`allowed_destination_addresses` 미지정) 쓰면 "계정에 등록된 verified destination address"에만 발송 가능하다는 제약이 **2026년에도 그대로 있다**. 즉 임의의 최종 사용자 이메일로는 못 보낸다 — 트랜잭션 메일(가입 인증 등)에는 부적합.
  출처: https://developers.cloudflare.com/email-service/configuration/send-bindings/ , https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/

- **Cloudflare Email Service (신규 "Email Sending" 기능)**: 도메인을 Cloudflare DNS + Email Service에 온보딩(MX 반송 라우팅 + SPF/DKIM/DMARC TXT 레코드 추가)하면, `env.EMAIL.send({to, from, subject, html, text})` 형태로 **임의 수신자**에게 보낼 수 있다(예시 코드가 `to: "recipient@example.com"` 임의 주소). 단 문서는 "Sending to verified destination addresses in your account is free on all plans"만 명시하고 온보딩 후 검증 요구가 완전히 사라지는지는 명문화하지 않음 — 이 부분은 [미확인].
  현재 상태: **Beta**, Workers Paid 플랜 필요(Free 플랜은 임의 수신자 발송 불가). 요금: 월 3,000건 포함 후 1,000건당 $0.35(계정·월 단위, 청구 주기 기준). API 경계에서 reject된(서프레션 리스트 등) 메일은 쿼터 미차감.
  출처: https://developers.cloudflare.com/email-service/ , https://developers.cloudflare.com/email-service/get-started/send-emails/ , https://developers.cloudflare.com/email-service/platform/pricing/

[질문 2] 최소 구성:

Worker 코드(신규 API, TypeScript):

```ts
export default {
    async fetch(req: Request, env: Env) {
        const auth = req.headers.get('Authorization')
        if (auth !== `Bearer ${env.SEND_SECRET}`) return new Response('unauthorized', { status: 401 })
        const { to, subject, html, text } = await req.json()
        const result = await env.EMAIL.send({ to, from: 'noreply@yourdomain.com', subject, html, text })
        return Response.json(result)
    },
}
```

`wrangler.jsonc`:

```jsonc
{ "send_email": [{ "name": "EMAIL" }] }
```

(레거시 `EmailMessage`+`mimetext` 방식도 여전히 지원되나 신규 `.send({...})` 객체 방식이 현재 권장 API.)
출처: https://developers.cloudflare.com/email-service/api/send-emails/workers-api/

- **인증**: Cloudflare 문서 자체가 이 패턴(Worker 엔드포인트를 커스텀 Bearer secret으로 보호 후 Vercel이 호출)을 규정하지는 않는다 — 이는 일반적인 서버-서버 호출 관행이며, 시크릿은 Worker의 환경변수(`env.SEND_SECRET`)와 Vercel의 환경변수 양쪽에 동일하게 심어 비교하는 방식. [미확인 — Cloudflare가 이 아키텍처를 "권장 패턴"으로 문서화했는지는 확인 못함, 일반 관행으로 서술]
- **발신 도메인 요건**: 도메인이 Cloudflare DNS에 있어야 하며("You must be using Cloudflare DNS to use Email Service"), 온보딩 시 MX(반송용) + SPF TXT + DKIM TXT + DMARC TXT 레코드가 자동/수동으로 추가된다.
  출처: https://developers.cloudflare.com/email-service/get-started/send-emails/
- **실패 응답 처리**: `env.EMAIL.send()` 반환값(`response`)을 검사해 실패 시 매핑 — 정확한 성공/에러 스키마(status code, error body 필드명)는 이번 조사에서 상세 확인 못함 — [미확인].

[질문 3] 대안 비교:

- **MailChannels Workers 무료 API**: **종료됨**. 2024-06-30(구 서비스)/2024-08-31 기점으로 Cloudflare Workers 대상 무료 이메일 발송 API 서비스 종료. 현재는 별도 유료 MailChannels 계정으로 전환해야 하며 이는 "Cloudflare"가 아니라 서드파티 서비스로 봐야 함.
  출처: https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/ , https://support.mailchannels.com/hc/en-us/articles/26814255454093-End-of-Life-Notice-Cloudflare-Workers
- **레거시 Email Routing `send_email` 바인딩만 사용**: verified destination address 제약 때문에 임의 최종 사용자에게 인증 메일을 못 보냄 — 트랜잭션 메일 용도로 사실상 불가.
- **Email Routing의 "reply"(수신 처리) 전용**: Email Routing은 원래 수신 이메일을 Worker/주소로 라우팅하는 기능이 핵심이며, 발신은 §질문1의 신규 Email Service(Beta)가 담당하는 기능으로 문서상 분리되어 있음.

**결론(이 프로젝트 권장안)**: Cloudflare **Email Service(Beta, Workers Paid)**를 도메인 온보딩(SPF/DKIM/DMARC via Cloudflare DNS) 후 사용. Vercel의 Next 서버(better-auth 이메일 인증 콜백)가 별도 Cloudflare Worker HTTP 엔드포인트를 Bearer 토큰으로 호출하고, 그 Worker가 `send_email` 바인딩(`env.EMAIL.send()`)으로 실제 발송을 수행하는 구조. 단, "온보딩 후 정말 완전히 임의 수신자로 검증 없이 보내지는지"는 1차 출처에서 명문화된 문장을 찾지 못해 [미확인]으로 남기며, 실제 구현 전 Cloudflare 대시보드에서 도메인 온보딩 후 실제 미검증 이메일 주소로 테스트 발송을 먼저 해보는 검증 스텝이 필요하다.

### 권장안

Cloudflare Email Service(Beta, Workers Paid 플랜)로 발신 도메인을 온보딩(Cloudflare DNS 필수 + SPF/DKIM/DMARC/MX 레코드)하고, `send_email` 바인딩을 가진 별도 Cloudflare Worker를 만들어 Vercel의 Next 서버(better-auth 이메일 인증 발송 지점)가 Bearer 시크릿으로 그 Worker HTTP 엔드포인트를 호출해 `env.EMAIL.send({to, from, subject, html, text})`로 실제 메일을 보내는 구조를 권장한다. 레거시 Email Routing `send_email` 바인딩 단독 사용이나 MailChannels 무료 API는 각각 "verified destination만 가능" / "서비스 종료"로 이 목적에 부적합하다.

### 주의

- Email Service의 이메일 발송 기능은 **Beta**이며 **Workers Paid 플랜**이 필요하다(Free 플랜 불가). 프로덕션 트랜잭션 메일에 Beta API를 쓰는 리스크를 사용자에게 알려야 한다.
- 온보딩 후에도 "완전히 임의 수신자로 검증 없이 발송 가능"이라는 문장을 1차 출처에서 직접 확인하지 못했다 — 구현 전 실제 미검증 외부 주소로 테스트 발송해 동작을 직접 검증할 것.
- 월 3,000건 초과 시 1,000건당 $0.35 과금 — 트래픽 예상량에 따라 비용 산정 필요.
- Worker↔Vercel 간 Bearer 인증은 Cloudflare가 규정한 공식 패턴이 아니라 일반적인 서버-서버 인증 관행이므로, 시크릿 로테이션·전송 구간 보안(HTTPS)은 프로젝트 쪽에서 별도로 챙겨야 한다(이 저장소의 security.md 시크릿 규칙 적용).
- `env.EMAIL.send()`의 실패 응답 스키마(에러 코드·필드)를 이번 조사에서 정확히 확인하지 못했으므로, 구현 시 Cloudflare 공식 API 레퍼런스(OpenAPI/응답 타입)를 다시 조회해 에러 핸들링을 설계해야 한다.

### 미확인

- 온보딩된 도메인에서 Email Service가 "검증 없이 완전히 임의 수신자"에게 보낼 수 있는지의 명시적 문장(문서는 verified destination 무료라는 문장만 확인, 미검증 주소 발송 가능 여부는 예시 코드로 추정)
- `env.EMAIL.send()` 반환값의 정확한 성공/실패 응답 스키마
- Worker↔Vercel Bearer 토큰 인증 방식이 Cloudflare 공식 권장 패턴인지 여부(일반 관행으로 서술, 공식 문서 확인 못함)
- Email Service Beta의 별도 대기열/신청 필요 여부, 정확한 rate limit(초당/분당) 수치
- REST API(`/accounts/{account_id}/email/sending/send`)의 Authorization Bearer 토큰이 일반 Cloudflare API 토큰인지 별도 스코프 토큰인지

## next-intl (ko 기본·ja·en)

### 답변

## 질문 1 — 버전·설정 골격

- **버전**: next-intl 최신 안정 버전은 **4.14.2** (WebSearch 스니펫 기준, npmjs.com/package/next-intl 페이지 직접 fetch는 403으로 실패 → [미확인: npm 정확 버전 넘버, 2차 출처(WebSearch 요약)만 확보]). peerDependencies는 `next: ^12 || ^13 || ^14 || ^15 || ^16`로 **Next 16 공식 지원**. 출처: WebSearch 결과 요약(github.com/amannn/next-intl CHANGELOG.md, npmjs.com/package/next-intl 언급).
- **핵심 사실 — 파일명**: next-intl 공식 문서(next-intl.dev/docs/routing/setup)가 미들웨어 파일을 **`src/proxy.ts` (formerly middleware.ts)** 로 직접 명명하고 있음 — Next 16에서 `middleware.ts`가 `proxy.ts`로 개명된 사실을 next-intl 문서 자체가 반영한 것. 즉 이 프로젝트의 기존 `proxy.ts`와 파일명 충돌 없이 **그 안에서 합치면 된다.**
- **설정 골격** (next-intl.dev/docs/routing/setup, /docs/getting-started/app-router 확인):
    - `src/i18n/routing.ts`:
        ```typescript
        import { defineRouting } from 'next-intl/routing'
        export const routing = defineRouting({
            locales: ['ko', 'ja', 'en'],
            defaultLocale: 'ko',
            localePrefix: 'as-needed', // 기본 로케일(ko)은 프리픽스 없음
        })
        ```
    - `src/i18n/request.ts`:
        ```typescript
        import { getRequestConfig } from 'next-intl/server'
        export default getRequestConfig(async () => {
            const locale = 'en' // 실제로는 requestLocale/params 로 받아야 함
            return { locale, messages: (await import(`../../messages/${locale}.json`)).default }
        })
        ```
    - `next.config.ts`:
        ```typescript
        import createNextIntlPlugin from 'next-intl/plugin'
        const withNextIntl = createNextIntlPlugin()
        export default withNextIntl({})
        ```
    - `src/proxy.ts`(next-intl 문서가 부르는 이름 그대로) — 기존 로직과 합성:
        ```typescript
        import createMiddleware from 'next-intl/middleware'
        import { routing } from './i18n/routing'
        const handleI18nRouting = createMiddleware(routing)
        export default async function proxy(request) {
            const response = handleI18nRouting(request)
            // 기존 proxy.ts 로직(토큰 리프레시·권한평가 등)을 여기서 response 에 이어붙임
            return response
        }
        export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] }
        ```
        공식 문서: "If you need to incorporate additional behavior, you can either modify the request before the next-intl middleware receives it, modify the response or even create the middleware based on dynamic configuration." (next-intl.dev/docs/routing/middleware) — **합성은 지원되는 공식 패턴**이지만, 프로젝트 고유 로직(토큰 리프레시, X-Context-Id, 권한평가 등)을 정확히 어느 지점에 끼울지는 [미확인] — trip 프로젝트의 실제 proxy.ts 코드를 직접 읽어야 확정 가능(리서치 범위 밖, 저장소 미수정 원칙).
    - `app/[locale]/layout.tsx`:
        ```typescript
        import {hasLocale} from 'next-intl'
        import {notFound} from 'next/navigation'
        import {setRequestLocale} from 'next-intl/server'
        import {routing} from '@/i18n/routing'
        export default async function LocaleLayout({children, params}) {
          const {locale} = await params
          if (!hasLocale(routing.locales, locale)) notFound()
          setRequestLocale(locale)
          return ( ... )
        }
        ```

## 질문 2 — 사용법·메시지 구조·타입 안전

- **서버 컴포넌트**: `getTranslations()` (async), **클라이언트**: `useTranslations()`. `generateMetadata`에서도 `getTranslations('Metadata')`로 동일 패턴 사용 (next-intl.dev/docs/environments/actions-metadata-route-handlers, 코드 확인).
- **Server Action**: 액션 함수 안에서 `await getTranslations({namespace, locale})` — locale은 명시적으로 전달해야 함(액션 컨텍스트엔 request가 없어 자동 감지 불가). 공식 예시 확인.
- **zod 오류 메시지 번역**: 공식 문서에서 zod와의 직접 연동 예시는 이번 fetch 범위(configuration, actions-metadata-route-handlers 페이지)에서 확인되지 않음 → **[미확인]**. 일반적으로 `t()`로 각 검증 실패 케이스별 메시지를 만들어 zod의 `.refine`/`superRefine`의 `message` 필드에 넣는 방식이 커뮤니티 패턴이나, next-intl 1차 문서에서 공식 가이드는 못 찾음. 구현 직전 next-intl.dev 사이트 검색(`zod`)으로 재확인 필요.
- **날짜/숫자 포맷**: `useFormatter()`(클라)/`getFormatter()`(서버)가 `formats` 설정(`dateTime`/`number`/`list`/`displayName`)을 사용. dayjs와의 병용 방식(예: dayjs 객체를 Date로 변환 후 formatter에 넘기는 것)은 이번 확인 범위에서 구체 예시 미확인 → **[미확인]**. dayjs는 프로젝트 컨벤션(common.md §9)상 유지하되, locale 문자열(`ko`/`ja`/`en`)을 dayjs `.locale()`에 별도로 맞춰줘야 할 가능성 높음(next-intl과 dayjs가 로케일 상태를 공유하지 않음) — 이 부분은 사용자 확인 필요.
- **메시지 파일 구조**: `messages/ko.json`, `messages/ja.json`, `messages/en.json` — 최상위 키가 네임스페이스(`{"HomePage": {"title": "..."}}`) (공식 문서 확인).
- **타입 안전 키**: `global.d.ts`에서
    ```typescript
    import type messages from './messages/en.json'
    type Messages = typeof messages
    declare global {
        interface IntlMessages extends Messages {}
    }
    ```
    기준 로케일(en 또는 ko 중 스키마가 가장 완전한 파일)을 골라 이 타입을 유도한다 (공식 문서 확인, common.md §5.3의 "원본에서 유도" 원칙과 정합).

## 질문 3 — Link/redirect/typedRoutes·언어전환·라우트 이전

- **`createNavigation(routing)`** → `{Link, redirect, usePathname, useRouter, getPathname}` 반환 (공식 문서 확인, next-intl.dev/docs/routing/navigation).
- **typedRoutes 호환**: next-intl 공식 문서(해당 페이지)에서 `experimental.typedRoutes`/Next `typedRoutes`에 대한 명시적 언급은 확인되지 않음 → **[미확인]**. 단, `pathnames` 설정을 쓰면 "internal pathnames ... will be strictly typed and localized"라는 문구는 있어 next-intl 자체 타입 시스템은 있으나, 이것이 Next.js의 `typedRoutes`(자동 생성 `.next/types` route 타입)와 통합되는지는 별개 사안 — 실제 프로젝트에 next-intl `Link`를 붙여보고 `next build` 시 타입 에러 여부로 실측 검증 필요.
- **언어 전환 UI**: `usePathname()` + `useRouter().replace(pathname, {locale: 'ja'})` 조합이 공식 패턴(next-intl.dev/docs/routing/navigation 인용: "combining usePathname with useRouter, you can change the locale ... by navigating to the same pathname, while overriding the locale"). `NEXT_LOCALE` 쿠키는 `localePrefix` 설정과 연관된다는 언급만 확인, 쿠키 저장/판독의 구체 메커니즘 코드는 이번 fetch 범위에서 미확인 → **[미확인]** — next-intl.dev/docs/routing/middleware 또는 별도 "locale switcher" 러닝 챕터(learn.next-intl.dev)에서 재확인 필요.
- **기존 라우트를 `app/[locale]/` 아래로 이전**: 공식 문서에서 route group 관련 명시적 확인은 이번 범위에서 안 됨 → **[미확인]**. 다만 Next.js App Router 자체 규칙상 route group `(shell)`/`(public)`은 URL 세그먼트를 만들지 않으므로 `app/[locale]/(shell)/...`, `app/[locale]/(public)/...` 형태로 `[locale]` 안쪽에 그대로 유지 가능할 것으로 판단되나(Next.js 공식 라우팅 규칙 기반 추론, next-intl 1차 문서로 직접 확인 못함), **1차 출처로 미확정**이므로 구현 전 next-intl 예제 레포(app-router 스타터, GitHub `amannn/next-intl/examples`)로 재확인 권고.
- **API 라우트**: `app/api/**`는 `[locale]` 밖에 그대로 둔다 — Route Handler에서 로케일이 필요하면 질문2에서 확인한 것처럼 쿼리파라미터 등으로 명시적으로 전달(자동 감지 없음, 공식 예시 확인).
- **sitemap/not-found**: 이번 확인 범위에서 미확인 — [미확인].
- **proxy matcher**: 공식 예시 `matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'` 확인. trip 프로젝트 기존 `proxy.ts`의 matcher와 **합집합(OR 배열)**으로 병합해야 하며, 배열 형태 다중 matcher 문법(`matcher: [a, b]`, 로직 OR)도 공식 문서에서 확인.

### 권장안

1. `src/i18n/routing.ts`에 `defineRouting({locales:['ko','ja','en'], defaultLocale:'ko', localePrefix:'as-needed'})` — ko만 프리픽스 없음 요구사항과 정확히 일치.
2. `src/i18n/navigation.ts`에서 `createNavigation(routing)`으로 Link/redirect/usePathname/useRouter를 export하고, 프로젝트 전역에서 `next/link`·`next/navigation` 대신 이걸 쓰도록 통일(단, `useSearchParams`/`useParams`는 gumba 사례처럼 next-intl도 export 안 할 가능성 높으니 그대로 `next/navigation` 유지 — reference.md의 vender 패턴과 동일 구조로 안착 가능).
3. 기존 `proxy.ts`는 파일명을 유지한 채 최상단에서 `createMiddleware(routing)` 결과를 받아, 그 뒤에 기존 토큰 리프레시·권한평가 로직을 이어붙이는 합성 함수로 리팩터링 — 공식적으로 지원되는 패턴이므로 "우회" 아님.
4. `app/[locale]/` 하위에 기존 route group(`(shell)`, `(public)`)을 그대로 이식하고, `app/api/**`는 `[locale]` 바깥에 유지.
5. 메시지 타입 안전은 `ko.json`을 기준 스키마로 `global.d.ts`에 `Messages` 선언(공통 컨벤션 "원본에서 유도" 원칙과 일치).
6. 착수 전 반드시 사용자와 1줄 객관식으로 확인할 지점: (a) proxy.ts 합성 시 정확한 실행 순서(i18n 미들웨어 먼저 vs 인증 로직 먼저), (b) dayjs locale 동기화 방식, (c) zod 에러 메시지 번역 방식 — 전부 [미확인]이라 공식 문서 재확인 또는 실제 코드 스파이크가 선행되어야 함.

### 주의

- 이 응답은 리서치 전용 규칙에 따라 저장소를 전혀 수정하지 않았다. 실제 적용 전 trip의 기존 `src/proxy.ts` 전문을 통독해 합성 지점을 정확히 잡아야 한다(가정으로 코드를 쓰지 않는다는 ai-process.md 원칙).
- next-intl 최신 버전 넘버(4.14.2)는 npmjs.com 직접 fetch가 403으로 막혀 **2차 출처(WebSearch 요약)** 로만 확보됨 — 실제 설치 전 `npm view next-intl version` 또는 `bun pm ls`로 재확인 필요.
- typedRoutes 호환성, sitemap/not-found 처리, NEXT_LOCALE 쿠키 메커니즘, zod 에러 번역, dayjs 로케일 동기화는 1차 출처로 확정하지 못한 [미확인] 항목이며, 구현 직전 공식 문서 재확인이 필수(ai-process.md 원칙 15).
- 질문당 3개 이내로 제한했으므로 next-intl의 `pathnames`(다국어 슬러그) 기능, 도메인 기반 라우팅, ICU 복수형 등은 조사하지 않았다.

### 미확인

- next-intl 정확한 최신 버전 넘버 및 peerDependencies 원문(npmjs.com 403으로 1차 확인 실패, WebSearch 요약만 확보)
- zod 폼/서버 액션 검증 에러 메시지의 next-intl 공식 번역 연동 패턴
- useFormatter/getFormatter와 dayjs 병용 시 로케일 동기화 방법
- Next.js `typedRoutes`와 next-intl `createNavigation`/`Link`의 실제 타입 호환 여부
- route group(`(shell)`, `(public)`)을 `app/[locale]/` 아래로 옮길 때의 next-intl 공식 가이드(추론만 있고 1차 확인 없음)
- sitemap.ts/not-found.tsx의 다국어 처리 공식 패턴
- NEXT_LOCALE 쿠키의 정확한 설정/판독 메커니즘 코드
- trip 프로젝트 기존 `proxy.ts`의 실제 로직 내용(리서치 범위상 열람하지 않음)

## better-auth 이메일 인증 · Naver/GitHub OAuth · korean-law-mcp

### 답변

## 질문 1 — 이메일 인증 (better-auth 1.7.3)

근거: `node_modules/better-auth/dist/api/routes/sign-up.mjs:162,248-256`, `node_modules/better-auth/dist/api/routes/email-verification.mjs:14-37,297-317`, `node_modules/better-auth/dist/api/routes/email-verification.d.mts`

- `emailAndPassword.requireEmailVerification: boolean` — true면 회원가입 응답에서 `shouldReturnGenericDuplicateResponse`가 켜져 이메일 중복 여부를 노출하지 않는 제네릭 응답을 돌려주고(sign-up.mjs:162), `autoSignIn` 여부와 무관하게 자동 로그인을 건너뛴다.
- `emailVerification.sendOnSignUp ?? emailAndPassword.requireEmailVerification` (sign-up.mjs:248) — 가입 직후 인증 메일 발송 여부. `sendOnSignUp`을 명시하지 않으면 `requireEmailVerification` 값을 그대로 물려받는다.
- `emailVerification.sendVerificationEmail({ user, url, token }, request)` — 유일한 발송 훅. `url`은 `${baseURL}/verify-email?token=...&callbackURL=...` 형태로 이미 완성돼 있어 앱이 직접 URL을 조립할 필요가 없다(email-verification.mjs:29-31).
- `emailVerification.expiresIn` (초, 기본 `3600`) — `createEmailVerificationToken`의 4번째 인자 기본값이다(email-verification.mjs:14).
- `emailVerification.autoSignInAfterVerification` — true면 `/verify-email` 성공 시 세션 쿠키를 자동 발급(기존 세션 있으면 그대로 승격, 없으면 신규 세션 생성)한다(email-verification.mjs:297-316).
- 인증 완료 후 리다이렉트는 `verifyEmail` 쿼리의 `callbackURL`로 처리된다. 있으면 `ctx.redirect(callbackURL)`, 없으면 JSON 응답(`{status, user}`)만 반환한다(email-verification.mjs:238,317). 에러 시에도 `callbackURL`이 있으면 `?error=<code>`를 붙여 그쪽으로 리다이렉트한다(email-verification.mjs:167-173).
- 재발송은 서버 엔드포인트 `POST /send-verification-email` (email-verification.d.mts) — 클라이언트에서는 `authClient.sendVerificationEmail({ email, callbackURL })`로 호출한다(better-auth 표준 REST-액션 매핑, 이 프로젝트 `shared/lib/auth-client.ts`엔 아직 노출 안 됨).

이 레포 반영 상태 (`shared/lib/auth.ts:31-35`): `emailAndPassword.requireEmailVerification: false`이고 `emailVerification` 옵션 자체가 없다 — `docs/acknowledge/0003-auth-email-password-username.md`의 "이메일 인증 없음" 결정과 일치한다. 이메일 인증을 붙이려면 `emailVerification: { sendOnSignUp, sendVerificationEmail, autoSignInAfterVerification, expiresIn }` 블록을 새로 추가해야 하고, `sendVerificationEmail`이 실제 메일 발송기(Resend 등)를 호출하는 구현체가 필요하다. `shared/lib/auth-client.ts`는 현재 `usernameClient()`, `adminClient()`만 plugin으로 물려 있고 `sendVerificationEmail`/`useVerifyEmail` 등은 better-auth core client에 기본 내장되어 있어 플러그인 추가 없이 `authClient.sendVerificationEmail(...)`, `authClient.verifyEmail(...)`로 바로 호출 가능하다.

## 질문 2 — GitHub·Naver OAuth, username 필수 문제

근거: `node_modules/better-auth/dist/plugins/generic-oauth/index.mjs:61-277`, `node_modules/better-auth/dist/plugins/generic-oauth/types.d.mts:150-166`, `node_modules/better-auth/dist/api/routes/callback.mjs:26`, `node_modules/better-auth/dist/plugins/username/index.mjs:63-108`

- **GitHub**: `socialProviders: { github: { clientId, clientSecret } }` — 문서대로 표준 소셜 프로바이더. 콜백은 `/api/auth/callback/github`.
- **Naver — 이 버전(1.7.3)의 실제 동작은 흔히 도는 예전 문서(“signIn.oauth2 + /oauth2/callback/:id + genericOAuthClient”)와 다르다.** 소스 주석에 명시: "Providers are used through the standard `signIn.social` and `callback/:id` core endpoints — no plugin-specific endpoints needed."(index.mjs:61-66) `genericOAuth({ config: [...] })`가 `init` 훅에서 각 config를 `ctx.socialProviders`에 그대로 병합해(index.mjs:270-272) **일반 소셜 프로바이더로 등록**한다. 따라서:
    - 서버: `plugins: [genericOAuth({ config: [{ providerId: 'naver', clientId, clientSecret, authorizationUrl: 'https://nid.naver.com/oauth2.0/authorize', tokenUrl: 'https://nid.naver.com/oauth2.0/token', userInfoUrl: 'https://openapi.naver.com/v1/nid/me', getUserInfo, mapProfileToUser }] })]`
    - 클라이언트: 별도 `genericOAuthClient()` 불필요(이 경로는 export되지 않음 — package.json에 `./plugins/generic-oauth` export가 존재하긴 하나 index.mjs가 export하는 건 서버 함수들뿐이다). `authClient.signIn.social({ provider: 'naver', callbackURL })`로 그대로 호출한다(usernameClient/adminClient와 동급으로 core에 내장).
    - **콜백 URL은 `/api/auth/callback/naver`** 다(core `/callback/:id` 라우트, callback.mjs:26). `/api/auth/oauth2/callback/naver`가 아니다 — 네이버 개발자센터 "Callback URL" 등록 값도 이에 맞춰야 한다.
    - `getUserInfo(tokens)` 기본 구현(`fetchUserInfo`, index.mjs:34-59)은 `raw.email`/`raw.image`(← `picture`)/`raw.name`을 최상위에서 읽는데, **네이버 `/v1/nid/me` 응답은 `{ resultcode, message, response: { id, email, nickname, profile_image, ... } }`로 한 겹 감싸져 있어 기본 매핑이 그대로는 안 맞는다.** 반드시 커스텀 `getUserInfo`로 `response`를 벗겨서 반환해야 한다:
        ```ts
        getUserInfo: async (tokens) => {
            const { data } = await betterFetch('https://openapi.naver.com/v1/nid/me', { headers: { Authorization: `Bearer ${tokens.accessToken}` } })
            const p = data.response
            return { id: p.id, email: p.email, name: p.nickname, image: p.profile_image, emailVerified: true }
        }
        ```
        (naver는 email_verified 필드를 안 주므로 정책적으로 true/false를 정해야 함 — [미확인]: 네이버 계정 이메일이 실제로 검증된 것인지는 네이버 응답만으로 보증 불가, 정책 판단 필요)
    - `accountSubject`(옛 `linkAccount` 관련 옵션)로 provider의 불변 식별자 필드를 지정할 수 있다 — 기본은 OIDC discovery면 `sub`, 아니면 `id`. 네이버는 discoveryUrl을 안 쓰므로 기본이 `profile.id`가 되어 `getUserInfo`가 반환하는 `id` 필드를 그대로 계정 식별자로 쓴다.
    - "같은 이메일 계정 연동(account linking)" 자체는 better-auth core의 `account` 설정(`account.accountLinking.enabled`, `trustedProviders`) 영역이며 genericOAuth 옵션이 아니다 — [미확인] 이 레포 `shared/lib/auth.ts`엔 `account` 블록이 없어 기본값(다른 프로바이더 간 자동 링크는 이메일 신뢰 필요) 그대로다. GitHub는 이메일 비공개 가능성이 있어 신뢰 프로바이더 설정을 검토해야 함.

- **username 필수 문제**: `username` 플러그인은 값이 없으면 그냥 통과시키는 구조다 — `if (username) { validate/normalize } ...` 형태로 **username이 없어도 에러를 던지지 않는다**(plugins/username/index.mjs:68-108). 이 레포 DB 스키마도 `username: varchar(...).unique()`로 **nullable**이다(`shared/db/schema/auth.ts:13`, `.notNull()` 없음). 즉 better-auth·DB 레벨에서는 소셜 가입 시 username이 비어도 깨지지 않는다. 다만 ADR-0003/0017이 "username을 name에 저장"하는 자체 회원가입 정책을 세워둔 상태라, 소셜 로그인이 들어오면 username이 비는 사용자가 실제로 생긴다. 일반적 해법(better-auth 공식 패턴): `databaseHooks.user.create.before`에서 `user.username`이 없으면 (닉네임/이메일 로컬파트 기반) 후보를 만들고 `isUsernameAvailable`류 조회로 중복 시 suffix를 붙여 채워주거나, 로그인 직후 온보딩 화면에서 `authClient.updateUser({ username })`으로 강제 입력받는다. 이건 better-auth 자체 기능이 아니라 이 프로젝트가 결정할 정책이라 [미확인]으로 남기고 별도 ADR이 필요하다고 본다.

## 질문 3 — korean-law-mcp

출처: `https://github.com/chrisryugj/korean-law-mcp` README (gh api로 원문 fetch, 2026-09-10 기준 v4.12.0)

- **정체**: 법제처(국가법령정보센터) Open API 42개를 **10개 MCP 도구**로 감싼 서버+CLI. 법령·판례·행정규칙·자치법규·조약·해석례(국세청 포함)를 조회하고, 인용 검증(`verify_citations`, `legal_analysis(mode=verify_citations)`)·조문 영향 그래프(`impact_map`)·시점 비교(`time_travel`)·행위시법 판단(`applicable_law`)·판례 생사 확인(`cite_check`)·조례 정비 레이더(`ordinance_radar`)·5단계 행동안내(`action_plan`/`legal_research`) 등을 제공한다. 대표 도구명: `search_law`, `get_law_text`, `search_decisions`, `get_decision_text`, `get_annexes`, `legal_research`, `legal_analysis`, `discover_tools`, `execute_tool`, `ordinance_radar`(README "42개 API를 10개 도구로" 및 v4.4.0/v4.7.0 절 근거).
- **필요 키**: 법제처 Open API 인증키(OC) 1개, 무료 — `https://open.law.go.kr/LSO/openApi/guideList.do`에서 회원가입 후 "Open API 사용 신청"으로 즉시 발급. 로컬/데스크톱 설치 시 환경변수 `LAW_OC=<발급키>`로 전달, 원격 커넥터는 URL 쿼리 `?oc=<발급키>`로 전달.
- **설치·실행**: (1) Claude Code 플러그인: `/plugin marketplace add chrisryugj/korean-law-mcp` → `/plugin install korean-law@korean-law-marketplace` (설치 중 OC 키 프롬프트). (2) claude.ai 커스텀 커넥터: URL `https://mcp.gomdori.app/law?oc=<OC>` 등록 후 도구 "항상 사용" 설정. (3) Claude Desktop/Cursor/Windsurf 등: `mcp.json`에 원격 URL 또는 `npx -y mcp-remote <URL>` 등록. (4) 로컬 설치: Node 20.19+ 필요, `npx --ignore-scripts --omit=optional korean-law-mcp setup` 마법사 또는 `npm install -g korean-law-mcp` 후 CLI(`korean-law search_law --query "..."`)로 사용.
- **약관/정책 초안 작성에의 활용**: 이 MCP는 법제처가 서비스하는 **법률 원문 그 자체**를 조회하므로, 트립 프로젝트의 이용약관·개인정보처리방침 초안에 인용할 조문을 1차 출처로 확인하는 용도로 쓸 수 있다 — 예: `search_law("전자상거래 등에서의 소비자보호에 관한 법률")` → `get_law_text`로 청약철회·환불 관련 조문 원문 확보, `search_law("정보통신망 이용촉진 및 정보보호 등에 관한 법률")`·`search_law("개인정보보호법")`로 개인정보 수집·이용·제3자 제공 관련 조문 확보. 초안 작성 후에는 `verify_citations`/`legal_analysis(mode=verify_citations)`로 문서 안에 적어 넣은 조번호·조문제목이 실제로 존재·일치하는지(예: "개인정보보호법 제17조" 같은 인용이 실존하는지, 제목이 맞는지) 교차검증할 수 있어 — README가 강조하는 핵심 가치가 바로 이 "LLM이 지어낸 존재하지 않는 조문 인용 차단"이다. 단, 이 도구는 **법률 텍스트 조회·검증 엔진**이지 약관 문서 자체를 생성하거나 법률 자문을 제공하지 않으며, 특정 서비스에 적용되는 방침·약관의 타당성 판단(법무 검토)은 대체하지 못한다.

### 권장안

1. **이메일 인증 도입 시**: `shared/lib/auth.ts`의 `emailAndPassword`에 `requireEmailVerification: true`(정책에 따라)를 추가하고, 새 `emailVerification: { sendOnSignUp: true, expiresIn: 3600(또는 원하는 값), autoSignInAfterVerification: true, sendVerificationEmail: async ({ user, url }) => { /* 메일 발송기 호출 */ } }` 블록을 신설한다. `sendVerificationEmail` 구현은 이 레포에 아직 없는 메일 발송 서비스(예: Resend)와의 연동이 선행돼야 하므로 별도 ADR/작업으로 분리 권장. 클라이언트는 `shared/lib/auth-client.ts`를 수정할 필요 없이(플러그인 불필요) `authClient.sendVerificationEmail({ email, callbackURL })`, `authClient.verifyEmail`을 그대로 쓸 수 있다.
2. **GitHub 추가**: `socialProviders.github({ clientId, clientSecret })`만 추가하면 되고 클라이언트 코드 변경도 불필요.
3. **Naver 추가**: `genericOAuth` 서버 플러그인만 추가(클라이언트 플러그인 불필요, `authClient.signIn.social({ provider: 'naver' })`로 호출). 반드시 커스텀 `getUserInfo`로 네이버의 `response` 래핑을 해제해야 하고, 네이버 개발자센터 Callback URL은 `{BETTER_AUTH_URL}/api/auth/callback/naver`로 등록해야 한다.
4. **username 공백 문제**: better-auth·DB 스키마 모두 nullable을 허용하므로 시스템적으로는 깨지지 않는다. 다만 앱 정책상 username이 필수인 화면들이 있다면 `databaseHooks.user.create.before`에서 자동 후보 생성 또는 로그인 후 온보딩에서 `updateUser`로 채우게 하는 두 방식 중 결정이 필요 — 사용자에게 1줄 객관식으로 확인 후 새 ADR로 기록 권장.
5. **korean-law-mcp**는 트립 프로젝트의 코드 의존성이 아니라 "약관/정책 초안 작성 시 참고 도구"로만 쓰면 되고, 저장소에 통합 설치할 필요 없이 Claude Code 플러그인 또는 claude.ai 커넥터로 그때그때 조회하면 충분하다.

### 주의

- Naver `genericOAuth` 콜백 경로는 세간에 도는 예전 better-auth 튜토리얼(`/oauth2/callback/:id`, `genericOAuthClient()`)과 다르다 — 1.7.3 기준 소스로 재확인한 `/callback/:id`(=`/api/auth/callback/naver`)를 반드시 따를 것. 오래된 블로그·문서 그대로 베끼면 리다이렉트가 깨진다.
- 네이버 `/v1/nid/me` 응답이 `response` 객체로 감싸져 있다는 점을 놓치면 `getUserInfo` 기본 구현으로는 email/name/image가 전부 `undefined`가 되어 계정 생성이 실패하거나 빈 프로필이 만들어진다.
- `emailAndPassword.requireEmailVerification`을 켜면 회원가입 응답이 "제네릭 중복 응답"으로 바뀌어(이메일 존재 여부 비노출) 기존 프론트 에러 처리 로직(예: "이미 가입된 이메일입니다" 즉시 안내)이 그대로는 안 먹을 수 있다 — 프론트 폼 에러 UX도 함께 검토 필요.
- account linking(같은 이메일로 가입된 계정에 소셜 로그인을 자동 연결할지) 정책은 이번 리서치에서 코드까지 확인하지 못했다 — 도입 전 별도 확인 필요.
- korean-law-mcp는 서드파티(비공식) 프로젝트이며 법제처 공식 서비스가 아니다. 법적 효력이 있는 약관·정책 문서는 반드시 사람(법무)이 최종 검토해야 하고, 이 도구의 인용 검증은 "조문 실존 여부" 확인이지 "법적 타당성" 보증이 아니다.

### 미확인

- [미확인] 네이버 계정의 이메일이 실제로 검증된 이메일인지(emailVerified 처리 정책)는 네이버 API 응답만으로 확정할 수 없음 — 정책 판단 필요.
- [미확인] better-auth `account.accountLinking` 관련 옵션(같은 이메일 계정 자동 연동 여부/신뢰 프로바이더 설정)의 정확한 필드명·기본 동작은 이번 세션에서 소스까지 열어보지 못함(시간 상한 내 우선순위에서 제외).
- [미확인] 소셜 가입 시 username 자동 생성 정책(자동 생성 vs 온보딩 강제 입력)은 better-auth가 정하는 것이 아니라 이 프로젝트가 결정할 사항이며, 아직 ADR로 확정되지 않음.
- [미확인] korean-law-mcp의 정확한 "현재 10개 도구"의 개별 입력 스키마(파라미터)는 README 요약 수준까지만 확인했고 node_modules처럼 1차 소스 타입 파일을 직접 열어보지는 않음(패키지가 이 프로젝트 의존성이 아니므로 로컬에 없음).
- [미확인] `authClient.sendVerificationEmail`/`verifyEmail`이 이 프로젝트의 `usernameClient()+adminClient()` 플러그인 조합과 타입 충돌 없이 바로 동작하는지는 실제 타입체크로 검증하지 않음(리서치 규칙상 코드 미수정).
