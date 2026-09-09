# PROCESS — trip

> 기준 문서: `~/.claude/convention/*.md`, `~/personal-llm/*.md`, `docs/acknowledge/2026-09-09-stack-and-scope.md`, `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`

## 작업: 오사카 정적 페이지 → Next.js 트립 앱 (2026-09-09 시작)

- [x] 0. 분석·합의 — 원본 HTML·DESIGN.md·Calendar 레포 분석, 질문 11건 확정 (`docs/acknowledge/2026-09-09-stack-and-scope.md`)
- [x] 1. 스캐폴딩 — create-next-app(bun, TS, Tailwind 4, App Router, React Compiler), 의존성 설치, git init(main, auto-commit)
- [x] 2. 기반 설정 — prettier(feconfig-bhs), next.config(보안 헤더·cacheComponents·typedRoutes), shadcn 4(vega/radix, `shared/ui`), DESIGN §16-1/16-2 토큰 이식(globals.css, `.surface-public`), 테마·쿼리 프로바이더·루트 레이아웃, `.env` 키 추가·`.env.example`, bun test 셋업
- [x] 3. DB — drizzle mysql 스키마(`trip_` 프리픽스 creator, 19 테이블), better-auth(username) 테이블 포함, 마이그레이션 generate → migrate 적용 완료. 정본 `docs/memory/architecture.md`·`data-model.md`
- [ ] 4. 인증 — better-auth(drizzle adapter mysql, 이메일·비밀번호 + username 플러그인, cookiePrefix `trip`), `/api/auth/[...all]`, proxy.ts 게이팅, 로그인·회원가입 페이지
- [ ] 5. 데이터 계층 — entities(zod 스키마·타입·server actions·route handlers·queryOptions·QUERY_KEY), `use cache` + cacheTag, 인가(소유자·멤버·공개)
- [ ] 6. 공개 표면 — 인트로 `/`(3D 히어로·motion), 로그인, 404
- [ ] 7. 앱 셸·목록 — `/trips` 목록(3D 헤더), 생성 `/trips/new`, 삭제 다이얼로그
- [ ] 8. 편집기 — `/trips/[id]/edit` 구조화 폼(기본·항공·숙소·날짜별(일정/경로/메모)·예매·정보·멤버·공유), dnd-kit 정렬
- [ ] 9. 뷰어 — `/trips/[id]` 원본 화면 재현(사이드바·날짜별·예매·정보·인쇄), 체크·메모 DB 동기화(사용자별)
- [ ] 10. 공유 — 멤버 초대(이메일), 공개 slug `/s/[slug]` ISR + revalidateTag
- [ ] 11. 모션·3D 전역 — 페이지 전환·리스트 stagger·체크 완료·진행바·아코디언, 지구본 컴포넌트 재사용처 적용, reduced-motion
- [ ] 12. 오사카 템플릿 — 템플릿 상수(원본 전수 이식), 시드 스크립트, 앱 내 "예시 트립 만들기"
- [ ] 13. 검증 — typecheck → lint → test → 빌드, 브라우저 라이브 확인(라이트·다크)
- [ ] 14. 문서 — docs/memory(데이터 모델·환경변수), docs/history, docs/quality-assurance 체크리스트

### 진행 메모

- 1: `create-next-app` 은 `.env` 가 있는 디렉터리를 거부해 스크래치패드에 생성 후 복사(README.md·CLAUDE.md·AGENTS.md 는 복사하지 않음).
- 3: drizzle `isConfig` 버그로 `{ client, mode }` 설정이 클라이언트로 오인됨 → migrate 스크립트는 `logger: false` 동봉. DB 는 MySQL 9.6, 스키마 `trip`.
- 4(변경): 사용자 추가 지시로 OAuth 제거, 이메일·비밀번호 + username 로그인.
