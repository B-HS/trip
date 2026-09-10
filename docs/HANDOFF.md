# HANDOFF — 2026-09-10 세션 3 종료 스냅샷

> 대응 커밋: `129999c`(로컬 dev). **origin/dev·origin/prod 는 `196cd44`(로드맵 7) 에 멈춰 있고, 그 뒤 로컬 커밋 5개(`f8474cc`·`c152820`·`e0aa431`·`8640392`·`129999c`)는 미push** — 사용자가 "지금 하는 것까지만 하고 멈춰" 로 중단시켰기 때문. 이 문서는 새 세션의 단일 진입점이며 매 핸드오프마다 덮어쓴다.
> 복기 신뢰도: 세션 3 전체 대화 기준. Workflow 4건(에이전트 21개)의 산출은 최종 보고서 + 메인 재검증(typecheck·lint·prettier·test 433·build·브라우저 실측 1차) 기준.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 + 커뮤니티 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본 + Tiptap)으로 재구현해 `trip.gumyo.net`(Vercel Pro, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

- 최종 목표: 여행 일정·예매·정보를 구조화해 관리·공유하고 커뮤니티·i18n·인증 확장·AI·SEO 까지(ADR-0033 §5 순서).
- 단계(ADR-0033 §5): **4 로드맵 6 기본(완료, 미push) → 4-5 로드맵 6 확장 → 5 i18n(ko·ja·en) → 6 인증 확장(OAuth·이메일 인증·약관) → 7 AI(ADR-0029) → 8 SEO(ADR-0030)**. 로드맵 3 OSM 은 제거.
- 현재 마일스톤: 4단계 4-4c-3 에서 중단. 커뮤니티·프로필 기본 구현·리뷰·수정·브라우저 실측 1차까지 끝났고 **남은 실측 → QA 데이터 정리 결정 → push·prod ff 머지** 가 다음이다.
- 직전 작업: 브라우저 실측 중 버그 2건 수정(`129999c`) 후 사용자 지시로 정지, `/prepare-new` 로 이 문서 작성.

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

### 진행 중 — 4-4c-3 (사용자 지시로 중단)

- **다음 한 줄**: 사용자에게 QA 데이터 정리 여부를 1줄 객관식으로 확인(아래 §6-1) → 남은 실측(비로그인 표면 시각, 질문 게시판 채택, 글 삭제, 라이트 모드 재확인) → `git push origin dev` → `git checkout prod && git merge dev && git push origin prod && git checkout dev` → `mcp__plugin_vercel_vercel__get_deployment` 로 READY 확인 → `trip.gumyo.net` 스모크.
- 워킹트리 clean. 워크트리 없음. Chrome 에 이 세션 탭 1개(`/boards/free/new`, 미저장 폼) 가 남아 있어 닫으면 이탈 확인이 뜰 수 있다.

### 미착수(순서대로)

1. 4-5 로드맵 6 확장(ADR-0033 §3): 마이그레이션 0007(`deleted_at`·신고·차단·원장 `revoked`), 채택 변경·취소(+원장 -10), 댓글 수정, 신고 + `/admin/reports` + 밴(`banUser`), 사용자 간 차단, 사용자명 변경(`/settings/profile`, better-auth `/update-user` 는 계속 닫음), 트립 첨부 인가를 "소유자 또는 공개 트립" 으로 축소(ADR-0032 구현 메모), 채택 댓글 삭제 시 원장 회수(KNOWN ISSUE 해소), 프로필 대문 높이 상한·그리드 빈 열 채움.
2. 5단계 i18n(ADR-0033 §4, 리서치 메모 §next-intl): next-intl 4.14, `as-needed`, `app/[locale]/` 재구성 + 기존 `proxy.ts` 와 미들웨어 합성, 전 문구 카탈로그화.
3. 6단계 인증 확장(ADR-0033 §2, 리서치 메모): Naver(genericOAuth)·GitHub, 이메일 인증(Cloudflare Email Service 베타 + `cloudflare/mail-worker/`), 약관·동의(`docs/legal/`, korean-law-mcp). 키 없으면 비활성 + 안내.
4. 7단계 AI(ADR-0029), 8단계 SEO(ADR-0030).
5. QA 잔여: 모바일 Sheet 포커스 복귀, R2 설정 후 이미지 업로드(예매·에디터·프로필), 편집기 검증 문구 한국어화(사용자 확인 후), 일정 종류 `key` 노출 여부.

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

| ADR       | 결정                                                                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0001~0030 | 세션 1·2 결정(스택, 구조화 데이터, 자체 인증, 셀형 UI, 락파일 v1, 템플릿, R2 업로드, Tiptap, 커뮤니티 정책, Queues AI, SEO)                                                 |
| 0031      | `Agent` 도구 금지, 위임은 Workflow 의 `agent()` 로만(구현 Opus max·리뷰 Opus high·리서치 Sonnet), 로드맵 7 은 화면 미연결로 push, `auto-push true`, 문서 헤더는 코드 커밋에 |
| 0032      | 세션 프레임 라우팅, 마이그레이션 0006 스키마, 포인트(답변 +2 글당 1회·채택 +10)·카운터 잠금, 렌더 방식(목록 = 서버 컴포넌트), 프로필 이미지 undefined/null/id 의미          |
| 0033      | OSM 제거(사업자 요건), 인증 확장 착수(Cloudflare 메일), 커뮤니티 범위 밖 기능 전부 수용(무한 스크롤만 미도입), i18n ko·ja·en next-intl, 단계 순서 4→4-5→5→6→7→8             |

Workflow C 메인 결정 10건(ADR-0032 구현 메모): `(shell)` 그룹 통합, 링크 탭 `aria-current`, `Route<T>` 제네릭·상대 href, `React.cache` 캐시 모듈, `findLatestPostsByBoard`, 작성자 조회수 제외, PostForm 저장 후 `reset`, 공개 표면 `bg-border` 심, Select 팝오버 유지, 글 수정은 작성자만.

기각·보류: 워크트리 병렬 UI 구현(공용 컴포넌트 계약 충돌, ADR-0031 운용 메모) · headless Chrome 비로그인 촬영(멈춤) · 브라우저 자동화 `type`/`Return` 직접 입력(선택 탭·툴바로 새어 JS 입력으로 대체) · 트립 첨부 인가 즉시 축소(4-5 로) · 본문 img 호스트 화이트리스트(정상 기능이라 보류).

## 5. 사용자 방향성 & 작업 규칙

- 답변: 한국어 존댓말, 간결, 자축·"완벽" 단언 금지, 검증 안 된 것은 안 됐다고. 모호하면 한 번에 모아 객관식(추천안 먼저). 사용자는 대체로 "추천대로", 순서는 메인에 위임. **"멈춰" 지시가 오면 진행 중인 단위만 마무리하고 push 등 다음 단계로 넘어가지 않는다.**
- 에이전트: **`Agent` 도구(서브에이전트) 절대 금지. 모든 위임은 `Workflow` 의 `agent()`**. 구현 Opus `max`, 리뷰 Opus `high`, 리서치·사실 확인 Sonnet. 메인(Fable)은 지휘·ADR·재검증·마이그레이션 적용·push. 워크플로 대기는 `until` 루프(10분 단위). 리서치는 주제당 질문 3개·10분.
- 코드: `~/.claude/convention` + `~/personal-llm` 전부(arrow only, 주석 금지, any/enum 금지, FC<Props>, useCallback/useMemo 금지, FSD 위→아래, barrel 금지, zod v4, RHF+zodResolver, 토큰 색만, 이모지 금지, 매직넘버 상수화, effect 안 setState 금지). 예외: RHF `register()` 파일 `'use no memo'`(18개, ADR-0018), `Route<T>` 제네릭 컴포넌트 3개(FC 대신 제네릭 화살표).
- 디자인: 보더 대신 배경 계층·1px 심(표만 보더), 셀형 Button 전면(ADR-0023), 링크 탭 `aria-current`·토글 버튼 `aria-pressed`, 콘텐츠 사이드바 전체 높이, dvh 채움, 3D 는 정보 있는 곳만, 모션 항상, 인쇄 라이트 토큰. 초기 화면 스켈레톤 금지(서버 프리페치·서버 컴포넌트 완성 HTML). shadcn 우선.
- Git: Conventional Commits(영어 소문자), author 사용자 단독, 트레일러 금지, `git add -A` 금지, force push 금지. 자동 커밋·자동 push ON(단계 완료마다 push + dev→prod ff 머지, `git merge dev` 로 — `--ff-only`·"fast-forward"·`-f` 문자열은 가드 훅이 force 로 오인). 워크트리 제거는 push 와 다른 명령으로.
- DB: 로컬 = prod 공용 MySQL. 컬럼 삭제 마이그레이션은 적용 직후 push·배포. 추가 전용은 먼저 적용해도 됨(0006 이 그렇게 적용됨). `PublicTrip` 형태 변경 시 `PUBLIC_TRIP_CACHE_VERSION` 증가(현재 `'3'`).
- 문서: 결정은 ADR(다음 번호 **0034**), 진행은 `docs/PROCESS.md`, 버그는 `docs/bug`, QA 는 `docs/quality-assurance`, 계획은 `docs/roadmap.md`. README.md 는 지시 전까지 손대지 않는다. personal-llm 은 갱신하지 않는다. `.env*` 는 읽기·쓰기 불가(값은 문서에 기록하지 않음, 필요 키는 사용자에게 `! <명령>` 로 안내).
- 브라우저 실측(Claude in Chrome): 탭 줌 54% 라 `zoom` 액션으로 확인. CDP `type`·`key` 는 **선택된 탭**으로 가고 툴바 버튼에 Enter 가 눌려 폼이 제출되므로, 입력은 페이지 내 스크립트(native setter + `input`, 합성 `keydown` Enter, `.click()`)로. 다이얼로그·에디터 준비를 폴링으로 기다린다(dev 컴파일 2초+). 라이트·다크 모두 확인(테마는 `window` `keydown 'd'` 합성 이벤트 또는 `localStorage.theme`). headless Chrome 촬영은 멈추므로 비로그인 표면은 `curl` HTML 로 대체했다.

## 6. 미해결 질문 / 사용자 확인 필요 항목

1. **QA 데이터 정리**(push 전 결정): 공용 DB 에 자유게시판 글 `050aa2f0-b09e-4daf-a3ff-38944c5eb10c`("세션 3 QA 글 - 수정됨", 댓글 1·좋아요 1, 오사카 트립 연결), 오사카 트립(`905b4695-…`) 좋아요 1(tester), tester 소개 문구가 남아 있다. A(추천): 글·댓글은 삭제 흐름 실측을 겸해 UI 로 삭제, 좋아요·소개는 유지 / B: 전부 유지 / C: 전부 삭제.
2. 트립 첨부 인가 축소(소유자 또는 공개 트립) — 메인 결정, 4-5 에서 적용 예정. 이견 시 알려 달라.
3. 채택 댓글 삭제 시 재채택 가능(KNOWN ISSUE) — 4-5 원장 회수와 함께 해소.
4. 프로필 대문 `aspect-3/1` 높이 상한, 공개 트립 그리드 빈 열 채움 — 4-5 에서 처리 예정(디자인 이견 시).
5. `isomorphic-dompurify`(Node 에서 jsdom) → `dompurify` + happy-dom 창으로 교체 검토 — 서버 번들·콜드스타트 문제가 보이면.
6. Cloudflare Email Service 가 **Beta·Workers Paid 플랜** 필요(리서치 메모). 프로덕션 트랜잭션 메일에 쓰는 리스크 수용 여부, 발신 도메인(Cloudflare DNS 필수).
7. 사용자 작업: `.env`·Vercel 에 `APP_ENCRYPTION_KEY`·`R2_*` 5개(**`R2_PUBLIC_BASE_URL` 은 빌드 타임에도 필요** — `next/image` `remotePatterns`), `.env.example` 이름, R2 커스텀 도메인, Vercel CLI 최신화 + `vercel link`, korean-law-mcp 설치·키(6단계 약관 작성용).
8. 편집기 검증 문구 한국어화·일정 종류 `key` 노출(기존 보류 유지).

## 7. 환경 & 전제

- Node 22 / Bun 1.4.0 로컬(락파일 v1, `packageManager bun@1.3.14`, 의존성 추가는 `npx bun@1.3.14 install`). Vercel Pro(team `team_ZNm5hw73FNPctUWAuifjdn2b`, project `prj_a0su9UvuXawlx9OEASFDvbGcDeMe`), CLI 56.5.0(구버전), `.vercel` 미링크.
- 실행: `bun run dev`(:3000, 세션 3 종료 시점에 사용자의 `next-server` PID 25061 이 떠 있음 — 종료 금지) · `bun run build` · `bun run db:generate` · `bun run db:migrate` · `bun run admin:set <email>` · 검증 `bun run typecheck && bun run lint && bun run format:check && bun test`(433) `&& bun run build`.
- DB: 공용 MySQL 9.6 스키마 `trip`, 마이그레이션 0000~0006 적용(이력 7행), 테이블 32. 계정: tester@example.com(사용자명 tester, `role user`, 오사카 예시 트립 공개 slug `osaka-qa`, 소개 문구 있음), hyunseok(사용자 본인), qa_session2_204103@example.com(throwaway, 비밀번호 미기록). 관리자 계정 없음.
- 브라우저: Chrome 의 localhost:3000 은 tester 로 로그인된 상태(세션 쿠키). 새 창 탭은 폭 1440 으로 `resize_window` 가 동작했으나 페이지 줌은 54%.
- 참조 원본: `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`. 리서치: `docs/memory/research-2026-09-09-r2-ai-tiptap.md`, `docs/memory/research-2026-09-10-mail-i18n-auth.md`.

## 8. 다음 세션 TODO (우선순위 순)

1. §6-1 QA 데이터 정리 확인 → 남은 실측(`docs/quality-assurance/2026-09-10-community-editor-checklist.md` "남은 실측") → push·prod 머지·배포 확인(PROCESS 4-4c-3).
2. 4-5 로드맵 6 확장(ADR-0033 §3 + ADR-0032 구현 메모의 대기 항목): ADR-0034 로 세부(신고 사유 목록, 차단 범위, `/admin/reports` 화면, 원장 `revoked`) 확정 → Workflow(데이터 → UI → 리뷰) → 마이그레이션 0007 → 실측 → push.
3. 5단계 i18n → 6단계 인증 확장 → 7 AI → 8 SEO.
4. R2·암호화 키가 들어오면 업로드·AI 키 등록 실측.

## 9. 문서 지도

- `docs/HANDOFF.md` — 이 문서
- `docs/ARCHITECTURE.md` — 구현 정본(스택·폴더·라우트·인증·데이터 계층·인가·계층/모션·3D·템플릿·검증·리치 텍스트·커뮤니티)
- `docs/memory/data-model.md` — 테이블 32개 요약 · `docs/memory/research-2026-09-09-r2-ai-tiptap.md`(R2·AI SDK·Tiptap·Queues) · `docs/memory/research-2026-09-10-mail-i18n-auth.md`(Cloudflare 메일·next-intl·better-auth 인증 확장·korean-law-mcp)
- `docs/acknowledge/README.md` + ADR-0001~0033
- `docs/roadmap.md` — 항목별 명세 + 진행 상태 표(§3 OSM 제거, §11 i18n)
- `docs/PROCESS.md` — 단계 체크리스트·진행 메모(에이전트 운용·워크트리 이식 절차)
- `docs/history/2026-09-09-initial-build.md` · `docs/history/2026-09-09-session-2.md` · `docs/history/2026-09-09-session-3.md`(세션 3 = 이번 세션)
- `docs/bug/2026-09-09-editor-forms-and-print.md` · `docs/feedback/2026-09-09-viewer-visual-feedback.md` · `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md` · `docs/quality-assurance/2026-09-10-community-editor-checklist.md`(중단 지점의 남은 실측 목록)
- `docs/DESIGN.md`, `docs/osaka-trip-interactive.html` — 외부 원본(수정 금지)
