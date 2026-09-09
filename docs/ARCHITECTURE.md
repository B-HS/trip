# ARCHITECTURE — trip

> 최종 갱신: 2026-09-09 · 대응 커밋: 로드맵 7 feat(editor) 커밋(세션 3 4단계, 이 문서와 같은 커밋, push·prod 머지됨)
> 구현 정본. 코드와 어긋나면 코드를 고치거나 이 문서를 갱신한다. 결정의 배경·기각 대안은 `docs/acknowledge/README.md`.

## 1. 스택

Next 16.3.4(App Router, React Compiler, `typedRoutes`, `agentRules: false`; **`cacheComponents` 는 끔** — 초기 스켈레톤 금지 결정, ADR-0010) · React 19.2 · Tailwind 4 + shadcn 4(`radix-vega`, 55개 전부 `shared/ui`) · drizzle-orm 0.45(`mysql2`, MySQL 9.6 스키마 `trip`) · better-auth 1.7(이메일·비밀번호 + `username` 플러그인) · TanStack Query 5 · zod 4 · react-hook-form 7 · motion 13 · three 0.186 + @react-three/fiber 9 + drei 10 + world-atlas·topojson-client·d3-geo · @dnd-kit · lucide-react · dayjs · sonner · next-themes · `cn` 0.2(컴파일된 clsx+tailwind-merge 대체 머저 — `shared/lib/utils.ts` 가 재export하고 shadcn 파일 51개는 `'cn'` 을 직접 import) · `@aws-sdk/client-s3`(Cloudflare R2 업로드, ADR-0026) · Tiptap 3.31.3(`@tiptap/core`·`react`·`starter-kit`·`pm`·`extension-youtube`·`extension-link`·`extension-image`·`html`, 전부 같은 버전 고정) + `isomorphic-dompurify` 4.2(서버 sanitize, Node 에서는 jsdom) + `happy-dom`(`@tiptap/html` 서버 렌더 peer 라 dependencies)(ADR-0027). 런타임·패키지 매니저·테스트 러너는 **bun**(락파일은 v1, `packageManager: bun@1.3.14` — ADR-0013). React Compiler 예외: RHF `register()` 를 호출하는 폼 컴포넌트 16개(인증 2·트립 생성 1·편집기 13)는 파일 상단 `'use no memo'` 로 제외한다(ADR-0018).

## 2. 폴더 (변형 FSD, `src/` 없음)

