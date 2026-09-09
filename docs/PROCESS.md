# PROCESS — trip

> 최종 갱신: 2026-09-09 · 대응 커밋: 8f345b1 (dev = prod, 2026-09-09)
> 기준 문서: `~/.claude/convention/*.md`, `~/personal-llm/*.md`, `docs/HANDOFF.md`(세션 진입점), `docs/ARCHITECTURE.md`, `docs/acknowledge/README.md`, `docs/DESIGN.md`

## 완료 — 초기 구축 (2026-09-09, Phase 1~3)

- [x] 0. 분석·합의 — 원본 HTML·DESIGN.md·Calendar 레포 분석, 질문 11건 확정(ADR-0001~0006)
- [x] 1. 스캐폴딩 — bun, Next 16, Tailwind 4, shadcn 4 전 컴포넌트, git(dev/prod), 자동 커밋
- [x] 2. 기반 — DESIGN §16 토큰(globals.css, `.surface-public`), 프로바이더·루트 레이아웃, env, bun test
- [x] 3. DB — drizzle mysql `trip_` 스키마 21 테이블, 마이그레이션 0000·0001 적용
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

## 미착수 — 다음 세션

- [ ] QA 체크리스트 잔여: 공유 페이지 `/s/[slug]` 실측, 인쇄 미리보기, 모바일 시트, 편집기 저장·정렬 실측
- [ ] 로드맵 1~10(`docs/roadmap.md`) — 순서는 사용자가 정한다. 착수 전 ADR 추가

### 진행 메모

- Vercel: 브랜치 `prod`, 환경변수 `DATABASE_URL`·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`(+선택 `SEED_OWNER_EMAIL`). 락파일 v1(ADR-0013).
- 검증 계정(로컬 DB): tester@example.com / 사용자명 tester(예시 트립 1개 생성됨).
