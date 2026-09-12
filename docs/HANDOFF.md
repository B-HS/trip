# HANDOFF — 2026-09-12 i18n 2차 작업 스냅샷

> 현재 작업 트리는 아직 커밋·배포하지 않았다. i18n 2차와 React Compiler/컨벤션 감사를 완료했고 typecheck·lint·prettier·`bun test` **579 pass / 0 fail**·Webpack 프로덕션 빌드(34 pages)를 통과했다. 빌드 서버 스모크도 `/`·`/en`·`/ja` 200 + `<html lang>`·히어로 번역 확인, `/trips`·`/en/trips`·`/ja/trips`의 locale 보존 로그인 리다이렉트 확인까지 완료했다. 기본 Turbopack 빌드는 최적화 단계 정지가 반복되어 `bun run build`를 `next build --webpack`으로 고정했다.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 + 커뮤니티 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본 + Tiptap + next-intl)으로 재구현해 `trip.gumyo.net`(Vercel Pro, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

5단계 i18n 2차까지 완료했다. 다음 단계는 6단계 인증 확장(OAuth·이메일), 7단계 AI, 8단계 SEO다.

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

### 미착수(순서대로)

1. **6단계 인증 확장**: OAuth(Google 등) — 키 미확보 상태이므로 **비활성+관리자 안내 문구**로 구현, env 주입 시 활성화. 이메일 발송은 Cloudflare Email Service(Beta·Workers Paid 리스크 수용됨, 발송 도메인 `trip.gumyo.net` 확정).
2. **7단계 AI**, **8단계 SEO**(hreflang·metadata 완성 포함).

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

- ADR-0037: 소프트 삭제·신고 `trip_report`·차단 `trip_user_block`·채택 회수 `revoked`(-10)·닉네임 변경 — 전부 구현·배포됨.
- ADR-0038: next-intl as-needed ko 기본, proxy 합성 순서(i18n 307 통과 → 로케일 제거 pathname 으로 인증 → `next=` 프리픽스 보존), 메시지 키 체계(`validation.`/`error.`/`auth.errors.`/`*.toast.` + `translateMessage`), typed routes 해제, trip 도메인 2차 완료.
- 사용자 결정(2026-09-11): i18n path prefix+proxy 합성 / dayjs 서버측 per-request / zod errorMap+키 / Email Service 수용(trip.gumyo.net) / OAuth 키 없음→비활성+안내.

## 5. 사용자 방향성 & 작업 규칙

- 구현·리팩터링 완료 조건은 `docs/CONVENTIONS.md`를 정본으로 삼는다. typecheck·lint·prettier·전체 테스트·프로덕션 빌드를 통과하고, i18n 변경은 ko/en/ja 카탈로그 정합성과 대표 경로 스모크를 확인한다.
- 자동 커밋·push ON. 커밋은 English lowercase Conventional Commits, AI 트레일러 금지, `git add -A` 금지, force push 금지. dev→prod 머지는 무플래그 `git merge` 후 push(가드 훅 오인 회피).
- `.env*` 는 읽지·쓰지 않는다(사용자가 DATABASE_URL+BETTER_AUTH_* 발급 완료, 실DB 연결 정상).
- 공용 DB: 컬럼 추가 전용은 선행 적용, 컬럼 삭제는 적용 직후 push·배포. `PUBLIC_TRIP_CACHE_VERSION='4'` — `PublicTrip` 형태 변경 시 올림.

## 6. 미해결 질문 / 사용자 확인 필요 항목

- 6단계 OAuth: 어떤 프로바이더를 먼저 붙일지(키 발급은 사용자 작업).
- 7단계 AI 기능 범위(로드맵 기준 재확인).
- trip 도메인 ja·en 제품 문구는 구현·혼입 검사를 마쳤으며, 원어민 수준의 톤 리뷰는 제품 QA에서 선택적으로 수행한다.

## 7. 환경 & 전제

- Bun 1.4.2, Next 16.3.4(dev는 Turbopack, 프로덕션 빌드는 Webpack), next-intl 4.14.4, zod 4.5.4, drizzle mysql(`trip_` prefix), dev 서버 `:7777`.
- task 위임: 카테고리는 `oh-my-opencode.jsonc` 고정으로 복원 전까지 `subagent_type=general` 사용 권장(카테고리 모델 매핑은 재시작 후 jsonc 반영).
- 마이그레이션 상태: 0000~0008 적용(이력 9행). `drizzle-kit push` 금지, `bun run db:generate`/`db:migrate`만.

## 8. 다음 세션 TODO (우선순위 순)

1. 현재 i18n 2차 작업 트리 리뷰·커밋 후 dev→prod 배포 스모크(`/en/trips`·`/ja/trips`와 로그인 사용자 메뉴 언어 전환 포함).
2. 6단계 인증 확장(OAuth 비활성+안내, Email Service 발송 `trip.gumyo.net`).
3. 7·8단계.

## 9. 문서 지도

`docs/CONVENTIONS.md`(React Compiler·i18n·리팩터링 강제 규칙)·`docs/PROCESS.md`(작업 체크리스트)·`docs/ARCHITECTURE.md`(구조)·`docs/roadmap.md`(진행 표)·`docs/acknowledge/`(ADR 0001~0038)·`docs/memory/`(data-model·research 메모)·`docs/history/`(세션 로그)·`docs/DESIGN.md`(비주얼 SSOT)·`docs/env.md`(env 발급).