```
app/
  (public)/             로그아웃 표면(layout 이 .surface-public) — /, /login, /signup, /s/[slug]
  (app)/                로그인 표면 — layout 이 requireUser + 즐겨찾기 prefetch + AppShell — /trips, /trips/new, /trips/[tripId], /trips/[tripId]/edit
  api/auth/[...all]/    better-auth 핸들러
  api/trips/            GET 읽기 엔드포인트: /api/trips, /api/trips/favorites, /api/trips/[tripId], /api/trips/[tripId]/members, /api/trips/[tripId]/user-state
  api/uploads/          POST multipart 이미지 업로드(세션 필수, 3MB·MIME·매직 바이트 검증 → R2 put → trip_upload 기록, R2 미설정이면 503 UPLOAD_NOT_CONFIGURED)
  layout.tsx            Theme·Motion·Query·Tooltip 프로바이더, Toaster, Analytics
  template.tsx          PageTransition(fade)
  not-found.tsx         404(panel 지구본)
widgets/  app-shell · auth · intro · trip-editor(basics·sidebar·travel·kinds·days·bookings·info·share 탭) · trip-viewer · trips     (쿼리·mutation·router·권한)
features/ app-shell · auth · intro · trip-editor(폼·sortable·sidebar-form·kinds-form·booking-attachments-field) · trip-viewer · trips · editor(rich-editor·툴바·링크/YouTube URL 다이얼로그·rich-text-content — 게시글 본문용, 로드맵 6 전까지 사용처 없음)     (순수 UI, props+콜백)
entities/
  trip/     trip.type · trip.validate · trip.role(순수) · trip.access(server) · trip.tag · trip.order(순수, 낙관적 재배열) · trip.repository(+.days/.members/.favorites) · trip.cache · trip.action · trip.api · trip.query · trip.prefetch
  user-state/ user-state.type · .repository · .action · .api · .query
  upload/   upload.type · upload.api(multipart POST) · upload.query(useUploadImage)
  auth/     auth.validate · auth.error
shared/
  db/       client.ts(mysql2 풀 싱글턴) · table.ts(`trip_` creator) · schema/{auth,trip}.ts · schema.ts(합성) · accept-invites.ts(가입 시 초대 수락)
  lib/      env.ts(getEnv, R2_* 는 선택) · auth.ts(getAuth) · auth-client.ts · session.ts · api-response.ts · action-result.ts · fetch.ts(clientFetch, FormData 허용) · query-client.ts · query-provider.tsx · motion.ts · trip-template.ts(+parseTripTemplateJson) · trip-length.ts(몇박 며칠) · r2.ts(server-only, getUploadConfig·putObject·deleteObject) · upload-validation.ts(순수 검증) · utils.ts(npm `cn` 재export) · rich-text-extensions.ts(Tiptap 확장 목록·스키마) · rich-text-document.ts(JSON 검증·정규화·평문·빈 문서 판정, zod 스키마) · rich-text-sanitize.ts(DOMPurify 화이트리스트 + 훅, `SanitizedRichTextHtml` 브랜드 타입) · rich-text-html.ts(server-only, `generateHTML` → sanitize)
  hooks/    use-mobile · use-motion-preference · use-unsaved-changes
  constant/ trip.ts(DEFAULT_SCHEDULE_KINDS·색 토큰 등) · rich-text.ts(허용 태그·속성, YouTube 임베드 프리픽스, 크기, JSON 길이 상한) · upload.ts · auth.ts · site.ts · query.ts · query-key.ts · airports.ts · countries.ts · marketing.ts · template/osaka.ts
  ui/       shadcn 55개(+ button `cell`·`cellPrimary`·`cellDestructive` 변형, `cell`·`cellIcon` 크기) + theme-provider · theme-toggle · motion-provider · motion/(7 프리미티브) · three/(지구본)
tests/    bun test 미러 구조(entities · features · shared · widgets) + setup.ts(happy-dom 전역 등록, `server-only` 를 빈 모듈로 mock, 자식 프레임 네비게이션 비활성)
scripts/  migrate.ts · seed.ts
drizzle/  0000(초기 20 테이블) · 0001(destination·favorite) · 0002(nights·days) · 0003(sidebar_link·sidebar_note) · 0004(schedule_kind + 데이터 이관, kind 컬럼 삭제) · 0005(upload·booking_attachment) + meta
docs/     ARCHITECTURE · HANDOFF · PROCESS · roadmap · acknowledge/ · memory/ · history/ · feedback/ · quality-assurance/ · DESIGN.md · osaka-trip-interactive.html
```

- import 는 `@/…` 절대경로, barrel 금지, 의존은 `app → widgets → features → entities → shared` 방향만.
- 서버 전용 모듈(`shared/db/*`, `shared/lib/auth.ts`·`session.ts`·`r2.ts`·`rich-text-html.ts`, `entities/*/*.repository*.ts`, `*.cache.ts`, `*.access.ts`, `*.prefetch.ts`)은 `import 'server-only'`, 액션 파일은 `'use server'`.

## 3. 라우트·렌더링

| 경로                   | 렌더                                                                                                                  | 비고                                                                                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                    | 정적 인트로(Surface B, hero 지구본 ICN→KIX 샘플). 로그인 쿠키가 있으면 `proxy.ts` 가 `/trips` 로 리다이렉트           | 페이지는 세션을 읽지 않아 정적 유지                                                                                                                                                                                 |
| `/login`, `/signup`    | 정적 셸 + 클라이언트 폼(Suspense)                                                                                     | 로그인 상태면 proxy 가 `/trips` 로                                                                                                                                                                                  |
| `/s/[slug]`            | `export const revalidate = 3600` + `getPublicTrip(slug)`(`unstable_cache`, 태그 `trip:share:<slug>`) → 읽기 전용 뷰어 | `isPublic` 트립만. 변경 시 `updateTag` + `revalidatePath`. 캐시 키에 `PUBLIC_TRIP_CACHE_VERSION` 포함 — `PublicTrip` 형태가 바뀌는 배포마다 올린다(Vercel 데이터 캐시는 배포를 넘어 유지되어 옛 형태로 500 이 났음) |
| `/trips`               | 동적. `requireUser` → `prefetchTripList` → `HydrationBoundary` → `TripListWidget`                                     | 완성 HTML(스켈레톤 없음). 지구본 = 항공편 또는 ICN→목적지 체인                                                                                                                                                      |
| `/trips/new`           | `TripCreateWidget`: 빈 트립(제목·목적지·나라 목록·기간) → `/trips/[id]/edit`, 오사카 예시 → `/trips/[id]`             | 나라는 최소 1개                                                                                                                                                                                                     |
| `/trips/[tripId]`      | 동적. `prefetchTripDetail` + `searchParams`(view·day) → `TripViewerWidget` props                                      | 멤버만. URL 동기화는 `history.replaceState`                                                                                                                                                                         |
| `/trips/[tripId]/edit` | 동적. `prefetchTripDetail`(+owner 는 members) → `TripEditorWidget`(탭 `?tab=`)                                        | owner/editor. viewer 는 `/trips/[id]` 로                                                                                                                                                                            |

