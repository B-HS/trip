# ARCHITECTURE — trip

> 최종 갱신: 2026-09-09 · 대응 커밋: 8f345b1 (dev = prod, 2026-09-09)
> 구현 정본. 코드와 어긋나면 코드를 고치거나 이 문서를 갱신한다. 결정의 배경·기각 대안은 `docs/acknowledge/README.md`.

## 1. 스택

Next 16.3.4(App Router, React Compiler, `typedRoutes`, `agentRules: false`; **`cacheComponents` 는 끔** — 초기 스켈레톤 금지 결정, ADR-0010) · React 19.2 · Tailwind 4 + shadcn 4(`radix-vega`, 55개 전부 `shared/ui`) · drizzle-orm 0.45(`mysql2`, MySQL 9.6 스키마 `trip`) · better-auth 1.7(이메일·비밀번호 + `username` 플러그인) · TanStack Query 5 · zod 4 · react-hook-form 7 · motion 13 · three 0.186 + @react-three/fiber 9 + drei 10 + world-atlas·topojson-client·d3-geo · @dnd-kit · lucide-react · dayjs · sonner · next-themes. 런타임·패키지 매니저·테스트 러너는 **bun**(락파일은 v1, `packageManager: bun@1.3.14` — ADR-0013).

## 2. 폴더 (변형 FSD, `src/` 없음)

```
app/
  (public)/             로그아웃 표면(layout 이 .surface-public) — /, /login, /signup, /s/[slug]
  (app)/                로그인 표면 — layout 이 requireUser + 즐겨찾기 prefetch + AppShell — /trips, /trips/new, /trips/[tripId], /trips/[tripId]/edit
  api/auth/[...all]/    better-auth 핸들러
  api/trips/            GET 읽기 엔드포인트: /api/trips, /api/trips/favorites, /api/trips/[tripId], /api/trips/[tripId]/members, /api/trips/[tripId]/user-state
  layout.tsx            Theme·Motion·Query·Tooltip 프로바이더, Toaster, Analytics
  template.tsx          PageTransition(fade)
  not-found.tsx         404(panel 지구본)
widgets/  app-shell · auth · intro · trip-editor · trip-viewer · trips     (쿼리·mutation·router·권한)
features/ app-shell · auth · intro · trip-editor · trip-viewer · trips     (순수 UI, props+콜백)
entities/
  trip/     trip.type · trip.validate · trip.role(순수) · trip.access(server) · trip.tag · trip.repository(+.days/.members/.favorites) · trip.cache · trip.action · trip.api · trip.query · trip.prefetch
  user-state/ user-state.type · .repository · .action · .api · .query
  auth/     auth.validate · auth.error
shared/
  db/       client.ts(mysql2 풀 싱글턴) · table.ts(`trip_` creator) · schema/{auth,trip}.ts · schema.ts(합성) · accept-invites.ts(가입 시 초대 수락)
  lib/      env.ts(getEnv) · auth.ts(getAuth) · auth-client.ts · session.ts · api-response.ts · action-result.ts · fetch.ts(clientFetch) · query-client.ts · query-provider.tsx · motion.ts · trip-template.ts · utils.ts(cn)
  hooks/    use-mobile · use-motion-preference · use-unsaved-changes
  constant/ trip.ts · auth.ts · site.ts · query.ts · query-key.ts · airports.ts · countries.ts · marketing.ts · template/osaka.ts
  ui/       shadcn 55개 + theme-provider · theme-toggle · motion-provider · motion/(7 프리미티브) · three/(지구본)
tests/    bun test 미러 구조(entities · features · shared · widgets) + setup.ts(happy-dom)
scripts/  migrate.ts · seed.ts
drizzle/  0000(초기 19 테이블) · 0001(destination·favorite) + meta
docs/     ARCHITECTURE · HANDOFF · PROCESS · roadmap · acknowledge/ · memory/ · history/ · feedback/ · quality-assurance/ · DESIGN.md · osaka-trip-interactive.html
```

