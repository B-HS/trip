# HANDOFF — 2026-09-12 인증 확장 6단계 구현 스냅샷

> 인증 확장 구현은 아직 커밋·배포하지 않았다. 조건부 GitHub·Naver OAuth, Cloudflare Email Worker 이메일 인증, 가입 필수 약관·개인정보 동의, 다국어 법적 페이지와 `trip_user_consent` 마이그레이션 0010을 추가했다. typecheck·lint·prettier·`bun test` **585 pass / 0 fail**·Webpack 프로덕션 빌드(44 pages)를 통과했다. OAuth/Worker 운영 키가 없으면 기능은 비활성화되고 로그인 화면에 안내가 표시된다. 마이그레이션 0010은 생성만 했으며 DB 적용과 실제 메일 발송 검증은 운영 작업으로 남아 있다.

## Phase 9 developer API handoff

`/api/v1` owner-scoped trip API와 `/api/v1/openapi.json`, `/developers`, `/settings/api` 토큰 lifecycle UI가 구현되었다(ADR-0041). Personal access token 원문은 한 번만 반환하고 SHA-256 hash만 저장하며, `trips:read`·`trips:write`·`token:inspect` scope와 bearer-only parsing, token별 read/write sliding-window limit, mutation idempotency key를 적용한다. 검증된 도메인 서비스와 `tripTemplateSchema`를 재사용하므로 멤버 트립·공개 링크로 권한이 확장되지 않는다.