- `proxy.ts`: `/trips/:path*` 는 세션 쿠키(`trip.session_token`, `better-auth/cookies` `getSessionCookie`) 없으면 `/login?next=…`; `/`·`/login`·`/signup` 은 쿠키 있으면 `/trips`. 실제 인가는 서버에서 재확인.
- `app/(app)/layout.tsx`: `requireUser` + `trip_sidebar_state` 쿠키 → `AppShell`(레일 256px/접힘 48px, Cmd/Ctrl+B, 모바일 Sheet, 즐겨찾기 목록).

## 4. 인증

- `getAuth()`: drizzle adapter(mysql, `trip_user/session/account/verification`), `emailAndPassword`(이메일 인증 없음), `username()`(3~30자, `^[a-z0-9_.]+$`), `advanced.cookiePrefix = 'trip'`, `nextCookies()`, `databaseHooks.user.create.after` → `acceptPendingInvitesForUser`(`shared/db/accept-invites.ts`).
- 서버: `getServerSession()`, `requireUser()`(없으면 `/login`). 클라이언트: `signIn.email`/`signIn.username`(식별자에 `@` 포함 여부로 분기), `signUp.email({ name: username, email, password, username, displayUsername: username })` — 가입 폼은 사용자명·이메일·비밀번호만 받고, better-auth 필수 컬럼 `name` 에는 사용자명을 저장한다(ADR-0017).

## 5. 데이터 계층 (`entities/trip/`)