- import 는 `@/…` 절대경로, barrel 금지, 의존은 `app → widgets → features → entities → shared` 방향만.
- 서버 전용 모듈(`shared/db/*`, `shared/lib/auth.ts`·`session.ts`, `entities/*/*.repository*.ts`, `*.cache.ts`, `*.access.ts`, `*.prefetch.ts`)은 `import 'server-only'`, 액션 파일은 `'use server'`.

## 3. 라우트·렌더링

| 경로                   | 렌더                                                                                                                  | 비고                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `/`                    | 정적 인트로(Surface B, hero 지구본 ICN→KIX 샘플). 로그인 쿠키가 있으면 `proxy.ts` 가 `/trips` 로 리다이렉트           | 페이지는 세션을 읽지 않아 정적 유지                            |
| `/login`, `/signup`    | 정적 셸 + 클라이언트 폼(Suspense)                                                                                     | 로그인 상태면 proxy 가 `/trips` 로                             |
| `/s/[slug]`            | `export const revalidate = 3600` + `getPublicTrip(slug)`(`unstable_cache`, 태그 `trip:share:<slug>`) → 읽기 전용 뷰어 | `isPublic` 트립만. 변경 시 `updateTag` + `revalidatePath`      |
| `/trips`               | 동적. `requireUser` → `prefetchTripList` → `HydrationBoundary` → `TripListWidget`                                     | 완성 HTML(스켈레톤 없음). 지구본 = 항공편 또는 ICN→목적지 체인 |
| `/trips/new`           | `TripCreateWidget`: 빈 트립(제목·목적지·나라 목록·기간) → `/trips/[id]/edit`, 오사카 예시 → `/trips/[id]`             | 나라는 최소 1개                                                |
| `/trips/[tripId]`      | 동적. `prefetchTripDetail` + `searchParams`(view·day) → `TripViewerWidget` props                                      | 멤버만. URL 동기화는 `history.replaceState`                    |
| `/trips/[tripId]/edit` | 동적. `prefetchTripDetail`(+owner 는 members) → `TripEditorWidget`(탭 `?tab=`)                                        | owner/editor. viewer 는 `/trips/[id]` 로                       |

- `proxy.ts`: `/trips/:path*` 는 세션 쿠키(`trip.session_token`, `better-auth/cookies` `getSessionCookie`) 없으면 `/login?next=…`; `/`·`/login`·`/signup` 은 쿠키 있으면 `/trips`. 실제 인가는 서버에서 재확인.
- `app/(app)/layout.tsx`: `requireUser` + `trip_sidebar_state` 쿠키 → `AppShell`(레일 256px/접힘 48px, Cmd/Ctrl+B, 모바일 Sheet, 즐겨찾기 목록).

## 4. 인증

- `getAuth()`: drizzle adapter(mysql, `trip_user/session/account/verification`), `emailAndPassword`(이메일 인증 없음), `username()`(3~30자, `^[a-z0-9_.]+$`), `advanced.cookiePrefix = 'trip'`, `nextCookies()`, `databaseHooks.user.create.after` → `acceptPendingInvitesForUser`(`shared/db/accept-invites.ts`).
- 서버: `getServerSession()`, `requireUser()`(없으면 `/login`). 클라이언트: `signIn.email`/`signIn.username`(식별자에 `@` 포함 여부로 분기), `signUp.email({ name, email, password, username, displayUsername })` — `name` 은 better-auth 필수 컬럼이라 폼에서 받는다(로드맵 7: 제거 예정).

## 5. 데이터 계층 (`entities/trip/`)

