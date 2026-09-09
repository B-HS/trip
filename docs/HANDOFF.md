# HANDOFF — 2026-09-09 세션 2 종료 스냅샷

> 대응 커밋: `4976c31`(origin/dev = origin/prod, Vercel 배포·확인 완료). 마지막 코드 커밋은 공개 페이지 캐시 키 버전 수정(`fix(share)`), 그 앞이 `aab891f`(R2 업로드). 이 문서는 새 세션의 단일 진입점이며 매 핸드오프마다 덮어쓴다.
> 복기 신뢰도: 세션 2 전체 대화 기준. Opus 서브에이전트 8건(원인 분석 1, 리서치 2, 구현 5)은 최종 보고서 기준이며 결과는 메인이 브라우저·API 로 재검증했다.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본)으로 재구현해 `trip.gumyo.net`(Vercel Pro, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

- 최종 목표: 여행 일정·예매·정보를 구조화해 관리·공유하고, 커뮤니티·AI·에디터까지 확장(로드맵 1~10 중 3 보류). DESIGN.md 의 "배경 계층·보더 없음·셀형 UI" 를 사용자의 해석대로 구현.
- 현재 마일스톤: 로드맵 6단계 계획(ADR-0022) 중 **1~3단계 완료**(버그 수정·9·8·1·5·2). **다음은 4단계: 로드맵 7(Tiptap + YouTube, ADR-0027) → 6(커뮤니티·프로필, ADR-0028)**, 이어 5단계 로드맵 4(AI, ADR-0029), 6단계 로드맵 10(ADR-0030).
- 직전 작업: 로드맵 5·2 병렬 구현을 합쳐 마이그레이션 0004·0005 적용, 실측, 커밋 → 문서 정리 → 이 핸드오프. 사용자가 "컨텍스트가 거의 차서 새 세션용 스킬을 돌린다" 고 하여 여기서 멈춤.

## 3. 완료 / 진행 중 / 미착수

### 세션 2 에서 완료(커밋 순, 전부 dev)

- `dfb481e` 문서-코드 동기화(테이블 22, npm `cn`, 고아 스켈레톤 삭제).
- `6e26b29`·`37fad63`·`7b1fc34` 편집기 폼 버그(RHF + React Compiler → `'use no memo'` ADR-0018), `AnimatePresence` 잔여 행(ADR-0019), dnd-kit hydration, 인쇄 다크 토큰, 표 분할 방지. `docs/bug/2026-09-09-editor-forms-and-print.md`.
- `95d1cc4` 회원가입 이름 제거(ADR-0017).
- `ac75640` JSON 가져오기(ADR-0021), `saveDay` 하위 id 반환, 날짜 정렬 낙관적.
- `046a492` 몇박 며칠 `customNights`/`customDays`(ADR-0020, 마이그레이션 0002) + 기본 정보 저장 toast 1회.
- `bc18131` 셀형 액션 UI 전면(ADR-0023, `Button` 변형 `cell`·`cellPrimary`·`cellDestructive`, 크기 `cell`·`cellIcon`).
- `fddab44` 사이드바 링크·소개 문구 + 편집기 "사이드바" 탭(ADR-0024, 마이그레이션 0003).
- `ffb5aee` 일정 종류 테이블 `trip_schedule_kind` + `kind_id` + 편집기 "일정 종류" 탭(ADR-0025, 마이그레이션 0004 에 데이터 이관 SQL 포함, `kind` enum 컬럼 삭제).
- `aab891f` 서버 경유 R2 업로드 `/api/uploads` + 예매 첨부(ADR-0026, 마이그레이션 0005, `@aws-sdk/client-s3`). `eslint.config.mjs` 에 `.claude/**` 무시.
- 문서 커밋들: ADR-0020~0030, 리서치 메모, PROCESS·ARCHITECTURE·data-model·roadmap·history·QA 체크리스트.
- `4976c31` 공개 페이지 `unstable_cache` 키에 `PUBLIC_TRIP_CACHE_VERSION` 추가. 배포 직후 `/s/osaka-qa` 가 옛 캐시 형태로 약 10분 500 이었던 장애의 수정(`docs/bug/…` 추가 절). `PublicTrip` 형태가 바뀌는 배포마다 값을 올린다.
- prod 배포 확인: `4976c31` 이 `trip.gumyo.net` 에 배포됨 — `/`·`/login`·`/signup` 200, `/trips` 307, `/s/osaka-qa` 200("6박 7일", 범례 3종), `/api/uploads` POST 401(미로그인).

### 진행 중

- 없음. 워크트리 없음(`git worktree list` 가 메인만). `.claude/` 는 커밋하지 않는다(에이전트 설정·워크트리 잔여).

### 미착수 (순서대로)

1. (완료) push·prod 머지·배포 확인은 세션 2 말미에 끝냈다. 새 세션은 2번부터.
2. 4단계 로드맵 7: Tiptap 3.31 고정 버전, `features/editor/rich-editor.tsx`(순수 UI, 툴바 셀), 공식 YouTube 확장(nocookie), 서버 `generateHTML` + DOMPurify iframe 화이트리스트 훅, `happy-dom` 을 dependencies 로(ADR-0027). 이미지 업로드는 `useUploadImage('post')` 재사용.
3. 4단계 로드맵 6: 커뮤니티 홈(`/` 로그인 시 커뮤니티, 인트로 유지 + 공개 섹션), `/explore`·좋아요, 게시판 3종(free·qna·review)·댓글·채택·포인트(+2/+10), better-auth `admin` 플러그인 `role`, 프로필 `/u/[username]`·`/settings/profile`(대문·사진 업로드, 소개), 인가 표 확장(ADR-0028). 마이그레이션 0006.
4. 5단계 로드맵 4: Vercel Queues(`@vercel/queue`, `vercel.json` `experimentalTriggers`), `trip_ai_*` 테이블, AI SDK v7 + `@ai-sdk/openai`·`anthropic`·`openai-compatible`(Ollama Cloud), 사용자 키 AES-256-GCM(`APP_ENCRYPTION_KEY` 없으면 기능 비활성 + 안내), 모델 목록 동적, 추론 강도, `generateObject` 로 일정 수정 제안 + diff 승인(ADR-0029).
5. 6단계 로드맵 10(ADR-0030).
6. QA 잔여: 모바일 Sheet 닫힘 포커스 복귀, 편집기 검증 문구 한국어화(사용자가 직접 본 뒤 결정), 일정 종류 `key` 노출 여부, R2 설정 후 이미지 업로드 실측, 셀형 UI 로그아웃 표면(`/login`·`/signup`·`/`·404)은 헤드리스 촬영 미실시.
7. 알려진 개선 후보: `shared/ui/card·alert·input-group` 보더(미사용 파일), 트립 삭제 시 R2 객체 잔존, `TripSummary.dayCount`(`entities/trip/trip.type.ts`·`trip.repository.ts`)는 카드가 `lengthLabel` 을 쓰면서 UI 미사용(API 응답 호환 때문에 남김, 제거 후보), 편집기 비소유자 탭 라벨이 `EDITOR_EXPORT_TAB_LABEL`('내보내기·가져오기') 로 고정, R3F `THREE.Clock` 경고(업스트림).

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

| ADR       | 결정                                                                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0001~0016 | 세션 1 결정(스택, 구조화 데이터, 자체 인증, `trip_` 프리픽스, 공유·사용자별 상태, 지도 링크만, 모션 항상, 지구본 실제 지리, prod/dev, 완성 HTML, 배경 계층·보더 없음, shadcn 우선, 락파일 v1, 템플릿·시드, 날짜 탭 UX, 목적지·즐겨찾기) |
| 0017      | 회원가입은 사용자명·이메일·비밀번호만, `name` 에 사용자명                                                                                                                                                                               |
| 0018      | RHF `register()` 컴포넌트는 `'use no memo'`(React Compiler 제외)                                                                                                                                                                        |
| 0019      | 편집기 정렬 행은 진입 페이드만, `DndContext id`                                                                                                                                                                                         |
| 0020      | 몇박 며칠 선택 입력(`customNights`/`customDays`), 비우면 계산                                                                                                                                                                           |
| 0021      | JSON 가져오기 = 현재 트립 내용 교체(공유·멤버 유지)                                                                                                                                                                                     |
| 0022      | 로드맵 착수 범위·순서·정책 답변 14건 + 자동 push·prod 머지                                                                                                                                                                              |
| 0023      | 셀형 액션 UI 는 `Button` 변형                                                                                                                                                                                                           |
| 0024      | 사이드바 링크 테이블 + `sidebar_note`, 별도 탭                                                                                                                                                                                          |
| 0025      | 일정 종류 트립별 테이블, 토큰 색 팔레트, `key` 는 UUID                                                                                                                                                                                  |
| 0026      | 서버 경유 R2 업로드 3MB, 공개 읽기는 커스텀 도메인, 키 없으면 UI 비활성                                                                                                                                                                 |
| 0027      | Tiptap 3 + 공식 YouTube 확장, JSON 정본 + 서버 sanitize                                                                                                                                                                                 |
| 0028      | 커뮤니티 홈·게시판·포인트·프로필 대문·사진, `role` 컬럼, 오프셋 20                                                                                                                                                                      |
| 0029      | AI 는 Vercel Queues, 자기 키만(무료 한도 없음), AES-GCM, 키 없이 구현 후 테스트                                                                                                                                                         |
| 0030      | SEO·GEO·JSON-LD·Analytics·Speed Insights 는 마지막 단계                                                                                                                                                                                 |

## 5. 사용자 방향성 & 작업 규칙

- 답변: 한국어 존댓말, 간결, 자축·"완벽" 단언 금지, 검증 안 된 것은 안 됐다고 말한다. 모호하면 한 번에 모아 객관식으로 묻고 추천안을 먼저 둔다. 사용자는 대체로 추천안을 승인하고 "끝까지 다 해봐" 로 위임한다.
- 코드: `~/.claude/convention` + `~/personal-llm` 전부(arrow only, 주석 금지, any/enum 금지, FC<Props>, useCallback/useMemo 금지, FSD 위→아래, barrel 금지, zod v4, RHF+zodResolver, 토큰 색만, 이모지 금지, 매직넘버 상수화, effect 안 setState 금지). 예외: RHF `register()` 파일은 `'use no memo'`(ADR-0018).
- 디자인: 보더 대신 배경 계층·1px 심(표만 보더), 셀형 버튼 전면(ADR-0023), 콘텐츠 사이드바 전체 높이, dvh 채움, 3D 는 정보 있는 곳만, 모션 항상 동작, 인쇄는 라이트 토큰.
- 성능: 초기 화면 스켈레톤 금지(서버 프리페치 완성 HTML).
- 도구: shadcn 우선. **구현·리서치는 Opus 서브에이전트**(메인 트리 1 + 워크트리 1 병렬, 주제당 질문 3개·10분 상한), 메인은 지휘·ADR·재검증. 워크트리 이식 절차는 `docs/PROCESS.md` 진행 메모.
- Git: Conventional Commits(영어 소문자), author 사용자 단독, 트레일러 금지, `git add -A` 금지, force push 금지. 자동 커밋 ON. **단계 완료마다 자동 push·prod 머지**(ADR-0022). 가드 훅은 명령 문자열의 `-f`·"fast-forward" 를 force 로 오인하므로 push 명령에는 그런 문자열을 섞지 않는다.
- 문서: 결정은 ADR(1건 1파일), 진행은 `docs/PROCESS.md`, 버그는 `docs/bug`, 계획은 `docs/roadmap.md`. README.md 는 지시 전까지 손대지 않는다. personal-llm 은 갱신하지 않는다.
- `.env*`: AI 는 읽기·쓰기 모두 권한상 불가(사용자 직접). 값은 문서에 기록하지 않는다.

## 6. 미해결 질문 / 사용자 작업

- 사용자 작업: `.env` 와 Vercel 환경변수에 `APP_ENCRYPTION_KEY`(`openssl rand -base64 32`)·`R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_BASE_URL` 추가, `.env.example` 에 이름 추가, R2 버킷의 Cloudflare 커스텀 도메인 연결, Vercel CLI 최신화 + `vercel link`(Queues 로컬 개발).
- 일정 종류 `key` 를 UI 에 노출할지(현재 UUID 자동).
- 편집기 검증 문구 한국어화 범위(사용자가 직접 본 뒤).

## 7. 환경 & 전제

- Node 22 / Bun 1.4.0 로컬(락파일 v1, `packageManager bun@1.3.14`; 의존성 추가 시 `npx bun@1.3.14 install`). Vercel Pro, CLI 미링크(`.vercel` 없음).
- 실행: `bun run dev`(:3000, 세션 2 종료 시점에도 이전 세션의 `next-server` PID 79590 이 떠 있음) · `bun run build` · `bun run db:generate`(신규 컬럼·rename 시 TTY 프롬프트 가능) · `bun run db:migrate`.
- DB: 공용 MySQL 9.6 스키마 `trip`(로컬·prod 동일). 마이그레이션 0000~0005 적용, 테이블 26개. 계정: tester@example.com(사용자명 tester, 오사카 예시 트립 1개, 공개 slug `osaka-qa`), throwaway `qa_session2_204103@example.com`.
- 브라우저 자동화: Claude in Chrome. 탭이 가려지면 클릭·키 입력이 전달되지 않고 애니메이션·전환이 정지한다 → 페이지 내 스크립트(native setter + `input`/`change` 이벤트, `execCommand('insertText')`, 창 `keydown`, `fetch` 가로채기)로 검증. `tabs_context_mcp(createIfEmpty)` 가 만든 새 창은 폭 500px(모바일 레이아웃)이고 `resize_window` 는 적용되지 않았다. localhost:3000 의 기존 탭은 줌 50%(innerWidth 3024) 였고 `cmd+0` 은 도구가 막는다 — 새 탭은 100% 다. 좌표 클릭보다 `find` ref·페이지 스크립트가 안정적이다. 로그아웃 화면은 헤드리스 Chrome(`--headless=new --screenshot`, `--force-dark-mode`)으로 촬영 가능하나 가끔 멈춘다(`pkill`).
- 참조 원본: `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`. 리서치 사실: `docs/memory/research-2026-09-09-r2-ai-tiptap.md`.

## 8. 다음 세션 TODO (우선순위 순)

1. 로드맵 7 Tiptap + YouTube 구현(ADR-0027) — Opus 에이전트, 워크트리 가능. 배포·마이그레이션은 세션 2 말미에 모두 반영·확인됨(`4976c31`).
2. 로드맵 6 커뮤니티·프로필(ADR-0028) — 마이그레이션 0006, `proxy.ts` `/` 리다이렉트 제거, admin 플러그인.
3. 로드맵 4 AI(ADR-0029), 로드맵 10(ADR-0030).
4. R2 키·암호화 키가 들어오면 업로드·AI 키 등록 실측.

## 9. 문서 지도

- `docs/HANDOFF.md` — 이 문서
- `docs/ARCHITECTURE.md` — 구현 정본(스택·폴더·라우트·인증·데이터 계층·인가·계층/모션·3D·템플릿·검증)
- `docs/memory/data-model.md` — 테이블 26개 요약, `docs/memory/research-2026-09-09-r2-ai-tiptap.md` — R2·AI SDK·Tiptap·Queues 리서치
- `docs/acknowledge/README.md` + ADR-0001~0030
- `docs/roadmap.md` — 항목별 명세 + 진행 상태 표
- `docs/PROCESS.md` — 단계 체크리스트·진행 메모(워크트리 이식 절차)
- `docs/history/2026-09-09-initial-build.md`, `docs/history/2026-09-09-session-2.md`
- `docs/bug/2026-09-09-editor-forms-and-print.md`, `docs/feedback/2026-09-09-viewer-visual-feedback.md`, `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md`
- `docs/DESIGN.md`, `docs/osaka-trip-interactive.html` — 외부 원본(수정 금지)