| 파일                           | 역할                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `trip.type.ts`                 | `$inferSelect` 행 타입(+`TripScheduleKind`·`TripSidebarLink`·`TripBookingAttachment`·`TripUpload`·`SavedDay`) + 뷰 타입: `PublicTrip`(flights·lodgings·destinations·scheduleKinds·sidebarLinks·days{facts,routes,scheduleItems(kindId),notes}·bookings{attachments}·infoSections{blocks}·owner), `TripDetail`(+viewerRole), `TripSummary`(role·counts·flights·destinations·isFavorite·customNights/Days), `TripMembersView`                                                                                                                                              |
| `trip.validate.ts`             | zod v4: `tripBasicsSchema`, `tripBasicsFormSchema`(+destinations), `tripCreateSchema`(destinations ≥1), `flightListSchema`·`lodgingListSchema`·`bookingListSchema`(+attachments)·`infoSectionListSchema`·`destinationListSchema`, `sidebarSchema`, `scheduleKindListSchema`·`scheduleKindsSaveSchema`(kinds + replacements), `dayInputSchema`(항목 `kindId`), `memberInviteSchema`, `shareSettingsSchema`, `dayMemoSchema`. `*Input` = z.input(폼), `*Values` = z.output                                                                                                 |
| `trip.role.ts`                 | 순수: `resolveTripRole`, `canView/canEdit/canManage/canAccess`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `trip.access.ts`               | server: `getTripRole`, `assertTripAccess(tripId, userId, 'view'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 'edit' | 'own')`(비멤버는 NOT_FOUND) |
| `trip.repository.ts`           | `findTripSummariesForUser`, `findTripDetail(ForUser)`, `findPublicTripBySlug`, `createTrip(ownerId, basics, destinations)`, `createTripFromTemplate`, `replaceTripFromTemplate`(JSON 가져오기, ADR-0021), `saveTripBasics`(기본 정보 + 목적지 한 트랜잭션), `saveSidebar`(소개 문구 + 링크 reconcile), `saveScheduleKinds`(reconcile + 삭제 종류 대체 UPDATE), `deleteTrip`, `saveFlights/Lodgings/Bookings(+attachments reconcile, 삭제된 이미지의 R2 객체 best-effort 삭제)/InfoSections`(reconcile), `updateShareSettings`, `exportTripTemplate`, `findTripShareSlug` |
| `trip.repository.days.ts`      | `saveDay`(nested reconcile, 하위 행 id 를 `SavedDay` 로 반환), `deleteDay`, `reorderDays`(2단계 인덱스 재작성)                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `trip.repository.members.ts`   | `findTripMembers/Invites`, `inviteMember`(가입자면 즉시 멤버, 아니면 초대), `updateMemberRole`, `removeMember/Invite`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `trip.repository.favorites.ts` | `findFavoriteTrips`, `setTripFavorite`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `trip.cache.ts`                | `getTripList`·`getTripDetail`·`getFavoriteTrips`(DB 직접) · `getPublicTrip`(`unstable_cache` 1h, 태그 `trip:share:<slug>`)                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `trip.tag.ts`                  | `tripListTag`·`tripTag`·`tripShareTag`(현재 share 태그만 사용)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `trip.action.ts`               | `'use server'`: create/createFromTemplate/saveTripBasics/saveSidebar/saveScheduleKinds/importTrip/saveFlights/saveLodgings/saveDay/deleteDay/reorderDays/saveBookings/saveInfoSections/deleteTrip/inviteMember/updateMemberRole/removeMember/removeInvite/updateShareSettings/exportTrip/toggleFavorite. 흐름: `requireUser` → zod → `assertTripAccess` → repository → 공유 페이지 태그 만료. 반환은 `ApiResponse<T>`(throw 없음, `runAction`)                                                                                                                           |
| `trip.api.ts`                  | `clientFetch` 래퍼: `fetchTripList/fetchFavoriteTrips/fetchTripDetail/fetchTripMembers`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `trip.query.ts`                | `'use client'`: `tripListQueryOptions`·`favoriteTripsQueryOptions`·`tripDetailQueryOptions`·`tripMembersQueryOptions`, `useTripList/useFavoriteTrips/useTripDetail/useTripMembers`, mutation 훅 `useCreateTrip`…`useToggleFavorite`(낙관적)·`useReorderDays`(낙관적 재배열 + 롤백)·`useSaveTripBasics`·`useSaveSidebar`·`useSaveScheduleKinds`·`useImportTrip`. 성공/실패 toast 는 훅이 담당                                                                                                                                                                             |
| `trip.prefetch.ts`             | server: `prefetchTripList/prefetchFavoriteTrips/prefetchTripDetail/prefetchTripMembers`(클라이언트와 같은 `QUERY_KEY`)                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `entities/user-state/*`        | `TripUserState { scheduleCheckedIds, bookingCheckedIds, memos }`, `toggleScheduleCheck/toggleBookingCheck/resetDayChecks/saveDayMemo` 액션 + 낙관적 훅                                                                                                                                                                                                                                                                                                                                                                                                                   |

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
- 셀형 액션(ADR-0023): 앱 전역의 버튼은 `Button variant='cell'|'cellPrimary'|'cellDestructive' size='cell'|'cellIcon'` 로, 부모 `flex gap-px bg-background` 안에서 1px 심으로 구분한다(라운드·보더 없음, `aria-pressed` 는 primary). 행 삭제·드래그 핸들 같은 작은 아이콘은 `ghost icon-xs` 유지. 일정 종류 배지·범례 색은 `trip-viewer-kind.ts` 의 토큰 → 클래스 정적 맵(ADR-0025).
- 모션: 토큰 `shared/lib/motion.ts`(0.18s fade·0.24s bar·standard ease·stagger). 루트 `MotionConfig reducedMotion='never'`; 모션 감소는 앱 내 설정 `use-motion-preference`(사용자 메뉴 토글, localStorage `trip-motion`). 페이지 전환 fade, 뷰·날짜 전환 `AnimatePresence`, 목록 stagger, 체크 완료 opacity/strike, 진행바 트윈, 탭·날짜 인디케이터 `layoutId`. 편집기 정렬 행(`SortableRows`)은 진입 페이드만 쓰고 `AnimatePresence`·exit 는 쓰지 않는다(ADR-0019). 다크 토큰·`dark:` 변형은 `@media screen` 한정이라 인쇄는 항상 라이트 토큰이다.
- 테마: next-themes(class), 전역 단축키 `d`(`shared/ui/theme-provider.tsx`).

## 9. 3D (`shared/ui/three/`)