| 파일                           | 역할                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trip.type.ts`                 | `$inferSelect` 행 타입 + 뷰 타입: `PublicTrip`(flights·lodgings·destinations·days{facts,routes,scheduleItems,notes}·bookings·infoSections{blocks}·owner), `TripDetail`(+viewerRole), `TripSummary`(role·counts·flights·destinations·isFavorite), `TripMembersView`                                                                                                                                                   |
| `trip.validate.ts`             | zod v4: `tripBasicsSchema`, `tripBasicsFormSchema`(+destinations), `tripCreateSchema`(destinations ≥1), `flightListSchema`·`lodgingListSchema`·`bookingListSchema`·`infoSectionListSchema`·`destinationListSchema`, `dayInputSchema`, `memberInviteSchema`, `shareSettingsSchema`, `dayMemoSchema`. `*Input` = z.input(폼), `*Values` = z.output                                                                     |
| `trip.role.ts`                 | 순수: `resolveTripRole`, `canView/canEdit/canManage/canAccess`                                                                                                                                                                                                                                                                                                                                                       |
| `trip.access.ts`               | server: `getTripRole`, `assertTripAccess(tripId, userId, 'view'                                                                                                                                                                                                                                                                                                                                                      | 'edit' | 'own')`(비멤버는 NOT_FOUND) |
| `trip.repository.ts`           | `findTripSummariesForUser`, `findTripDetail(ForUser)`, `findPublicTripBySlug`, `createTrip(ownerId, basics, destinations)`, `createTripFromTemplate`, `updateTripBasics`, `deleteTrip`, `saveDestinations/Flights/Lodgings/Bookings/InfoSections`(reconcile), `updateShareSettings`, `exportTripTemplate`, `findTripShareSlug`                                                                                       |
| `trip.repository.days.ts`      | `saveDay`(nested reconcile), `deleteDay`, `reorderDays`(2단계 인덱스 재작성)                                                                                                                                                                                                                                                                                                                                         |
| `trip.repository.members.ts`   | `findTripMembers/Invites`, `inviteMember`(가입자면 즉시 멤버, 아니면 초대), `updateMemberRole`, `removeMember/Invite`                                                                                                                                                                                                                                                                                                |
| `trip.repository.favorites.ts` | `findFavoriteTrips`, `setTripFavorite`                                                                                                                                                                                                                                                                                                                                                                               |
| `trip.cache.ts`                | `getTripList`·`getTripDetail`·`getFavoriteTrips`(DB 직접) · `getPublicTrip`(`unstable_cache` 1h, 태그 `trip:share:<slug>`)                                                                                                                                                                                                                                                                                           |
| `trip.tag.ts`                  | `tripListTag`·`tripTag`·`tripShareTag`(현재 share 태그만 사용)                                                                                                                                                                                                                                                                                                                                                       |
| `trip.action.ts`               | `'use server'`: create/createFromTemplate/updateBasics/saveDestinations/saveFlights/saveLodgings/saveDay/deleteDay/reorderDays/saveBookings/saveInfoSections/deleteTrip/inviteMember/updateMemberRole/removeMember/removeInvite/updateShareSettings/exportTrip/toggleFavorite. 흐름: `requireUser` → zod → `assertTripAccess` → repository → 공유 페이지 태그 만료. 반환은 `ApiResponse<T>`(throw 없음, `runAction`) |
| `trip.api.ts`                  | `clientFetch` 래퍼: `fetchTripList/fetchFavoriteTrips/fetchTripDetail/fetchTripMembers`                                                                                                                                                                                                                                                                                                                              |
| `trip.query.ts`                | `'use client'`: `tripListQueryOptions`·`favoriteTripsQueryOptions`·`tripDetailQueryOptions`·`tripMembersQueryOptions`, `useTripList/useFavoriteTrips/useTripDetail/useTripMembers`, mutation 훅 `useCreateTrip`…`useToggleFavorite`(낙관적). 성공/실패 toast 는 훅이 담당                                                                                                                                            |
| `trip.prefetch.ts`             | server: `prefetchTripList/prefetchFavoriteTrips/prefetchTripDetail/prefetchTripMembers`(클라이언트와 같은 `QUERY_KEY`)                                                                                                                                                                                                                                                                                               |
| `entities/user-state/*`        | `TripUserState { scheduleCheckedIds, bookingCheckedIds, memos }`, `toggleScheduleCheck/toggleBookingCheck/resetDayChecks/saveDayMemo` 액션 + 낙관적 훅                                                                                                                                                                                                                                                               |

- `QUERY_KEY`(`shared/constant/query-key.ts`): `TRIP.ALL/LIST/FAVORITES/DETAIL(id)/MEMBERS(id)/SHARE(slug)`, `USER_STATE.ALL/TRIP(id)`.
- 라우트 핸들러: 세션 → `assertTripAccess` → 읽기 → `successResponse`; 에러는 `unstable_rethrow` 후 `errorResponse`.

## 6. 인가 규칙

| 역할             | 조회           | 체크·메모·즐겨찾기 | 편집 | 멤버·공유 관리 | 삭제 |
| ---------------- | -------------- | ------------------ | ---- | -------------- | ---- |
| owner            | O              | O                  | O    | O              | O    |
| editor           | O              | O                  | O    | X              | X    |
| viewer           | O              | O                  | X    | X              | X    |
| 공개 링크 방문자 | `/s/[slug]` 만 | X                  | X    | X              | X    |

## 7. 사용자별 상태

`trip_schedule_check`·`trip_booking_check`(PK item×user)·`trip_day_memo`(PK day×user)·`trip_favorite`(PK user×trip). 낙관적 업데이트 + 롤백. 활성 뷰·날짜는 페이지 `searchParams`(`?view=itinerary|bookings|info&day=1..n`) 로 초기화하고 클라이언트는 `history.replaceState` 로만 갱신. "완료 숨기기"는 로컬 state. 메모는 500ms 디바운스 저장.

## 8. 시각 계층·모션

- 계층(ADR-0011): 레일 `bg-sidebar` → 콘텐츠 사이드바 컬럼 `bg-muted`(콘텐츠 전체 높이) → 탭 스트립 `bg-background`(활성 탭 `bg-card`) → 블록 `bg-card`(1px 심 `gap-px`). 보더는 표만 허용, 라운드·그림자 없음(공개 표면은 `.surface-public` 토큰으로 6px 라운드). 콘텐츠 영역은 dvh 를 채우고 남는 부분은 `bg-card` 채움 블록.
- 모션: 토큰 `shared/lib/motion.ts`(0.18s fade·0.24s bar·standard ease·stagger). 루트 `MotionConfig reducedMotion='never'`; 모션 감소는 앱 내 설정 `use-motion-preference`(사용자 메뉴 토글, localStorage `trip-motion`). 페이지 전환 fade, 뷰·날짜 전환 `AnimatePresence`, 목록 stagger, 체크 완료 opacity/strike, 진행바 트윈, 탭·날짜 인디케이터 `layoutId`.
- 테마: next-themes(class), 전역 단축키 `d`(`shared/ui/theme-provider.tsx`).

## 9. 3D (`shared/ui/three/`)

- `trip-globe.tsx`(`TripGlobeLazy` 로만 로드): props `{ routes: Array<{ from, to }>, variant 'hero'|'panel'|'mini', interactive, autoRotate, className }` — 끝점은 IATA 코드 또는 `{ lat, lng, label }`. 실제 지리(`world-atlas` land-110m 해안선 + 3° 격자 육지 점 + 30° 위경도선), 마커, 대권 곡선 + 이동 점, 마커 중심을 향해 초기 회전, 자동 회전(호버 시 정지), `dpr=[1,1.5]`, 오프스크린 `frameloop='never'`, 모션 감소 설정 시 `'demand'`. 색은 CSS 토큰을 `css-color.ts`(lab/oklch/oklab → hex)로 변환.
- 적용처(정보가 있는 곳만): 인트로 히어로, `/trips` 헤더, 빈 상태, 404. 장식용 미니 지구본 금지(ADR-0008).

## 10. 오사카 템플릿

`shared/constant/template/osaka.ts` `OSAKA_TRIP_TEMPLATE`(`tripTemplateSchema` 로 검증, 7일·65행·16경로·9예매·4정보섹션·목적지 JP 오사카 전수). 사용처: `scripts/seed.ts`(`bun run db:seed`, `SEED_OWNER_EMAIL` 가입자 필요), 목록·새 트립의 "오사카 예시 트립 만들기", 편집기 "JSON 내보내기"(`exportTripAction`, 가져오기는 미구현).

## 11. 검증

`bun run typecheck` → `bun run lint` → `bun test` → `bun run build`. UI 는 브라우저에서 라이트·다크 확인 후 완료 보고(`docs/quality-assurance/`).
