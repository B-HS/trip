# PROCESS — trip

> 최종 갱신: 2026-09-09 · 대응 커밋: 95d1cc4 (로컬 dev, origin·prod 는 beb00c1, 2026-09-09 세션 2)
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
- [x] 3. QA 잔여 실측(라이트·다크) — `/s/[slug]`(공개 토글·404·태그 반영), 인쇄(미디어 규칙 주입 에뮬레이션), 편집기 저장·키보드 정렬·필수값 링 → 체크리스트 13건 체크. 발견·수정 6건은 `docs/bug/2026-09-09-editor-forms-and-print.md`(ADR-0018·0019). 모바일 Sheet 는 브라우저 창 고정으로 미실측
- [x] 4. ADR-0017 회원가입 "이름" 제거(ADR 작성 → Opus 에이전트 구현 → 검증) — `auth.validate`·`signup-form`·`signup-widget`·테스트, `name` 에 사용자명 저장, ARCHITECTURE §4·ADR-0003·roadmap 7 갱신
- [x] 5. 검증(typecheck → lint → prettier → test 183 → build) + 프로덕션 스모크(3001) + 브라우저 확인 + HANDOFF 갱신

## 진행 — 세션 2 후반: 로드맵 착수 (ADR-0022)

- [ ] 1단계. 버그 B1(saveDay 하위 id)·B2(기본 정보 toast 1회)·B3(날짜 정렬 낙관적)·B6(JSON 가져오기, ADR-0021)·B8(체크리스트 문구) + 로드맵 9(몇박 며칠, ADR-0020) — Opus 에이전트 2건 병렬(메인 트리와 워크트리) 진행 중. B4(shared/ui card·alert·input-group 보더)는 사용처가 없어 보류, 사용 시점에 제거
- [ ] 2단계. 로드맵 8 셀형 UI → 1 사이드바 링크 → 5 일정 종류
- [ ] 3단계. 로드맵 2 R2 업로드 기반 + 예매 첨부
- [ ] 4단계. 로드맵 7 Tiptap·YouTube → 6 커뮤니티·프로필(대문·사진)
- [ ] 5단계. 로드맵 4 AI
- [ ] 6단계. 로드맵 10 SEO·GEO·JSON-LD·Analytics·Speed Insights

## 미착수

- [ ] QA 잔여: 모바일 Sheet 닫힘 포커스 복귀, 편집기 검증 오류 문구 한국어화(사용자가 직접 본 뒤 결정)
- [ ] 로드맵 3 OSM(보류), 7 의 OAuth·이메일 인증·약관(보류)

### 진행 메모

- Vercel: 브랜치 `prod`, 환경변수 `DATABASE_URL`·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`(+선택 `SEED_OWNER_EMAIL`). 락파일 v1(ADR-0013).
- 검증 계정(로컬 DB): tester@example.com / 사용자명 tester(예시 트립 1개 생성됨).
