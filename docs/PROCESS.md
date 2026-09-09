# PROCESS — trip

> 최종 갱신: 2026-09-09 · 대응 커밋: 8f345b1 (dev = prod, 2026-09-09)
> 기준 문서: `~/.claude/convention/*.md`, `~/personal-llm/*.md`, `docs/HANDOFF.md`(세션 진입점), `docs/ARCHITECTURE.md`, `docs/acknowledge/README.md`, `docs/DESIGN.md`

## 완료 — 초기 구축 (2026-09-09, Phase 1~3)

- [x] 0. 분석·합의 — 원본 HTML·DESIGN.md·Calendar 레포 분석, 질문 11건 확정(ADR-0001~0006)
- [x] 1. 스캐폴딩 — bun, Next 16, Tailwind 4, shadcn 4 전 컴포넌트, git(dev/prod), 자동 커밋
- [x] 2. 기반 — DESIGN §16 토큰(globals.css, `.surface-public`), 프로바이더·루트 레이아웃, env, bun test
- [x] 3. DB — drizzle mysql `trip_` 스키마 22 테이블, 마이그레이션 0000·0001 적용
- [x] 4. 인증 — better-auth 이메일·사용자명, proxy 게이팅, 로그인·회원가입
- [x] 5. 데이터 계층 — entities/trip·user-state, API 라우트, 서버 프리페치
- [x] 6. 공개 표면 — 인트로(지구본)·404·앱 셸
- [x] 7. 목록·생성·삭제 — `/trips`, `/trips/new`
- [x] 8. 편집기 — 탭형 구조화 폼, dnd-kit 정렬, Cmd+S
- [x] 9. 뷰어 — 원본 재현, 사용자별 체크·메모, 인쇄 트리, 날짜 탭 오버플로 UX
- [x] 10. 공유 — 멤버 초대, 공개 `/s/[slug]`
- [x] 11. 모션·3D — motion 전역, 실제 지리 지구본, 모션 줄이기 토글
- [x] 12. 오사카 템플릿 — 전수 이식, 시드, 앱 내 생성
- [x] 13. Phase 3 — 목적지(나라)·즐겨찾기 레일·보더 없는 폼 컨트롤
- [x] 14. 검증 — typecheck·lint·182 tests·build 통과. 브라우저 확인 완료 항목: 인트로·회원가입·목록(별표·지구본)·새 트립(나라 콤보박스)·뷰어(체크·뷰 전환·날짜 탭·달력 점프·라이트/다크)·편집기(탭·목적지). 잔여는 `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md`
- [x] 15. 문서 — ARCHITECTURE·data-model·ADR·history·feedback·QA·roadmap·HANDOFF

## 진행 — 세션 2 (2026-09-09)

- [x] 0. 컨텍스트 복원 — HANDOFF·ARCHITECTURE·ADR 16건·roadmap·QA 정독, HANDOFF 3번 코드 전수 대조(테이블 22개·고아 스켈레톤 2개·npm `cn` 미기록 발견)
- [x] 1. 문서 정정 — 테이블 수 22(HANDOFF·PROCESS·ARCHITECTURE), npm `cn` 기록(ARCHITECTURE §1·ADR-0012), 고아 `trip-create-skeleton`·`trip-list-skeleton` 삭제
- [x] 2. Vercel prod 확인 — `trip.gumyo.net` `/`·`/login`·`/signup` 200, `/trips` → `/login?next=` 307, 없는 slug 404
- [ ] 3. QA 잔여 실측(라이트·다크) — `/s/[slug]`(공개 토글 후), 인쇄 미리보기, 모바일 Sheet, 편집기 저장·드래그 정렬 → 체크리스트 체크 + 이슈 수정
- [ ] 4. ADR-0017 회원가입 "이름" 제거 — `auth.validate`·`signup-form`·`signup-widget`·테스트, `name` 에 사용자명 저장, ARCHITECTURE §4·ADR-0003·roadmap 7 갱신
- [ ] 5. 검증(typecheck → lint → test → build) + 브라우저 확인 + HANDOFF 갱신

## 미착수

- [ ] 로드맵 1~~6·8~~10 + 7 의 나머지(OAuth·이메일 인증·약관·후기·에디터) — 순서는 사용자가 정한다. 착수 전 ADR 추가

### 진행 메모

- Vercel: 브랜치 `prod`, 환경변수 `DATABASE_URL`·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`(+선택 `SEED_OWNER_EMAIL`). 락파일 v1(ADR-0013).
- 검증 계정(로컬 DB): tester@example.com / 사용자명 tester(예시 트립 1개 생성됨).
