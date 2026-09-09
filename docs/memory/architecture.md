# 아키텍처 — trip

> 구현 정본. 모든 구현(메인·서브에이전트)은 이 문서와 `docs/acknowledge/2026-09-09-stack-and-scope.md` 를 전제로 한다. 코드와 어긋나면 코드를 고치거나 이 문서를 갱신한다.

## 1. 스택

Next 16.3(App Router, React Compiler, `cacheComponents`, `typedRoutes`) · React 19.2 · Tailwind 4 + shadcn 4(`radix-vega`, 컴포넌트는 `shared/ui`) · drizzle-orm 0.45(mysql2) · better-auth 1.7(이메일·비밀번호 + username 플러그인) · TanStack Query 5 · zod 4 · react-hook-form 7 · motion 13 · three + @react-three/fiber 9 + drei 10 · @dnd-kit · lucide-react · dayjs · sonner · next-themes. 런타임·패키지 매니저·테스트 러너는 **bun**.

## 2. 폴더 (변형 FSD, `src/` 없음)

```
app/                    라우트 진입점(default export 페이지·레이아웃만)
  (public)/             로그아웃 표면 — /, /login, /signup, /s/[slug]   (layout 에 .surface-public)
  (app)/                로그인 표면 — /trips, /trips/new, /trips/[id], /trips/[id]/edit
  api/auth/[...all]/    better-auth 핸들러
  api/trips/...         클라이언트 TanStack Query 용 읽기 엔드포인트(GET)
widgets/<domain>/       비즈니스 로직 조립(useQuery·mutation·권한·router)
features/<domain>/      순수 UI(props + 콜백만). 1파일 1컴포넌트
entities/<domain>/      데이터 계층 — 아래 §5
shared/                 ui(shadcn)·lib·hooks·constant·db
  db/                   client.ts(풀 싱글턴) · table.ts(`trip_` creator) · schema/{auth,trip}.ts · schema.ts(합성 객체)
  lib/                  env.ts(getEnv) · auth.ts(getAuth) · auth-client.ts · session.ts · query-client.ts · query-provider.tsx · utils.ts(cn) · motion.ts
  constant/             trip.ts(enum 상수·라벨) · auth.ts · site.ts · query.ts · airports.ts · template/osaka.ts
  ui/                   shadcn 컴포넌트 + theme-provider · three/(R3F 캔버스) · motion/(모션 프리미티브)
tests/                  bun test 미러 구조(entities/features/shared)
scripts/                migrate.ts · seed.ts
drizzle/                마이그레이션 산출물(커밋)
```

- import 는 `@/…` 절대경로. barrel(index.ts) 금지. 의존은 `app → widgets → features → entities → shared` 방향만.
- 서버 전용 모듈(`shared/db/*`, `shared/lib/auth.ts`, `entities/*/*.repository.ts`, `*.action.ts`)은 최상단 `import 'server-only'`(action 은 `'use server'`).

## 3. 라우트·렌더링

| 경로                | 렌더                                                                          | 비고                                |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| `/`                 | 로그아웃: 정적 인트로(Surface B, 3D 히어로) / 로그인: `redirect('/trips')`    | 세션은 서버에서 확인                |
| `/login`, `/signup` | 정적 셸 + 클라이언트 폼                                                       | 로그인 상태면 `/trips` 로           |
| `/s/[slug]`         | ISR(`cacheLife` + `cacheTag('trip:share:<slug>')`), 체크·메모 없음(읽기 전용) | `isPublic` 인 트립만                |
| `/trips`            | 동적. 서버 프리페치 → `HydrationBoundary` → 위젯 `useQuery`                   | 목록 헤더에 3D 지구본(전 트립 경로) |
| `/trips/new`        | 동적. 생성 폼(기본 정보 + "오사카 예시로 채우기")                             | 생성 후 `/trips/[id]/edit`          |
| `/trips/[id]`       | 동적. 뷰어(원본 HTML 재현) + 사용자별 체크·메모                               | 멤버(owner/editor/viewer)만         |
| `/trips/[id]/edit`  | 동적. 탭형 구조화 편집기                                                      | owner/editor 만                     |

- `proxy.ts`(Next 16 미들웨어)가 `/trips/:path*` 를 세션 쿠키(`trip.session_token`) 존재로 1차 게이팅 → 없으면 `/login?next=…`. 실제 인가는 서버(action·route·page)에서 재확인.
- 인증 페이지는 `await connection()` 없이도 `headers()` 사용으로 동적.

## 4. 인증

- `getAuth()`(`shared/lib/auth.ts`): drizzle adapter(mysql, `trip_` 테이블), `emailAndPassword` + `username()` 플러그인, `advanced.cookiePrefix = 'trip'`, `nextCookies()`.
- 서버 세션: `shared/lib/session.ts` — `getServerSession()` = `getAuth().api.getSession({ headers: await headers() })`, `requireUser()` = 세션 없으면 `redirect('/login')`.
- 클라이언트: `shared/lib/auth-client.ts` — `signIn.email` / `signIn.username` / `signUp.email({ email, password, name, username })` / `signOut` / `useSession`.
- 회원가입 hook(`databaseHooks.user.create.after`)에서 `trip_invite` 의 이메일 일치 건을 `trip_member` 로 수락 처리.

## 5. 데이터 계층 (`entities/trip/`)

