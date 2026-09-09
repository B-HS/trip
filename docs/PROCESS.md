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
- [ ] 11. 모션·3D 전역 — 페이지 전환·리스트 stagger·체크 완료·진행바·아코디언, 지구본 컴포넌트 재사용처 적용, reduced-motion
- [ ] 12. 오사카 템플릿 — 템플릿 상수(원본 전수 이식), 시드 스크립트, 앱 내 "예시 트립 만들기"
- [ ] 13. 검증 — typecheck·lint·test·build 통과. 브라우저: 인트로(라이트·다크)·회원가입·목록·예시 생성·뷰어(체크·뷰 전환·다크)·편집기(다크) 확인 완료. 남은 확인: 공유 페이지 `/s/[slug]`, 편집기 저장·정렬, 인쇄 미리보기, 모바일 시트
- [ ] 14. 문서 — docs/memory(데이터 모델·환경변수), docs/history, docs/quality-assurance 체크리스트

### 진행 메모

- 13(사용자 피드백 반영): OS reduce-motion 무시(앱 내 설정으로 대체), 파비콘 Calendar 것 사용, 셸 레일-콘텐츠 사이 12px 인셋·1px 심 제거, 뷰어 사이드바를 bg-sidebar → bg-card 로(레일과 같은 톤 금지), 표 헤더·안내 스트립은 bg-muted. Next `agentRules` 비활성, 공유 페이지 빈 generateStaticParams 제거, route handler/action catch 에 `unstable_rethrow`.

- 1: `create-next-app` 은 `.env` 가 있는 디렉터리를 거부해 스크래치패드에 생성 후 복사(README.md·CLAUDE.md·AGENTS.md 는 복사하지 않음).
- 3: drizzle `isConfig` 버그로 `{ client, mode }` 설정이 클라이언트로 오인됨 → migrate 스크립트는 `logger: false` 동봉. DB 는 MySQL 9.6, 스키마 `trip`.
- 4(변경): 사용자 추가 지시로 OAuth 제거, 이메일·비밀번호 + username 로그인.
- git: 커밋 가드 훅이 `main` 직접 커밋을 차단 → 첫 커밋(스캐폴딩)만 main, 이후 `feat/trip-app` 브랜치에서 자동 커밋. main 머지는 사용자 지시 시.
- 위임(Workflow 2, Opus): F 목록·생성·삭제(`/trips`, `/trips/new`) / G 뷰어(`/trips/[id]`)+공개 공유(`/s/[slug]`) / H 구조화 편집기(`/trips/[id]/edit`)+멤버·공유.
- 위임(Workflow 1, Opus): A 데이터 계층(entities/trip·user-state·api 라우트·seed) / B 오사카 템플릿 상수 / C1 3D·모션 프리미티브·인트로·404 / C2 인증 페이지·공개 레이아웃·앱 셸. 메인은 정본(스키마·auth·env·레이아웃·토큰) 담당.
