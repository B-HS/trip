# PROCESS — trip

> 기준 문서: `~/.claude/convention/*.md`, `~/personal-llm/*.md`, `docs/acknowledge/2026-09-09-stack-and-scope.md`, `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`

## 작업: 오사카 정적 페이지 → Next.js 트립 앱 (2026-09-09 시작)

- [x] 0. 분석·합의 — 원본 HTML·DESIGN.md·Calendar 레포 분석, 질문 11건 확정 (`docs/acknowledge/2026-09-09-stack-and-scope.md`)
- [x] 1. 스캐폴딩 — create-next-app(bun, TS, Tailwind 4, App Router, React Compiler), 의존성 설치, git init(main, auto-commit)
- [x] 2. 기반 설정 — prettier(feconfig-bhs), next.config(보안 헤더·cacheComponents·typedRoutes), shadcn 4(vega/radix, `shared/ui`), DESIGN §16-1/16-2 토큰 이식(globals.css, `.surface-public`), 테마·쿼리 프로바이더·루트 레이아웃, `.env` 키 추가·`.env.example`, bun test 셋업
- [x] 3. DB — drizzle mysql 스키마(`trip_` 프리픽스 creator, 19 테이블), better-auth(username) 테이블 포함, 마이그레이션 generate → migrate 적용 완료. 정본 `docs/memory/architecture.md`·`data-model.md`
- [x] 4. 인증 — better-auth(drizzle adapter mysql, 이메일·비밀번호 + username 플러그인, cookiePrefix `trip`), `/api/auth/[...all]`, proxy.ts 게이팅, 로그인·회원가입 페이지(브라우저 확인은 13에서)
- [x] 5. 데이터 계층 — entities/trip(type·validate·role·access·tag·repository×3·cache·action·api·query·prefetch), entities/user-state, `app/api/trips/*`, `use cache`+cacheTag(updateTag·revalidateTag 2인자), 인가. 초대 수락은 `shared/db/accept-invites.ts`(auth hook 이 entities 를 역참조하지 않도록 이동)
- [x] 6. 공개 표면 — 인트로 `/`(3D 지구본·motion·마케팅 카피), 로그인·회원가입, 공개 레이아웃, 404, 앱 셸(레일·모바일 시트·테마 토글). 라이브 확인은 13에서
- [x] 7. 앱 셸·목록 — `/trips` 목록(3D 헤더·통계 타일·카드), 생성 `/trips/new`(빈 트립 / 오사카 예시), 삭제 다이얼로그
- [x] 8. 편집기 — `/trips/[id]/edit` 탭형 구조화 폼(기본·항공/숙소·날짜별(사실/경로/일정/참고)·예매·정보·멤버/공유·JSON 내보내기), dnd-kit 정렬, Cmd+S 저장
- [x] 9. 뷰어 — `/trips/[id]` 원본 화면 재현(사이드바+미니 지구본·날짜별·예매·정보·인쇄 전용 트리), 체크·메모 DB 동기화(사용자별, 낙관적)
- [x] 10. 공유 — 멤버 초대(이메일·가입 시 자동 수락), 공개 slug `/s/[slug]`(use cache + cacheTag, revalidateTag)
- [x] 11. 모션·3D — 페이지 전환·리스트 stagger·체크 완료·진행바·탭 인디케이터 적용. 지구본은 실제 지리(해안선·육지 점·마커·대권 곡선)로 재작성, 인트로·목록·빈 상태·404 에 적용(장식용 미니 지구본은 제거). OS reduce-motion 대신 앱 내 설정
- [x] 12. 오사카 템플릿 — 템플릿 상수(65행·16경로·9예매·4정보섹션 전수), 시드 스크립트(`bun run db:seed`, 가입 후), 앱 내 "오사카 예시 트립 만들기" 동작 확인
- [x] 13. 검증(1차) — typecheck·lint·182 tests·build 통과. 브라우저: 인트로·회원가입·목록(별표·지구본)·새 트립(나라 콤보박스)·뷰어(체크·뷰 전환·날짜 탭 오버플로·달력 점프·인쇄 트리)·편집기(탭·목적지)·다크/라이트 확인. 남은 확인은 `docs/quality-assurance` 체크리스트
- [ ] 13-old. 검증 — typecheck·lint·test·build 통과. 브라우저: 인트로(라이트·다크)·회원가입·목록·예시 생성·뷰어(체크·뷰 전환·다크)·편집기(다크) 확인 완료. 남은 확인: 공유 페이지 `/s/[slug]`, 편집기 저장·정렬, 인쇄 미리보기, 모바일 시트
- [ ] 14. 문서 — docs/memory(데이터 모델·환경변수), docs/history, docs/quality-assurance 체크리스트