| 파일                 | 역할                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trip.type.ts`       | 스키마 `$inferSelect` 기반 타입 + 관계 포함 뷰 타입(`TripDetail`, `TripSummary`)                                                                                  |
| `trip.validate.ts`   | zod 입력 스키마(생성·수정·각 하위 엔티티·템플릿 JSON). `z.infer` 로 입력 타입 유도                                                                                |
| `trip.repository.ts` | drizzle 쿼리(server-only). 읽기: `findTripDetail(tripId)`, `findTripSummaries(userId)`, `findPublicTrip(slug)`, 사용자 상태 읽기. 쓰기: 트랜잭션 단위 도메인 동작 |
| `trip.access.ts`     | `getTripRole(tripId, userId)` / `assertTripAccess(tripId, userId, 'view' \| 'edit' \| 'own')`                                                                     |
| `trip.cache.ts`      | `'use cache'` 래퍼 + `cacheTag`: `trip:list:<userId>`, `trip:<tripId>`, `trip:share:<slug>`                                                                       |
| `trip.action.ts`     | `'use server'` 변경 액션(입력 zod 재검증 → 세션·인가 → repository → `updateTag`/`revalidateTag`)                                                                  |
| `trip.api.ts`        | 클라이언트 `clientFetch` 래퍼(`/api/trips/...`)                                                                                                                   |
| `trip.query.ts`      | `'use client'` — `QUERY_KEY` + `queryOptions` 팩토리 + `useQuery`/`useMutation` 훅. mutation 은 server action 호출, `onSuccess` 무효화·toast                      |
| `user-state.*`       | 사용자별 체크·메모: `entities/user-state/` 동일 구조                                                                                                              |

- 쿼리 키: `shared/constant/query-key.ts` 의 `QUERY_KEY` 중앙관리(`TRIP.LIST`, `TRIP.DETAIL(id)`, `TRIP.SHARE(slug)`, `USER_STATE.TRIP(id)`).
- 서버 컴포넌트 프리페치: `getQueryClient()` → `prefetchQuery(tripDetailQueryOptions(id))`(queryFn 은 서버에서 repository 직접 호출하는 서버용 옵션) → `HydrationBoundary`. 클라이언트 훅은 `/api/trips/...` 를 호출.
- 라우트 핸들러(`app/api/trips/*`)는 세션 확인 → `assertTripAccess` → cache 래퍼 호출 → JSON. 응답 봉투 `{ success, data }` / `{ success: false, error: { code, message } }`.

## 6. 인가 규칙

| 역할             | 조회           | 체크·메모 | 편집 | 멤버·공유 관리 | 삭제 |
| ---------------- | -------------- | --------- | ---- | -------------- | ---- |
| owner            | O              | O         | O    | O              | O    |
| editor           | O              | O         | O    | X              | X    |
| viewer           | O              | O         | X    | X              | X    |
| 공개 링크 방문자 | `/s/[slug]` 만 | X         | X    | X              | X    |

## 7. 사용자별 상태

`trip_schedule_check`, `trip_booking_check`(PK: item × user), `trip_day_memo`(PK: day × user). 낙관적 업데이트(`useMutation` `onMutate`) + 실패 시 롤백. 활성 날짜·뷰는 URL `?view=itinerary&day=1`. "완료 숨기기"는 로컬 state.

## 8. 모션 (`motion`)

- 토큰: `shared/lib/motion.ts` — `MOTION_EASE_STANDARD = [0.4, 0, 0.2, 1]`, `MOTION_FADE_DURATION = 0.18`, `MOTION_BAR_DURATION = 0.24`, 공개 표면용 `MOTION_HERO_DURATION = 0.6`, `MOTION_STAGGER = 0.06`.
- 루트에 `MotionConfig reducedMotion='user'`. 페이지 전환 fade, 뷰 전환 `AnimatePresence mode='wait'`, 목록 `layout` + stagger, 체크 완료 시 행 opacity·strike 전환, 진행바 width 트윈, 아코디언 height, 다이얼로그는 shadcn 기본(tw-animate-css).
- 공개 표면은 자유(스크롤 연동 `useScroll`, 패럴랙스, 텍스트 등장). 앱 표면은 위 토큰 기반으로 절제.

## 9. 3D (`shared/ui/three/`)

- `trip-globe.tsx`: R3F 캔버스. 와이어프레임 지구본(모노크롬, 테마 색 = `--foreground`/`--muted-foreground` 를 `getComputedStyle` 로 읽음), 공항 좌표 마커, 경로 아크(`shared/constant/airports.ts` IATA → 위경도). 자동 회전 + 포인터 시차, `dpr={[1, 1.5]}`, `frameloop='demand'`+오프스크린 정지(IntersectionObserver), `prefers-reduced-motion` 시 정지.
- `next/dynamic(..., { ssr: false })` 로만 로드. 스켈레톤 자리표시자 필수.
- 적용처: 인트로 히어로(샘플 ICN→KIX), 로그인·회원가입 배경, `/trips` 헤더(전 트립 경로), 뷰어 사이드바 미니 지구본(해당 트립), 빈 상태, `/s/[slug]` 헤더, `not-found`.

## 10. 오사카 템플릿

`shared/constant/template/osaka.ts` — `TripTemplate`(zod `tripTemplateSchema` 로 검증되는 순수 데이터). 원본 HTML 을 **전수** 이식(7일·65행·16경로·9예매·4정보섹션). 사용처: `scripts/seed.ts`(`SEED_OWNER_EMAIL` 사용자에게 생성), `/trips/new` 의 "오사카 예시로 채우기", JSON 내보내기/가져오기(같은 스키마).

## 11. 검증

`bun run typecheck` → `bun run lint` → `bun test` → `bun run build`. UI 는 브라우저에서 라이트·다크 실제 확인 후 완료로 보고.
