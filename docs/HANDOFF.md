# HANDOFF — 2026-09-09 세션 스냅샷

> 대응 커밋: `8f345b1`(origin/dev = origin/prod). 이 문서는 새 세션의 단일 진입점이며 매 핸드오프마다 덮어쓴다.
> 복기 신뢰도: 이 세션은 요약 없이 전체 대화를 기준으로 작성했다. 서브에이전트(Opus) 내부 판단은 각 에이전트의 최종 보고서 기준이다.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본)으로 재구현해 `trip.gumyo.net`(Vercel, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

- 최종 목표: 여행 일정·예매·정보를 구조화해 관리·공유하고(로드맵: 커뮤니티·AI·지도·에디터까지), DESIGN.md 의 "배경 계층·보더 없음" 디자인을 사용자의 해석대로 구현.
- 현재 마일스톤: 초기 구축(Phase 1~3) 완료, `prod` 에 머지·push 됨. Vercel 첫 배포는 사용자가 진행(락파일 v1 수정 후 재빌드 예정).
- 직전 작업: Bun 락파일 v1 재생성(ADR-0013) → dev·prod push → 로드맵 추가 기록 → 이 핸드오프 문서 작성.

## 3. 완료 / 진행 중 / 미착수

### 완료 (코드·문서에 반영됨)

- 스캐폴딩·기반: `package.json`(bun 스크립트 `dev/build/lint/typecheck/format/test/db:generate/db:migrate/db:seed`), `next.config.ts`(reactCompiler, typedRoutes, agentRules false, 보안 헤더, cacheComponents 없음), `app/globals.css`(DESIGN §16-1/16-2 토큰, `.surface-public`), `app/layout.tsx`(Theme·Motion·Query·Tooltip·Toaster·Analytics), `app/template.tsx`(페이지 fade), `proxy.ts`(세션 쿠키 게이팅).
- DB: `shared/db/schema/{auth,trip}.ts` 22 테이블(`trip_` 프리픽스), `drizzle/0000_*.sql`·`0001_*.sql` 적용(MySQL 9.6, 스키마 `trip`), `scripts/migrate.ts`(drizzle `logger:false` 우회), `scripts/seed.ts`.
- 인증: `shared/lib/auth.ts`(이메일·비밀번호 + username, cookiePrefix `trip`, 초대 자동 수락 hook), `shared/lib/auth-client.ts`, `shared/lib/session.ts`, `app/api/auth/[...all]/route.ts`, `widgets/auth/*`, `features/auth/*`, `entities/auth/*`.
- 데이터 계층: `entities/trip/*`(type·validate·role·access·tag·repository×4·cache·action·api·query·prefetch), `entities/user-state/*`, `app/api/trips/**`(list·favorites·detail·members·user-state GET).
- 화면: 인트로 `app/(public)/page.tsx` + `widgets/intro`·`features/intro`; 앱 셸 `widgets/app-shell/app-shell.tsx` + `features/app-shell/*`(레일·즐겨찾기·사용자 메뉴·모션 토글); 목록 `app/(app)/trips/page.tsx` + `widgets/trips/*`·`features/trips/*`; 새 트립 `app/(app)/trips/new/page.tsx`; 뷰어 `app/(app)/trips/[tripId]/page.tsx` + `widgets/trip-viewer/trip-viewer-widget.tsx` + `features/trip-viewer/*`(사이드바·뷰 탭·날짜 탭·day-panel·schedule-row·bookings·info·인쇄 트리); 편집기 `app/(app)/trips/[tripId]/edit/page.tsx` + `widgets/trip-editor/*`·`features/trip-editor/*`; 공개 공유 `app/(public)/s/[slug]/page.tsx`; 404 `app/not-found.tsx`.
- 3D·모션: `shared/ui/three/*`(실제 지리 지구본), `shared/ui/motion/*`, `shared/lib/motion.ts`, `shared/hooks/use-motion-preference.ts`.
- 템플릿: `shared/constant/template/osaka.ts`(65행·16경로·9예매·4정보·35참고·목적지 JP), `shared/lib/trip-template.ts`.
- 문서: `docs/ARCHITECTURE.md`, `docs/memory/data-model.md`, `docs/acknowledge/README.md` + ADR-0001~0016, `docs/roadmap.md`(10건), `docs/history/2026-09-09-initial-build.md`, `docs/feedback/2026-09-09-viewer-visual-feedback.md`, `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md`, `docs/PROCESS.md`.
- 검증: `bun run typecheck`·`bun run lint`·`bun test`(182)·`bun run build` 통과(8f345b1 기준). 브라우저 확인: 인트로·회원가입·목록(별표·지구본 회전)·새 트립(나라 콤보박스)·뷰어(체크·뷰 전환·`?view=&day=`·날짜 탭 화살표·달력 점프·라이트/다크)·편집기(탭·목적지 편집기).

### 진행 중

- 없음(코드 변경은 모두 커밋됨). 로컬 dev 서버(`bun run dev`, :3000)가 이 세션에서 백그라운드로 떠 있었을 수 있다 — 새 세션에서는 다시 띄운다.

### 미착수

- `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md` 의 미체크 항목: `/s/[slug]` 실측(공개 토글 후), 인쇄 미리보기, 모바일 Sheet, 편집기 저장·드래그 정렬 실측, 공개 표면(로그인·인트로)의 `bg-muted` 입력 대비.
- 로드맵 `docs/roadmap.md` 1~10 전부(사용자가 순서 지정). 요약: ① 사이드바 링크·설명 커스터마이징 ② 예매 첨부(이미지·링크) ③ OSM 지도·현재 위치 ④ AI 질문답·수정(Ollama Cloud·OpenAI·Claude, 모델 목록·추론 강도 동적 로드, models.dev 금지, 무료 한도 + 자기 키) ⑤ 일정 종류 배지 커스터마이징 ⑥ 커뮤니티(메인=커뮤니티 홈, 공개 트립·좋아요·이번 주/달, 자유·질문게시판·답변 포인트, `/u/[username]`) ⑦ Naver·GitHub OAuth, 회원가입 폼에서 "이름" 제거(사용자명·이메일·비밀번호만), 이메일 인증, 약관, 후기 게시판, Tiptap+shadcn 에디터(YouTube embed) ⑧ 셀형 액션 UI 전면 적용 ⑨ 몇박 몇일 커스텀 표기 ⑩ SEO·GEO·JSON-LD·Vercel Analytics 이벤트·Speed Insights.
- 알려진 개선 후보(에이전트 보고, 코드 미변경): `saveDayAction` 이 하위 행 id 를 반환하지 않아 새 날짜를 연속 저장하면 하위 행이 재생성됨; 편집기 기본 정보 탭 저장 시 기본 정보+목적지 toast 2개; 날짜 정렬은 낙관적 아님; `shared/ui/input-group.tsx`·`alert.tsx`·`card.tsx` 는 아직 보더를 그림; R3F 9.7 의 `THREE.Clock` 경고(업스트림).

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

| ADR  | 결정                                                                                       | 기각된 대안                                      |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 0001 | bun · Next 16 · shadcn 4 · drizzle mysql2 · better-auth · TanStack · motion · R3F · TS 5.9 | Turso, pnpm, GSAP 병용, Google Maps 임베드, TS 7 |
| 0002 | 데이터 전부 구조화(산문도 행)                                                              | Markdown 필드, JSON 문서                         |
| 0003 | 이메일·비밀번호 + 사용자명 로그인, 초대 자동 수락                                          | OAuth(로드맵 7 재도입), 사용자명 `-` 허용        |
| 0004 | 테이블 `trip_`·쿠키 `trip.` 프리픽스                                                       | 프리픽스 없음                                    |
| 0005 | owner/editor/viewer + 공개 링크, 체크·메모는 사용자별                                      | 소유자 전용, 트립 공유 체크, localStorage        |
| 0006 | 지도는 Google Maps 검색 링크만                                                             | 임베드 지도                                      |
| 0007 | 모션 항상 동작(OS reduce-motion 무시), 앱 내 토글                                          | `reducedMotion='user'`, 페이드만                 |
| 0008 | 지구본은 실제 지리, 정보 있는 곳에만                                                       | 와이어프레임, 장식용 미니 지구본                 |
| 0009 | `prod`(배포)/`dev`(작업), 자동 커밋, push·머지는 지시 시                                   | main 직접 커밋                                   |
| 0010 | cacheComponents 끔, 서버 프리페치 완성 HTML, 공유 페이지만 unstable_cache                  | PPR + `use cache`, SWR revalidateTag             |
| 0011 | 배경 계층·1px 심·보더 없음(표 예외)·셀형 버튼·dvh 채움                                     | 12px 인셋, bg-sidebar 재사용, 탭 밑줄            |
| 0012 | shadcn 55개 설치 후 우선 사용                                                              | 손으로 만든 UI                                   |
| 0013 | 락파일 v1 + `bun@1.3.14`                                                                   | Vercel Bun 버전 상향                             |
| 0014 | 오사카 템플릿 상수 + 시드 + 앱 내 버튼                                                     | 시드 전용, 링크 배열 스키마                      |
| 0015 | 날짜 탭: 화살표 셀·스크롤 표시·달력 점프                                                   | 그라데이션                                       |
| 0016 | `trip_destination`(나라·도시) + `trip_favorite` 레일                                       | 도시 지오코딩, 사이드바 추가와 즐겨찾기 분리     |

## 5. 사용자 방향성 & 작업 규칙

- 답변: 한국어 존댓말, 간결, 자축·"완벽" 단언 금지, 검증 안 된 것은 안 됐다고 말한다. 모호하면 1줄 객관식으로 묻되 한 번에 모아서.
- 코드: `~/.claude/convention` + `~/personal-llm` 전부 적용(arrow only, 주석 금지, any/enum 금지, FC<Props>, useCallback/useMemo 금지, FSD 위→아래, barrel 금지, zod v4, RHF+zodResolver, 토큰 색만, 이모지 금지, 매직넘버 상수화). effect 안 setState 금지(lint `react-hooks/set-state-in-effect`) → `useSyncExternalStore`·observer 콜백.
- 디자인(반복 지적): 보더 대신 배경색 계층과 1px 심으로 구역 분리, 표만 보더 허용. 레일/콘텐츠 사이드바/탭/콘텐츠가 서로 다른 톤. 콘텐츠 사이드바는 콘텐츠 영역 전체 높이, 콘텐츠는 min-height dvh. 탭·버튼은 패딩 든 버튼이 아니라 셀(섹션)처럼. 텍스트가 가장자리에 붙지 않게 블록 내부 패딩. 3D 는 정보를 담는 곳에만. 모션은 적극적으로, 항상 동작.
- 성능: 초기 화면에 스켈레톤 금지 — 서버 프리페치로 완성 HTML.
- 도구: shadcn 컴포넌트 우선. 서브에이전트는 Opus, 메인은 지휘·정본. Workflow 사용은 상시 opt-in.
- Git: Conventional Commits, author 사용자 단독, `Co-Authored-By`·Claude 트레일러 금지, `git add -A` 금지, force push 금지. 자동 커밋 ON(dev). push 와 dev→prod fast-forward 머지는 사용자가 지시할 때(이번 세션 말미에는 "커밋·push·prod 머지까지 다 해놔" 로 매번 수행).
- 문서: 결정은 `docs/acknowledge`(ADR), 진행은 `docs/PROCESS.md`, 추후 계획은 `docs/roadmap.md` 에만 적고 구현하지 않는다. README.md 는 지시 전까지 손대지 않는다. personal-llm 갱신은 이번 세션에선 하지 않기로(C).
- `.env`: 사용자 지시로 AI 가 `echo >>` 로 키만 추가(읽기·출력 금지). 키: `DATABASE_URL`(사용자 제공)·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`·`SEED_OWNER_EMAIL`.

## 6. 미해결 질문 / 사용자 확인 필요

- 로드맵 착수 순서(1~10). 착수 전 항목별 ADR 로 스택·정책 합의 필요(예: 첨부 저장소, OSM 타일 정책, 메일 프로바이더, 게시판 본문 포맷).
- Vercel 첫 배포 결과(락파일 수정 후) — 실패 로그가 있으면 공유받기.
- 회원가입 "이름" 제거는 로드맵 7 로 두었지만 우선순위가 높을 수 있음(사용자 표현 강함).

## 7. 환경 & 전제

- Node 22 / Bun 1.4.0 로컬(락파일은 v1, `packageManager bun@1.3.14`), pnpm 미사용. `bun install --frozen-lockfile` 통과.
- 실행: `bun run dev`(:3000) · `bun run build` · `bun run db:generate && bun run db:migrate`(마이그레이션은 사용자의 MySQL 에 직접 적용됨) · `bun run db:seed`(SEED_OWNER_EMAIL 가입 후).
- DB: MySQL 9.6, 스키마 `trip`, 테이블 22개 + `trip___drizzle_migrations`. 로컬 검증 계정 tester@example.com(사용자명 tester), 예시 트립 1개.
- 참조 원본: `docs/DESIGN.md`(flunti-otel 디자인 시스템, 사용자 해석이 우선), `docs/osaka-trip-interactive.html`(데이터 정본). Calendar 레포 클론은 스크래치패드에만 있었음(재클론 필요 시 `https://github.com/B-HS/Calendar`).
- 브라우저 검증은 Claude in Chrome(localhost:3000). Google Maps API 키·메일 서버 없음.

## 8. 다음 세션 TODO (우선순위 순)

1. Vercel 배포 확인: 사용자 배포 로그 확인 → 실패 시 수정(관련: `package.json`, `bun.lock`, `next.config.ts`). 완료 조건: `prod` 배포 성공, `/`·`/login`·`/trips` 응답.
2. QA 잔여 항목 실측(`docs/quality-assurance/2026-09-09-viewer-editor-checklist.md`): 편집기 멤버·공유 탭에서 공개 토글 → `/s/[slug]` 라이트·다크, 인쇄 미리보기(`widgets/trip-viewer/trip-viewer-widget.tsx` 인쇄 트리), 모바일 Sheet(`widgets/app-shell/app-shell.tsx`), 편집기 저장·정렬(`widgets/trip-editor/*`).
3. 사용자에게 로드맵 순서 확인 후 첫 항목 ADR 작성 → 구현. 후보 1순위(사용자 강조): 로드맵 7 의 회원가입 "이름" 제거(`entities/auth/auth.validate.ts`, `features/auth/signup-form.tsx`, `widgets/auth/signup-widget.tsx`, 테스트 `tests/entities/auth/auth.validate.test.ts`).
4. 알려진 개선: `saveDayAction` 하위 id 반환(`entities/trip/trip.repository.days.ts`, `trip.action.ts`), 기본 정보 탭 toast 중복(`widgets/trip-editor/basics-tab.tsx`), 남은 보더(`shared/ui/input-group.tsx`·`alert.tsx`·`card.tsx`).

## 9. 문서 지도

- `docs/HANDOFF.md` — 이 문서(세션 진입점)
- `docs/ARCHITECTURE.md` — 스택·폴더·라우트·인증·데이터 계층·인가·계층/모션·3D·템플릿·검증(정본)
- `docs/memory/data-model.md` — 22 테이블 요약과 원본 HTML 대응
- `docs/acknowledge/README.md` + `ADR-0001~0016` — 결정·이유·기각 대안
- `docs/roadmap.md` — 다음 페이즈 계획 10건(미착수)
- `docs/PROCESS.md` — 체크리스트·진행 메모
- `docs/history/2026-09-09-initial-build.md` — 세션 이력
- `docs/feedback/2026-09-09-viewer-visual-feedback.md` — 사용자 시각 지적과 교정
- `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md` — 브라우저 검증 체크리스트
- `docs/DESIGN.md`, `docs/osaka-trip-interactive.html` — 외부 원본(수정 금지)
