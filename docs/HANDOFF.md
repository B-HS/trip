# HANDOFF — 2026-09-10 세션 3 종료 스냅샷

> 대응 커밋: `8b9fbd5`(4-4e 지구본 확장 ADR-0035 — origin/dev·prod 동기화, prod 배포 `dpl_8P8LFrBSrpJrA7NQQqxW1eNQqvYz` Ready · 마이그레이션 0007 은 적용됨) + 4-4f 공개 게시판 메뉴·섹션 배경 계층·auto-fit 그리드(ADR-0036, **미커밋**). 세션 3 스냅샷을 세션 4(2026-09-10)가 부분 갱신했다 — 4-4c·4-4d·4-4e·4-4f 결과는 `docs/PROCESS.md` 와 `docs/history/2026-09-10-session-4.md` 가 정본. 이 문서는 새 세션의 단일 진입점이며 매 핸드오프마다 덮어쓴다.
> 복기 신뢰도: 세션 3 전체 대화 기준. Workflow 4건(에이전트 21개)의 산출은 최종 보고서 + 메인 재검증(typecheck·lint·prettier·test 433·build·브라우저 실측 1차) 기준.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 + 커뮤니티 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본 + Tiptap)으로 재구현해 `trip.gumyo.net`(Vercel Pro, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

- 최종 목표: 여행 일정·예매·정보를 구조화해 관리·공유하고 커뮤니티·i18n·인증 확장·AI·SEO 까지(ADR-0033 §5 순서).
- 단계(ADR-0033 §5): **4 로드맵 6 기본(완료, 세션 4 push) → 4-5 로드맵 6 확장 → 5 i18n(ko·ja·en) → 6 인증 확장(OAuth·이메일 인증·약관) → 7 AI(ADR-0029) → 8 SEO(ADR-0030)**. 로드맵 3 OSM 은 제거.
- 현재 마일스톤: 4단계 4-4 를 세션 4 에서 마무리 — 4-4c(남은 실측·댓글 UI·push·prod 배포·prod 500 복구) → 4-4d UI 정정(ADR-0034) → 4-4e 지구본 확장(ADR-0035, `8b9fbd5` 까지 push·prod 배포) → **4-4f 공개 게시판 메뉴·섹션 배경 계층·auto-fit 그리드(ADR-0036, 미커밋)**. 다음은 4-5 로드맵 6 확장(ADR-0037 예정).
- 직전 작업: 비로그인 공개 헤더의 "게시판" 을 드롭다운으로(게시판 전체 + `DEFAULT_BOARDS` 3개, `aria-current`), 섹션 배경 계층을 3단(`bg-background` → `bg-muted` 스트립 → `bg-card` 블록)으로 정리, 홈·인트로 최신 글 섹션에 게시판 셀 3개(`features/community/board-cells.tsx`), 공개 트립 그리드를 auto-fit 으로, `docs/env.md` 신설. 코드 변경은 아직 미커밋이다.
- 검증 규칙 변경(사용자 지시, ADR-0036 §6): **검증은 한 번만.** 구현 단계의 typecheck·lint·prettier·`bun test` 로 끝내고 별도의 리뷰·실측·재확인 단계를 두지 않는다. 라이트·다크 전수 실측·리뷰 렌즈는 사용자가 요청할 때만.

## 3. 완료 / 진행 중 / 미착수

### 세션 3 에서 완료(커밋 순, 전부 dev)

- `94c6c55` ADR-0031: `Agent` 도구 금지·Workflow 전용·모델 배분, `git config llm-rules.auto-push true`.
- `196cd44` 로드맵 7(ADR-0027): Tiptap 3.31.3 8종·`isomorphic-dompurify`·`happy-dom`(dependencies) — `shared/constant/rich-text.ts`, `shared/lib/rich-text-{extensions,document,sanitize,html}.ts`, `features/editor/*`, `app/globals.css` `.rich-text`, `tests/setup.ts`(`server-only` mock + 자식 프레임 네비게이션 비활성). **push·prod 배포 완료**(`dpl_4JTMEamevKJ8sMYjnqQXLCCm7w2U` READY, `/`·`/login`·`/s/osaka-qa` 200, `/trips` 307).
- `f8474cc` ADR-0032(커뮤니티 구현 세부).
- `c152820` 로드맵 6 데이터 계층: `shared/db/schema/community.ts`(+auth/trip 컬럼), **마이그레이션 0006 적용(공용 DB, 테이블 32, 게시판 3행)**, `entities/community/*`·`entities/profile/*`·`entities/trip/trip.repository.{explore,likes}.ts`, better-auth `admin` 플러그인(`disabledPaths: ['/update-user']`), `scripts/set-admin.ts`(`bun run admin:set <email>`), `PUBLIC_TRIP_CACHE_VERSION='3'`, API `/api/posts/[postId]/{comments,like}`·`/api/trips/[tripId]/like`.
- `e0aa431` ADR-0033(OSM 제거·인증 확장 착수·커뮤니티 확장 수용·i18n·단계 재편) + `docs/memory/research-2026-09-10-mail-i18n-auth.md`.
- `8640392` 로드맵 6 UI: `app/(shell)/**`(세션 프레임 그룹으로 `(app)`·`(community)` 통합), `widgets/app-shell/app-frame.tsx`, `features/app-shell/{public-frame,nav-active}.tsx`, `widgets/community/*`, `widgets/profile/*`, `widgets/intro/intro-community-sections.tsx`, `widgets/trip-viewer/{public-trip-actions,trip-like-button}.tsx`, `features/community/*`, `features/profile/*`, `shared/lib/{trip-date-range,trip-route-label,like-mutation,route-handler}.ts`, `shared/constant/route.ts`, `proxy.ts`(보호 경로 4패턴, `/login`·`/signup` → `/`), 로그인·가입 후 `/`.
- `129999c` 실측 버그 2건: `RichEditor.onUpdate` 가 `toPlainDocument`(ProseMirror null-prototype `attrs` 가 서버 액션에서 `$T` 로 깨짐) 로 정규화, `RichEditorUrlDialog.handleSubmit` 에 `stopPropagation`(포털 폼 submit 이 글 폼까지 버블링).
- 문서: ARCHITECTURE(§1·2·3·4·6·7·12·13), data-model(32 테이블), roadmap(진행 표·§3 제거·§11 i18n), PROCESS 4단계 체크리스트, history 세션 3, QA 체크리스트 `docs/quality-assurance/2026-09-10-community-editor-checklist.md`, ADR-0018·0027·0031·0032 추기.

### 세션 4 에서 완료

- `7adc2fa` 댓글 액션 셀 행 분리(ADR-0011·0023 규칙), `f0521cd` 문서, `0ce5c30` prod 글 상세 500 복구(sanitize 창을 `dompurify` + `jsdom` 26.1 로 고정 — `docs/bug/2026-09-10-post-detail-500-on-vercel.md`). 여기까지 push·prod 배포 완료.
- 4-4c-3 마무리: §6-1 답 "전부 유지, 나중에 일괄 삭제" · dev 포트 7777 → 남은 실측 완료 → 문서 정정.

- 4-4d UI 정정(ADR-0034) 커밋 완료: `15561b8` 레일 게시판 tree(`features/app-shell/nav-sub-item.tsx` 신규 · `NavItemLink.children` · `isNavParentActive` · `NAV_ITEMS` 가 `DEFAULT_BOARDS` 참조), `687d131` 편집기 행 셀형 정렬 · 트립 카드 배지 → 텍스트 · 모바일 1열 · 실측 지적 4건 반영(`allowedDevOrigins`, 공개 헤더 셀 상시 렌더, 라이트 `--sidebar-border` 대비, 카드 `w-full`), `9f52a9c` 문서. 4-4e 와 함께 push·prod 배포 완료.

### 4-4e 지구본 확장 (ADR-0035, `3074398`·`df710e7`·`8b9fbd5`·`e736701` — push·prod 배포 완료)

- 출발 공항: **마이그레이션 0007 적용됨**(`trip_trip.departure_airport_code varchar(3) NULL`, 추가 전용, 이력 8행) · `AIRPORT_CODES`·`asAirportCode` · 템플릿 JSON 선택 필드(오사카 `'ICN'`) · `TripSummary.departureAirportCode` · `PUBLIC_TRIP_CACHE_VERSION='4'` · 편집기 기본 정보 탭 `features/trip-editor/airport-combobox.tsx`(생성 폼 미노출).
- 지구본: `shared/ui/three/globe-interaction.ts` 신규(`placeGlobeTooltip`·`resolveGlobeArcEmphasis`·`GLOBE_ARC_STYLE`), `globe-math.ts`(route `key`·`label`·`description`·`isHiddenBySphere`), `trip-globe.tsx`(`dragRotate`·`showTooltip`·`selectedKey`·`onRouteSelect`·DOM 툴팁), `trip-globe-scene.tsx`(OrbitControls·`CLICK_DRAG_THRESHOLD`·글로우 튜브 히트 테스트), `shared/hooks/use-pointer.ts`(`useFinePointer`), `shared/lib/search-param.ts`(`replaceSearchParam`, 뷰어와 공용), `widgets/trips/trip-summary.derive.ts`(`collectGlobeRoutes`·`findGlobeRoute`·`filterTripsByRoute`), `trip-list-widget.tsx`(`?route=` 필터·해제 셀).
- 검증 typecheck·lint·`format:check`·`bun test` 506 통과. 브라우저 실측·재확인 완료(QA 체크리스트 "세션 4 지구본·출발 공항"). 워크트리 없음.

### 진행 중 — 4-4f 공개 게시판 메뉴·섹션 배경 계층·auto-fit 그리드 (ADR-0036, 미커밋)

- 공개 헤더: `widgets/app-shell/public-header-actions.tsx` 의 "게시판" 단일 링크 → shadcn `DropdownMenu`(트리거 `Button variant='cell' size='cell'` + `ChevronDownIcon`, 항목 "게시판 전체"(`/boards`) + `DEFAULT_BOARDS` 3개, 활성은 레일과 공유하는 `isNavItemActive` → `aria-current='page'`, 메뉴 톤 `rounded-none`·`shadow-none`·`gap-px bg-background` + 항목 `bg-card`). `/boards` 인덱스는 포털로 유지.
- 섹션 배경 계층: `features/community/section-heading.tsx` 스트립 `bg-card` → `bg-muted`("더 보기" 셀은 `bg-card` 유지), 커뮤니티 홈·게시판 인덱스·탐색·트립 목록 대문도 `bg-muted`, `widgets/profile/profile-page.tsx` 에 탭별 `SectionHeading`(`TAB_SECTION_TITLE`), `widgets/intro/intro-community-sections.tsx` 는 패널(`flex flex-col gap-px bg-border`) + 스트립(`bg-muted p-6`) 구조로 전환.
- 게시판 셀: `features/community/board-cells.tsx` 신규(`DEFAULT_BOARDS` 3셀 + 우측 `bg-card` 채움 셀, `nav aria-label='게시판 바로가기'`) → 커뮤니티 홈 "최신 글"·인트로 "커뮤니티 최신 글" 섹션.
- 그리드: `features/community/public-trip-grid.tsx` 를 `AUTO_FIT_COLUMNS_CLASS`(`repeat(auto-fit,minmax(min(100%,18rem),1fr))`)로 — 카드 1개면 전체 폭.
- 문서: `docs/env.md` 신규(환경변수 키 목록·발급 방법·`.env.example` 블록·빌드 타임 여부). `.env.example` 자체 갱신은 사용자 작업이다.
- 테스트: `tests/features/community/board-cells.test.tsx` 신규, `tests/widgets/{community,intro,profile}/*` 신규(공용 목 `tests/support/community-repository-mock.ts`), section-heading·public-trip-grid·public-header-actions 보강. 검증 typecheck·lint·`format:check`·`bun test` 528 통과. **별도 실측 단계 없음**(ADR-0036 §6).

### 미착수(순서대로)

1. 4-5 로드맵 6 확장(ADR-0033 §3): 마이그레이션 0008(`deleted_at`·신고·차단·원장 `revoked` — 0007 은 출발 공항이 썼다), 채택 변경·취소(+원장 -10), 댓글 수정, 신고 + `/admin/reports` + 밴(`banUser`), 사용자 간 차단, 사용자명 변경(`/settings/profile`, better-auth `/update-user` 는 계속 닫음), 트립 첨부 인가를 "소유자 또는 공개 트립" 으로 축소(ADR-0032 구현 메모), 채택 댓글 삭제 시 원장 회수(KNOWN ISSUE 해소), 프로필 대문 높이 상한(그리드 빈 열은 4-4f auto-fit 으로 해소됨).
2. 5단계 i18n(ADR-0033 §4, 리서치 메모 §next-intl): next-intl 4.14, `as-needed`, `app/[locale]/` 재구성 + 기존 `proxy.ts` 와 미들웨어 합성, 전 문구 카탈로그화.
3. 6단계 인증 확장(ADR-0033 §2, 리서치 메모): Naver(genericOAuth)·GitHub, 이메일 인증(Cloudflare Email Service 베타 + `cloudflare/mail-worker/`), 약관·동의(`docs/legal/`, korean-law-mcp). 키 없으면 비활성 + 안내.
4. 7단계 AI(ADR-0029), 8단계 SEO(ADR-0030).
5. QA 잔여: 모바일 Sheet 포커스 복귀, R2 설정 후 이미지 업로드(예매·에디터·프로필), 편집기 검증 문구 한국어화(사용자 확인 후), 일정 종류 `key` 노출 여부.

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

| ADR       | 결정                                                                                                                                                                                                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0001~0030 | 세션 1·2 결정(스택, 구조화 데이터, 자체 인증, 셀형 UI, 락파일 v1, 템플릿, R2 업로드, Tiptap, 커뮤니티 정책, Queues AI, SEO)                                                                                                                                                                   |
| 0031      | `Agent` 도구 금지, 위임은 Workflow 의 `agent()` 로만(구현 Opus max·리뷰 Opus high·리서치 Sonnet), 로드맵 7 은 화면 미연결로 push, `auto-push true`, 문서 헤더는 코드 커밋에                                                                                                                   |
| 0032      | 세션 프레임 라우팅, 마이그레이션 0006 스키마, 포인트(답변 +2 글당 1회·채택 +10)·카운터 잠금, 렌더 방식(목록 = 서버 컴포넌트), 프로필 이미지 undefined/null/id 의미                                                                                                                            |
| 0033      | OSM 제거(사업자 요건), 인증 확장 착수(Cloudflare 메일), 커뮤니티 범위 밖 기능 전부 수용(무한 스크롤만 미도입), i18n ko·ja·en next-intl, 단계 순서 4→4-5→5→6→7→8                                                                                                                               |
| 0034      | 세션 4 UI 정정: 레일 게시판 tree(+DESIGN §6-4·§10-11 개정), 편집기 행 셀형 정렬, 트립 카드 배지 → 텍스트(트립 카드만), 모바일 1열, 실측 지적 4건 반영                                                                                                                                         |
| 0035      | 트립별 출발 공항(마이그레이션 0007, NULL = ICN fallback, 생성 폼 미노출)과 `/trips` 지구본 상호작용: 정밀 포인터 한정 드래그 회전, hover 툴팁, 선 클릭 `?route=` 필터. `shared/ui/three` 는 표시용 문자열만 받는 도메인 중립 유지                                                             |
| 0036      | 공개 헤더 "게시판" 을 드롭다운으로(게시판 전체 + `DEFAULT_BOARDS` 3개, `aria-current`, `/boards` 인덱스는 포털 유지), 섹션 배경 3단 계층(`bg-background` → `bg-muted` 스트립 → `bg-card` 블록), 홈·인트로 게시판 셀, auto-fit 카드 그리드, `docs/env.md` 가 환경변수 정본, **검증은 한 번만** |

Workflow C 메인 결정 10건(ADR-0032 구현 메모): `(shell)` 그룹 통합, 링크 탭 `aria-current`, `Route<T>` 제네릭·상대 href, `React.cache` 캐시 모듈, `findLatestPostsByBoard`, 작성자 조회수 제외, PostForm 저장 후 `reset`, 공개 표면 `bg-border` 심, Select 팝오버 유지, 글 수정은 작성자만.

기각·보류: 워크트리 병렬 UI 구현(공용 컴포넌트 계약 충돌, ADR-0031 운용 메모) · headless Chrome 비로그인 촬영(멈춤) · 브라우저 자동화 `type`/`Return` 직접 입력(선택 탭·툴바로 새어 JS 입력으로 대체) · 트립 첨부 인가 즉시 축소(4-5 로) · 본문 img 호스트 화이트리스트(정상 기능이라 보류).

## 5. 사용자 방향성 & 작업 규칙

- 답변: 한국어 존댓말, 간결, 자축·"완벽" 단언 금지, 검증 안 된 것은 안 됐다고. 모호하면 한 번에 모아 객관식(추천안 먼저). 사용자는 대체로 "추천대로", 순서는 메인에 위임. **"멈춰" 지시가 오면 진행 중인 단위만 마무리하고 push 등 다음 단계로 넘어가지 않는다.**
- 에이전트: **`Agent` 도구(서브에이전트) 절대 금지. 모든 위임은 `Workflow` 의 `agent()`**. 구현 Opus `max`, 리뷰 Opus `high`, 리서치·사실 확인 Sonnet. **세션 4 지시: 메인(Fable)은 사용자 대화와 Workflow 지시·취합 등 orchestration 만 하고, 구현·리뷰·검증·브라우저 실측·문서 편집·커밋·push·마이그레이션 적용·배포 확인은 전부 Workflow 에이전트가 한다**(ADR-0031 운용 메모). 워크플로 대기는 `until` 루프(10분 단위). 리서치는 주제당 질문 3개·10분. **검증은 한 번만**(ADR-0036 §6): 구현 에이전트가 typecheck·lint·prettier·`bun test` 를 끝내면 리뷰·실측·재확인 단계를 따로 두지 않고 문서 → 배포로 간다. 라이트·다크 전수 실측·리뷰 렌즈는 사용자가 요청할 때만.
- 코드: `~/.claude/convention` + `~/personal-llm` 전부(arrow only, 주석 금지, any/enum 금지, FC<Props>, useCallback/useMemo 금지, FSD 위→아래, barrel 금지, zod v4, RHF+zodResolver, 토큰 색만, 이모지 금지, 매직넘버 상수화, effect 안 setState 금지). 예외: RHF `register()` 파일 `'use no memo'`(18개, ADR-0018), `Route<T>` 제네릭 컴포넌트 5개(SectionHeading·SearchForm·PostForm·NavRail·NavSubItem — FC 대신 제네릭 화살표).
- 디자인: 보더 대신 배경 계층·1px 심(표만 보더), 셀형 Button 전면(ADR-0023), 링크 탭 `aria-current`·토글 버튼 `aria-pressed`, 콘텐츠 사이드바 전체 높이, dvh 채움, 3D 는 정보 있는 곳만, 모션 항상, 인쇄 라이트 토큰. 초기 화면 스켈레톤 금지(서버 프리페치·서버 컴포넌트 완성 HTML). shadcn 우선. 카드 메타는 배지가 아니라 텍스트(트립 카드 한정), 편집기 정렬 행은 셀형(내용 셀 + 풀하이트 삭제 셀), 레일 게시판은 tree 하위 메뉴(ADR-0034). 섹션은 배경 3단(페이지 `bg-background` → 헤더 스트립 `bg-muted` → 블록 `bg-card`), 공개 헤더 게시판은 드롭다운, 카드 그리드는 auto-fit(ADR-0036).
- Git: Conventional Commits(영어 소문자), author 사용자 단독, 트레일러 금지, `git add -A` 금지, force push 금지. 자동 커밋·자동 push ON(단계 완료마다 push + dev→prod ff 머지, `git merge dev` 로 — `--ff-only`·"fast-forward"·`-f` 문자열은 가드 훅이 force 로 오인). 워크트리 제거는 push 와 다른 명령으로.
- DB: 로컬 = prod 공용 MySQL. 컬럼 삭제 마이그레이션은 적용 직후 push·배포. 추가 전용은 먼저 적용해도 됨(0006·0007 이 그렇게 적용됨). `PublicTrip` 형태 변경 시 `PUBLIC_TRIP_CACHE_VERSION` 증가(현재 `'4'`).
- 문서: 결정은 ADR(다음 번호 **0037**), 진행은 `docs/PROCESS.md`, 버그는 `docs/bug`, QA 는 `docs/quality-assurance`, 계획은 `docs/roadmap.md`. README.md 는 지시 전까지 손대지 않는다. personal-llm 은 갱신하지 않는다. `.env*` 는 읽기·쓰기 불가(값은 문서에 기록하지 않음, 필요 키는 사용자에게 `! <명령>` 로 안내).
- 브라우저 실측(Claude in Chrome): 탭 줌 54% 라 `zoom` 액션으로 확인. CDP `type`·`key` 는 **선택된 탭**으로 가고 툴바 버튼에 Enter 가 눌려 폼이 제출되므로, 입력은 페이지 내 스크립트(native setter + `input`, 합성 `keydown` Enter, `.click()`)로. 다이얼로그·에디터 준비를 폴링으로 기다린다(dev 컴파일 2초+). 라이트·다크 모두 확인(테마는 `window` `keydown 'd'` 합성 이벤트 또는 `localStorage.theme`). headless Chrome 촬영은 멈추므로 비로그인 표면은 `curl` HTML 로 대체했다.

## 6. 미해결 질문 / 사용자 확인 필요 항목

1. **QA 데이터 정리**(세션 4 답: **전부 유지, 나중에 한 번에 삭제** — 질문 글 `ce90f6b2`·채택 댓글·원장 +2/+10 도 포함): 공용 DB 에 자유게시판 글 `050aa2f0-b09e-4daf-a3ff-38944c5eb10c`("세션 3 QA 글 - 수정됨", 댓글 1·좋아요 1, 오사카 트립 연결), 오사카 트립(`905b4695-…`) 좋아요 1(tester), tester 소개 문구가 남아 있다. A(추천): 글·댓글은 삭제 흐름 실측을 겸해 UI 로 삭제, 좋아요·소개는 유지 / B: 전부 유지 / C: 전부 삭제.
2. 트립 첨부 인가 축소(소유자 또는 공개 트립) — 메인 결정, 4-5 에서 적용 예정. 이견 시 알려 달라.
3. 채택 댓글 삭제 시 재채택 가능(KNOWN ISSUE) — 4-5 원장 회수와 함께 해소.
4. 프로필 대문 `aspect-3/1` 높이 상한 — 4-5 에서 처리 예정(디자인 이견 시). 공개 트립 그리드 빈 열은 4-4f 의 auto-fit 으로 해소했다(ADR-0036 §4).
5. (세션 4 해결) sanitize 창은 `dompurify` + `jsdom` 26.1 정확 고정(Vercel 함수가 require(esm) 을 거부). happy-dom 창은 under-sanitize 로 기각 — `docs/bug/2026-09-10-post-detail-500-on-vercel.md`.
6. Cloudflare Email Service 가 **Beta·Workers Paid 플랜** 필요(리서치 메모). 프로덕션 트랜잭션 메일에 쓰는 리스크 수용 여부, 발신 도메인(Cloudflare DNS 필수).
7. 사용자 작업: 환경변수는 **`docs/env.md`** 가 정본이다 — 키 목록·발급 방법·`.env.example` 에 붙여 넣을 블록·빌드 타임 여부가 전부 거기 있다. 지금 채울 것은 R2 5개(**`R2_PUBLIC_BASE_URL` 은 빌드 타임에도 필요** — `next/image` `remotePatterns`)와 `APP_ENCRYPTION_KEY`, 그리고 `.env.example` 갱신·R2 커스텀 도메인 연결(§2·§3). 6단계 OAuth(GitHub·Naver)·이메일 인증 키는 착수 시 이름을 확정해 같은 문서 §4 에 추가한다. 그 외: Vercel CLI 최신화 + `vercel link`, korean-law-mcp 설치·키(6단계 약관 작성용).
8. 편집기 검증 문구 한국어화·일정 종류 `key` 노출(기존 보류 유지).

## 7. 환경 & 전제

- Node 22 / Bun 1.4.0 로컬(락파일 v1, `packageManager bun@1.3.14`, 의존성 추가는 `npx bun@1.3.14 install`). Vercel Pro(team `team_ZNm5hw73FNPctUWAuifjdn2b`, project `prj_a0su9UvuXawlx9OEASFDvbGcDeMe`), CLI 56.5.0(구버전), `.vercel` 미링크.
- 실행: `bun run dev -p 7777`(**:7777**, 세션 4 결정 — :3000 은 gumba 가 쓴다. `.env` 의 `BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL` 도 7777 로 맞춰야 한다) · `bun run build` · `bun run db:generate` · `bun run db:migrate` · `bun run admin:set <email>` · 검증 `bun run typecheck && bun run lint && bun run format:check && bun test`(528) `&& bun run build`.
- DB: 공용 MySQL 9.6 스키마 `trip`, 마이그레이션 0000~0007 적용(이력 8행), 테이블 32. 계정: tester@example.com(사용자명 tester, `role user`, 오사카 예시 트립 공개 slug `osaka-qa`, 소개 문구 있음), hyunseok(사용자 본인), qa_session2_204103@example.com(throwaway, 비밀번호 미기록). 관리자 계정 없음.
- 브라우저: Chrome 의 localhost 는 tester 로 로그인된 상태(세션 쿠키, 포트 무관). 비로그인 표면은 `http://[::1]:7777` 로(쿠키 분리, 확장 권한 허용 — `next.config.ts` 의 `allowedDevOrigins` 가 있어야 `/_next/*` 가 403 이 아니다, ADR-0034). localhost 탭 줌 54%. 백그라운드 탭에서는 motion fade 가 늦게 끝나 캡처 전 인라인 opacity 를 1 로 덮는 스타일을 주입한다.
- 참조 원본: `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`. 리서치: `docs/memory/research-2026-09-09-r2-ai-tiptap.md`, `docs/memory/research-2026-09-10-mail-i18n-auth.md`.

## 8. 다음 세션 TODO (우선순위 순)

1. 4-4f 미커밋 변경(ADR-0036: 공개 헤더 드롭다운·섹션 배경 계층·게시판 셀·auto-fit 그리드·`docs/env.md`) 커밋 → push·prod 머지·배포 확인. 스키마 변경은 없다(마이그레이션 0007 까지 적용된 상태 그대로).
2. 4-5 로드맵 6 확장(ADR-0037 예정, ADR-0033 §3 + ADR-0032 구현 메모의 대기 항목): 세부(신고 사유 목록, 차단 범위, `/admin/reports` 화면, 원장 `revoked`) 확정 → Workflow(데이터 → UI → 리뷰) → 마이그레이션 **0008** → 실측 → push.
3. 5단계 i18n → 6단계 인증 확장 → 7 AI → 8 SEO.
4. R2·암호화 키가 들어오면 업로드·AI 키 등록 실측.

## 9. 문서 지도

- `docs/HANDOFF.md` — 이 문서
- `docs/ARCHITECTURE.md` — 구현 정본(스택·폴더·라우트·인증·데이터 계층·인가·계층/모션·3D·템플릿·검증·리치 텍스트·커뮤니티)
- `docs/memory/data-model.md` — 테이블 32개 요약 · `docs/memory/research-2026-09-09-r2-ai-tiptap.md`(R2·AI SDK·Tiptap·Queues) · `docs/memory/research-2026-09-10-mail-i18n-auth.md`(Cloudflare 메일·next-intl·better-auth 인증 확장·korean-law-mcp)
- `docs/acknowledge/README.md` + ADR-0001~0036
- `docs/env.md` — 환경변수 키 목록·발급 방법·`.env.example` 블록(값은 적지 않는다)
- `docs/roadmap.md` — 항목별 명세 + 진행 상태 표(§3 OSM 제거, §11 i18n, §12 출발 공항·지구본 상호작용)
- `docs/PROCESS.md` — 단계 체크리스트·진행 메모(에이전트 운용·워크트리 이식 절차)
- `docs/history/2026-09-09-initial-build.md` · `docs/history/2026-09-09-session-2.md` · `docs/history/2026-09-09-session-3.md` · `docs/history/2026-09-10-session-4.md`(세션 4 = 4-4c·4-4d·4-4e)
- `docs/bug/2026-09-09-editor-forms-and-print.md` · `docs/feedback/2026-09-09-viewer-visual-feedback.md` · `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md` · `docs/quality-assurance/2026-09-10-community-editor-checklist.md`(중단 지점의 남은 실측 목록)
- `docs/DESIGN.md`, `docs/osaka-trip-interactive.html` — 외부 원본(수정 금지)