- [ ] 16. 다음 페이즈(미착수, 사용자 기획): 사이드바 링크·설명 커스터마이징 / 예매 첨부(이미지·링크) / OSM 지도·현재 위치 / AI 질문답·수정(Ollama Cloud·OpenAI·Claude, 모델 목록·추론 강도 동적 로드, models.dev 금지) / 일정 종류 배지 커스터마이징(현재 3종 하드코딩) / 커뮤니티(메인=커뮤니티 홈, 공개 트립 탐색·좋아요·이번 주/달 플랜, 자유·질문게시판·답변 포인트, 사용자 페이지) / Naver·GitHub OAuth·회원가입 약관·여행 후기 게시판·Tiptap+shadcn 에디터(YouTube embed) / 셀형 액션 UI 전면 적용 / 몇박 몇일 커스텀 표기 / SEO·GEO·JSON-LD·Vercel Analytics·Speed Insights → `docs/roadmap.md`
- [x] 15. Phase 3 — 목적지(나라) 지정 + 지구본 연동, 즐겨찾기 + 레일 트립 목록, 보더 없는 폼 컨트롤, 모션 줄이기 토글, QA 체크리스트(7ac95d6). 브라우저 확인 진행 중

### 진행 메모

- 13(사용자 피드백 3차): 보더 제거(배지·도구 버튼·사이드바 구분·아코디언), 시간 칸 카드 톤, 표 인셋 제거, 편집기 탭 수직 정렬, 콘텐츠 dvh 채움, 날짜 탭 오버플로 UX(화살표 셀·스크롤 표시·달력 점프). 지구본 실제 지리 완료(b9e8881).
- 13(사용자 피드백 2차): 뷰 탭을 여백 없는 풀블리드 스트립으로, 종류 배지를 시간 칸으로 이동, 지도 버튼과 높이 통일(h-6), 경로 블록을 px-4 카드+심으로. cacheComponents 해제로 초기 스켈레톤 제거(`docs/acknowledge` 참조). 지구본은 실제 지리(해안선·점·곡선 경로)로 재작성 위임 중.
- 13(사용자 피드백 반영): OS reduce-motion 무시(앱 내 설정으로 대체), 파비콘 Calendar 것 사용, 셸 레일-콘텐츠 사이 12px 인셋·1px 심 제거, 뷰어 사이드바를 bg-sidebar → bg-card 로(레일과 같은 톤 금지), 표 헤더·안내 스트립은 bg-muted. Next `agentRules` 비활성, 공유 페이지 빈 generateStaticParams 제거, route handler/action catch 에 `unstable_rethrow`.

- 1: `create-next-app` 은 `.env` 가 있는 디렉터리를 거부해 스크래치패드에 생성 후 복사(README.md·CLAUDE.md·AGENTS.md 는 복사하지 않음).
- 3: drizzle `isConfig` 버그로 `{ client, mode }` 설정이 클라이언트로 오인됨 → migrate 스크립트는 `logger: false` 동봉. DB 는 MySQL 9.6, 스키마 `trip`.
- 4(변경): 사용자 추가 지시로 OAuth 제거, 이메일·비밀번호 + username 로그인.
- git: 커밋 가드 훅이 `main` 직접 커밋을 차단 → 첫 커밋(스캐폴딩)만 main, 이후 `feat/trip-app` 브랜치에서 자동 커밋. main 머지는 사용자 지시 시.
- 위임(Workflow 2, Opus): F 목록·생성·삭제(`/trips`, `/trips/new`) / G 뷰어(`/trips/[id]`)+공개 공유(`/s/[slug]`) / H 구조화 편집기(`/trips/[id]/edit`)+멤버·공유.
- 위임(Workflow 1, Opus): A 데이터 계층(entities/trip·user-state·api 라우트·seed) / B 오사카 템플릿 상수 / C1 3D·모션 프리미티브·인트로·404 / C2 인증 페이지·공개 레이아웃·앱 셸. 메인은 정본(스키마·auth·env·레이아웃·토큰) 담당.