- `trip-globe.tsx`(`TripGlobeLazy` 로만 로드): props `{ routes: Array<{ from, to }>, variant 'hero'|'panel'|'mini', interactive, autoRotate, className }` — 끝점은 IATA 코드 또는 `{ lat, lng, label }`. 실제 지리(`world-atlas` land-110m 해안선 + 3° 격자 육지 점 + 30° 위경도선), 마커, 대권 곡선 + 이동 점, 마커 중심을 향해 초기 회전, 자동 회전(호버 시 정지), `dpr=[1,1.5]`, 오프스크린 `frameloop='never'`, 모션 감소 설정 시 `'demand'`. 색은 CSS 토큰을 `css-color.ts`(lab/oklch/oklab → hex)로 변환.
- 적용처(정보가 있는 곳만): 인트로 히어로, `/trips` 헤더, 빈 상태, 404. 장식용 미니 지구본 금지(ADR-0008).

## 10. 오사카 템플릿

`shared/constant/template/osaka.ts` `OSAKA_TRIP_TEMPLATE`(`tripTemplateSchema` 로 검증, 7일·65행·16경로·9예매·4정보섹션·목적지 JP 오사카 전수). 사용처: `scripts/seed.ts`(`bun run db:seed`, `SEED_OWNER_EMAIL` 가입자 필요), 목록·새 트립의 "오사카 예시 트립 만들기", 편집기 "JSON 내보내기"(`exportTripAction`)와 "JSON 가져오기"(`importTripAction` → `replaceTripFromTemplate`, 현재 내용 교체, ADR-0021). 몇박 며칠은 `shared/lib/trip-length.ts` 의 `formatTripLength`(커스텀 `customNights`/`customDays` → 자동 계산, ADR-0020). 템플릿 JSON 은 `scheduleKinds`(항목은 `kind` key 참조, ADR-0025)·`sidebarNote`·`sidebarLinks`(ADR-0024)·예매 `attachments`(ADR-0026) 를 포함한다.

## 11. 검증

`bun run typecheck` → `bun run lint` → `bun test` → `bun run build`. UI 는 브라우저에서 라이트·다크 확인 후 완료 보고(`docs/quality-assurance/`).

## 12. 리치 텍스트 (ADR-0027)

- 정본은 Tiptap JSON. 서버 경계에서 `richTextDocumentSchema`(`shared/lib/rich-text-document.ts`)가 길이 상한 → `doc` 형태 → ProseMirror `Node.fromJSON` + `check()` 로 검증하고 정규화된 JSON 을 돌려준다(알 수 없는 노드·마크는 거부, 알 수 없는 attrs 는 버림).
- 확장은 `createRichTextExtensions()` 한 곳: StarterKit(heading 2·3, Link 포함 — `isAllowedUri` 로 http(s) 만, `rel`·`target` 강제; code·horizontalRule·underline 은 끔) + Image(`loading='lazy'`) + Youtube(`nocookie`, 640×360). 편집기와 서버 렌더가 같은 목록을 쓴다.
- 렌더는 서버에서만: `renderRichTextHtml(doc)`(`server-only`) = `@tiptap/html` `generateHTML` → `sanitizeRichTextHtml`. sanitize 는 DOMPurify 화이트리스트(`RICH_TEXT_ALLOWED_TAGS`·`RICH_TEXT_ALLOWED_ATTRIBUTES`, class 불허) + 호출 범위로 한정한 훅(iframe 은 youtube(-nocookie).com/embed 프리픽스만, img·a 는 http(s) 만, a 에 `rel='noopener noreferrer' target='_blank'`). 결과는 `SanitizedRichTextHtml` 브랜드 타입이며 `features/editor/rich-text-content.tsx` 는 이 타입만 받는다.
- 편집기 `features/editor/rich-editor.tsx` 는 순수 UI(`content`·`onChange`·`label`·`isUploadEnabled`·`isUploading`·`onUploadImage`). 툴바 14셀(ADR-0023 셀형), 링크·YouTube 는 `RichEditorUrlDialog`(useState, RHF 아님), 이미지는 위젯이 `useUploadImage('post')` 로 올린 URL 을 넣는다. `immediatelyRender: false`, `useEditorState` 로 툴바만 리렌더. `content` 는 초기값이라 문서를 바꾸려면 부모가 `key` 로 리마운트한다.
- 스타일은 `app/globals.css` `@layer components .rich-text`(토큰 색만, blockquote·pre 는 `bg-muted`, iframe 은 16:9 반응형).