통합 시 `0010_trip-consent.sql` → `0011_ai.sql` → `0012_developer-api-tokens.sql` 순서로 journal과 snapshot이 일치하는지 확인한다. 현재 idempotency/rate-limit은 프로세스 로컬이므로 다중 인스턴스 운영 전 공유 저장소로 승격한다. 운영 배포 전 `/api/v1/openapi.json`, 401/403/404/429 계약, 토큰 원문 로그 미노출, owner-only 결과를 smoke test한다.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 + 커뮤니티 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본 + Tiptap + next-intl)으로 재구현해 `trip.gumyo.net`(Vercel Pro, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

5단계 i18n 2차, 6단계 인증 확장, 7단계 AI, 8단계 SEO, 9단계 개발자 API 코드 구현까지 완료했다. 다음은 운영 환경 설정·마이그레이션 적용·배포 검증과 다중 인스턴스 rate-limit/idempotency 저장소 승격이다.

## 3. 완료 / 진행 중 / 미착수

### 4-5 커뮤니티 확장 (ADR-0037) — 완료·배포됨

- 데이터: `d62de70`(ADR) → `1a3a5a2`(마이그레이션 0008, 추가 전용) → `c807a7a`(entities·액션) → `181ab9c`(테스트) → `544a9a4`·`8134779`(docs·style). 마이그레이션 **DB 적용 완료**: 이력 9행, `trip_report`·`trip_user_block` 생성, `trip_post`·`trip_comment`.`deleted_at`, `trip_point_ledger.reason` enum `revoked` — 실DB 검증.
- UI: `a297162`(viewerId 스레딩) → `a6d0714`(소프트 삭제 문구·"삭제된 댓글"·채택 이동·신고/차단 셀) → `204176e`(프로필 차단/차단해제·차단 목록·닉네임 폼·대문 `max-h-64`) → `0a828f4`·`e3d9bba`(`/admin/reports` admin 큐 + dayjs 타임스탬프) → `befed3f`(PROCESS 4-5 완료).

### 5단계 i18n (ADR-0038) — 1차 배포 완료, 2차 작업 트리 완료

- `13cc729` next-intl 4.14.4·routing(as-needed ko 기본)·proxy 합성·`app/[locale]/` 재구조화
- `f8697db`·`8357c52` app-shell 내비·app 페이지 metadata/copy
- `7084333` 헤더 언어 전환기(`router.replace(pathname,{locale})` → NEXT_LOCALE 쿠키)
- `2d2dc97` community 전역, `92ac2df`·`17a53b2` profile + 카탈로그·테스트 목
- `d664734` typed routes 결합 해제(Route→string, Vercel 빌드 실패 원인 차단)
- `bc78656` shadcn vendored 파일에서 useMemo/useCallback 제거(React Compiler) — **전 프로젝트 훅 위반 0**
- `6de4134` 혼입 제거: entities/폼 문자열 → `auth.errors.*`·`validation.*`·`error.*`·`community.toast.*`·`profile.toast.*` 키 + `translateMessage` 표시 번역, `ja` 카탈로그 한국어 혼입(`대로`→`通りに`) 교정
- 2차 작업 트리: intro/marketing·trips·trip-editor·trip-viewer·rich-editor·trip/user-state toast를 ko/en/ja로 연결, 날짜·요일·기간·국가명 locale 포맷, 생성 locale별 기본 일정 종류, 로그인 사용자 메뉴 언어 전환, 렌더 중 state 갱신 제거.
- API/repository·업로드·리치 텍스트·템플릿 검증은 안정적인 `error.*`/`validation.*` 키만 반환하고, mutation toast·폼 오류 표시 경계에서 현재 locale로 번역한다. 서버의 한국어 원문이 en/ja 사용자 화면으로 누출되던 경로를 제거했다.
- `docs/CONVENTIONS.md`를 강제 규칙 정본으로 추가하고 ESLint가 `useMemo`·`useCallback`·`React.memo`를 오류로 차단한다. RHF `register()`의 `'use no memo'` 예외만 ADR-0018에 따라 유지한다.
- 자동 검증: 세 카탈로그 재귀 키 동등성 및 en/ja 한글 혼입 테스트를 추가했다.

### 6단계 인증 확장 (ADR-0039) — 코드 구현 완료, 운영 설정 대기

- `shared/lib/auth-capabilities.ts`가 OAuth와 이메일 Worker 설정을 모두 확인한다. GitHub·Naver는 ID와 secret이 모두 있을 때만 better-auth에 등록되고 로그인 화면에 노출된다.
- 이메일 Worker가 설정되면 better-auth가 가입·로그인 시 인증 메일을 발송하고 `/verify-email`에서 재발송할 수 있다. 설정이 없을 때는 기존 이메일 로그인 동작을 유지한다.
- `/api/auth/sign-up`이 가입 요청과 현재 약관 버전을 검증하고 `trip_user_consent`에 이용약관·개인정보 처리방침 동의를 기록한다. `/terms`, `/privacy`, `/verify-email`은 ko·en·ja 카탈로그를 사용한다.
- Cloudflare Worker 예시는 `cloudflare/mail-worker/`에 있으며 bearer 인증, 발신 주소 검증, `SEND_EMAIL` 바인딩을 포함한다. 법적 초안은 `docs/legal/`에 있다.

### 운영 후속

1. 운영 환경변수 주입, 마이그레이션 0010→0011→0012 적용, Cloudflare Email Service 실제 발송 및 OAuth 콜백 스모크.
2. Vercel queue/provider, SEO robots/sitemap/JSON-LD, developer API 401/403/404/429와 owner-only 결과 smoke.

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

- ADR-0037: 소프트 삭제·신고 `trip_report`·차단 `trip_user_block`·채택 회수 `revoked`(-10)·닉네임 변경 — 전부 구현·배포됨.
- ADR-0038: next-intl as-needed ko 기본, proxy 합성 순서(i18n 307 통과 → 로케일 제거 pathname 으로 인증 → `next=` 프리픽스 보존), 메시지 키 체계(`validation.`/`error.`/`auth.errors.`/`*.toast.` + `translateMessage`), typed routes 해제, trip 도메인 2차 완료.
- ADR-0039: 설정이 있는 OAuth만 활성화하고, Email Worker가 있을 때만 이메일 인증을 요구하며, 가입 시 현재 법적 문서 버전을 동의 테이블에 기록한다.
- 사용자 결정(2026-09-11): i18n path prefix+proxy 합성 / dayjs 서버측 per-request / zod errorMap+키 / Email Service 수용(trip.gumyo.net) / OAuth 키 없음→비활성+안내.
- ADR-0040: Phase 7 구현은 Vercel Queues `send`/push callback, OpenAI·Anthropic·Ollama Cloud 공식 모델 API, AES-256-GCM 사용자 키, 10분 서버 캐시, 영속 AI 작업·usage, 승인형 `saveDay` diff 적용으로 고정했다. 운영에서는 `APP_ENCRYPTION_KEY`와 Queue 토큰을 주입해야 한다.
- ADR-0041: Phase 9는 `/api/v1` bearer-only owner-scoped API, SHA-256 PAT 저장·1회 반환, scope·rate-limit·idempotency, OpenAPI 3.1, migration 0012로 고정했다.

## 5. 사용자 방향성 & 작업 규칙

- 구현·리팩터링 완료 조건은 `docs/CONVENTIONS.md`를 정본으로 삼는다. typecheck·lint·prettier·전체 테스트·프로덕션 빌드를 통과하고, i18n 변경은 ko/en/ja 카탈로그 정합성과 대표 경로 스모크를 확인한다.
- 자동 커밋·push ON. 커밋은 English lowercase Conventional Commits, AI 트레일러 금지, `git add -A` 금지, force push 금지. dev→prod 머지는 무플래그 `git merge` 후 push(가드 훅 오인 회피).
- `.env*` 는 읽지·쓰지 않는다(사용자가 DATABASE_URL+BETTER_AUTH_* 발급 완료, 실DB 연결 정상).
- 공용 DB: 컬럼 추가 전용은 선행 적용, 컬럼 삭제는 적용 직후 push·배포. `PUBLIC_TRIP_CACHE_VERSION='4'` — `PublicTrip` 형태 변경 시 올림.

## 6. 미해결 질문 / 사용자 확인 필요 항목

- 6단계 OAuth: 어떤 프로바이더를 먼저 붙일지(키 발급은 사용자 작업).
- 다중 인스턴스 운영 전 idempotency/rate-limit 캐시를 공유 저장소로 승격한다.
- trip 도메인 ja·en 제품 문구는 구현·혼입 검사를 마쳤으며, 원어민 수준의 톤 리뷰는 제품 QA에서 선택적으로 수행한다.

## 7. 환경 & 전제

- Bun 1.4.2, Next 16.3.4(dev는 Turbopack, 프로덕션 빌드는 Webpack), next-intl 4.14.4, zod 4.5.4, drizzle mysql(`trip_` prefix), dev 서버 `:7777`.
- task 위임: 카테고리는 `oh-my-opencode.jsonc` 고정으로 복원 전까지 `subagent_type=general` 사용 권장(카테고리 모델 매핑은 재시작 후 jsonc 반영).
- 마이그레이션 상태: 0000~0008 적용(이력 9행), 0010 인증 동의 SQL 생성·미적용. `drizzle-kit push` 금지, `bun run db:generate`/`db:migrate`만.

## 8. 다음 세션 TODO (우선순위 순)

1. 인증 확장 작업 트리를 커밋하고 dev→prod로 머지·push한다.
2. 운영자가 `docs/env.md`의 OAuth·Email Worker 키를 주입하고 0010을 적용한 뒤 콜백·실제 수신 메일을 스모크한다.
3. 운영 migration 0010→0011→0012 및 각 public/API/AI smoke.

## 9. 문서 지도

`docs/CONVENTIONS.md`(React Compiler·i18n·리팩터링 강제 규칙)·`docs/PROCESS.md`(작업 체크리스트)·`docs/ARCHITECTURE.md`(구조)·`docs/roadmap.md`(진행 표)·`docs/acknowledge/`(ADR 0001~0041)·`docs/memory/`(data-model·research 메모)·`docs/history/`(세션 로그)·`docs/DESIGN.md`(비주얼 SSOT)·`docs/env.md`(env 발급).
