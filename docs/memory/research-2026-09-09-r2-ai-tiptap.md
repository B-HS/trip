# 리서치 메모 — R2 · AI SDK · Tiptap (2026-09-09, Opus 에이전트 10분 리서치)

> 로드맵 2·4·6·7 의 ADR 작성용 사실 목록. 구현 직전 공식 문서로 재확인한다. `[미확인]` 은 1차 출처를 못 찾은 항목.

## Cloudflare R2

- `@aws-sdk/client-s3` 3.1128 + `@aws-sdk/s3-request-presigner`(동일 버전). `S3Client({ region: 'auto', endpoint: 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com', credentials })`, `PutObjectCommand({ Bucket, Key, ContentType, Body })`. env: `R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_HOST`. 출처 https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/
- 공개 읽기: 버킷 Settings → Public Development URL 은 **`r2.dev` 서브도메인이며 rate-limited·개발 전용**. 프로덕션은 Settings → Custom Domains 로 Cloudflare zone 도메인 연결. `next/image` 는 `images.remotePatterns: [{ protocol: 'https', hostname, pathname: '/**' }]` 또는 `new URL('https://host/**')`. 출처 https://developers.cloudflare.com/r2/buckets/public-buckets/
- presigned PUT 을 브라우저에서 쓰려면 **버킷 CORS 설정 필수**(대시보드 Settings → CORS Policy 또는 `wrangler r2 bucket cors set`; `AllowedOrigins`·`AllowedMethods: ['PUT']`·`AllowedHeaders: ['Content-Type']`). 서버 경유 업로드는 CORS 불필요. 출처 https://developers.cloudflare.com/r2/buckets/cors/
- `[미확인]` `r2.dev` URL 의 정확한 문자열 포맷.

## AI SDK + 3 프로바이더

- npm latest: `ai` **7.0.94**(v6 는 `ai@ai-v6` 태그 6.0.278). 프로바이더 `@ai-sdk/openai` 4.0.62, `@ai-sdk/anthropic` 4.0.50, `@ai-sdk/openai-compatible` 3.0.45(peer zod ^3.25.76 || ^4.1.8 → 프로젝트 zod 4.5.4 호환). 사용자 키 주입은 `createOpenAI({ apiKey })`, `createAnthropic({ apiKey })`.
- Ollama Cloud: base `https://ollama.com`, `Authorization: Bearer <OLLAMA_API_KEY>`. OpenAI 호환 `https://ollama.com/v1`(`/v1/chat/completions`, `/v1/models`, `/v1/embeddings`, `/v1/responses`). 모델 목록은 네이티브 `GET /api/tags` 또는 `GET /v1/models`. AI SDK: `createOpenAICompatible({ name: 'ollama', apiKey, baseURL: 'https://ollama.com/v1' })`. 출처 https://docs.ollama.com/cloud , https://docs.ollama.com/api/openai-compatibility
- 추론 강도: OpenAI `providerOptions.openai.reasoningEffort`(`none|low|medium|high|xhigh|max`, 기본 medium; `/v1/models` 응답에 capability 필드가 없어 **모델 ID 로 판별**). Anthropic `providerOptions.anthropic.thinking`(`{ type: 'adaptive' }` 또는 `{ type: 'enabled', budgetTokens }`, adaptive + effort `low|medium|high|max`); `GET /v1/models`(헤더 `anthropic-version: 2023-06-01`, `x-api-key`) 응답의 `capabilities.thinking.supported`·`capabilities.effort` 로 정확히 판별, 페이지네이션 `after_id/limit`. Ollama 네이티브 `/api/chat` 의 `think`(`true|false` 또는 `low|medium|high|max`). `[미확인]` Ollama OpenAI 호환 경로에서 `think` 전달 방법.
- Next `after()`(`next/server`): Route Handler 안에서 응답 뒤 작업, 라우트 `maxDuration` 안에서 실행. Vercel Fluid: Hobby 기본·최대 300s, Pro 기본 300s·최대 800s. Cron 은 `vercel.json` `crons: [{ path, schedule }]`(프로덕션만, UTC, UA `vercel-cron/1.0`). `[미확인]` `CRON_SECRET` 검증 예제, `vercel.ts` cron 지원.

## Tiptap 3 + YouTube

- `@tiptap/react`·`@tiptap/starter-kit`·`@tiptap/pm`·`@tiptap/extension-youtube`·`@tiptap/html` 모두 **3.31.3**(정확히 같은 버전으로 고정, React 19 peer OK).
- YouTube 확장 옵션: `inline`·`width(640)`·`height(480)`·`controls`·`nocookie`·`allowFullscreen`·`autoplay`·`modestBranding` 등, 커맨드 `setYoutubeVideo({ src, width?, height? })`, 허용 URL 은 `youtube.com`/`youtu.be`/`youtube-nocookie.com`(www·m·music). JSON: `{ type: 'youtube', attrs: { src, start, width, height } }`.
- 서버 렌더: `@tiptap/html` `generateHTML(doc, [StarterKit, Youtube])` — **peer `happy-dom ^20.8.9` 필요**(서버 런타임 의존성으로 승격). `isomorphic-dompurify` 4.2.0 으로 sanitize 시 `ADD_TAGS: ['iframe']` 만으로는 임의 도메인 iframe 이 통과하므로 `uponSanitizeElement` hook 으로 `src` 를 `https://www.youtube(-nocookie).com/embed/` 로 화이트리스트. `[미확인]` DOMPurify hook 예제의 공식 원문.

## Vercel Queues (추가 리서치, 5분)

- 과금은 API operation 당(send·receive·delete·visibility·notify, 4 KiB 청크 단위), 100만 operation 당 $0.60~0.96. 무료 포함량은 문서에 없음(Pro 표에 N/A), 베타여도 과금. Hobby 가용성은 changelog "all teams" 외 근거 없음 `[미확인]`. 출처 https://vercel.com/docs/queues/pricing , https://vercel.com/docs/limits
- 제한: 메시지 100MB, TTL 최대 7일, 지연 최대 7일, visibility 최대 60분, 재시도 무한(32회 초과 지수 백오프, DLQ 없음), 컨슈머 실행 시간은 Functions `maxDuration`(Hobby 300s 고정). 컨슈머는 공개 URL 없음(OIDC 자동).
- 코드: `@vercel/queue` 의 `send(topic, payload)` + `handleCallback(async (payload) => …)`, `vercel.json` `functions[route].experimentalTriggers: [{ type: 'queue/v2beta', topic }]`. 로컬은 `vercel link` → `vercel env pull` 로 OIDC 토큰 필요, `next dev` 지원. 출처 https://vercel.com/docs/queues/quickstart
- 대안: Vercel Workflows(`workflow` 패키지, Hobby 월 50,000 events 포함, 내부적으로 Queues 요금 추가), Cron 은 Hobby 에서 **하루 1회 최소 주기**(분 단위 불가) → `after()` + Cron 1분 sweep 안은 Hobby 에서 불가.
- 비용 추정: 일 100건이면 월 9,000~12,000 operations ≈ $0.01 미만. 실제 비용은 AI 대기 시간이 아닌 Functions Active CPU 로 결정(일 100건은 Hobby 무료 한도 안일 가능성).
