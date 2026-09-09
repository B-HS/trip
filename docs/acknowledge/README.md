# acknowledge — 의사결정 기록 (ADR)

> 결정 1건 = 파일 1개. 배경 / 결정 / 이유 / 기각된 대안. 새 결정은 다음 번호로 추가한다.

- [ADR-0001 — 스택·도구 (2026-09-09)](0001-stack-and-tooling.md)
- [ADR-0002 — 데이터 모델은 전부 구조화 (2026-09-09)](0002-fully-structured-data-model.md)
- [ADR-0003 — 인증: 이메일·비밀번호 + 사용자명 (2026-09-09)](0003-auth-email-password-username.md)
- [ADR-0004 — 테이블·쿠키 프리픽스 (2026-09-09)](0004-table-and-cookie-prefix.md)
- [ADR-0005 — 공동편집자·공개 링크·사용자별 상태 (2026-09-09)](0005-sharing-collaborators-and-per-user-state.md)
- [ADR-0006 — 지도는 Google Maps 검색 링크만 (2026-09-09)](0006-map-links-only.md)
- [ADR-0007 — 모션은 항상 동작, OS reduce-motion 무시 (2026-09-09)](0007-motion-always-on.md)
- [ADR-0008 — 지구본은 실제 지리, 정보 있는 곳에만 (2026-09-09)](0008-globe-real-geography-only-where-meaningful.md)
- [ADR-0009 — 브랜치·자동 커밋 (2026-09-09)](0009-git-branches-and-auto-commit.md)
- [ADR-0010 — 초기 화면은 완성 HTML, cacheComponents 해제 (2026-09-09)](0010-server-rendering-without-skeleton.md)
- [ADR-0011 — 배경 계층·보더 없음·셀형 UI (2026-09-09)](0011-visual-tiers-without-borders.md)
- [ADR-0012 — shadcn 전 컴포넌트 우선 사용 (2026-09-09)](0012-shadcn-first.md)
- [ADR-0013 — Bun 락파일 v1, packageManager bun@1.3.14 (2026-09-09)](0013-bun-lockfile-v1-for-vercel.md)
- [ADR-0014 — 오사카 원본은 템플릿 상수 + 시드 + 앱 내 버튼 (2026-09-09)](0014-osaka-template-and-seed.md)
- [ADR-0015 — 날짜 탭 오버플로 UX (2026-09-09)](0015-day-picker-overflow-ux.md)
- [ADR-0016 — 목적지(나라) 지정·즐겨찾기 레일 (2026-09-09)](0016-destinations-and-favorites.md)

원 결정 로그(첫 질문 묶음 11건과 전제)는 이 ADR 들로 분리되었다. 요약: 데이터 전부 구조화(0002) · 자체 인증(0003) · `trip_` 프리픽스(0004) · 공동편집+공개 링크+사용자별 체크(0005) · 지도 링크만(0006) · 모션 항상(0007) · 지구본 실제 지리(0008) · prod/dev(0009) · 완성 HTML(0010) · 배경 계층·보더 없음(0011) · shadcn 우선(0012) · 락파일 v1(0013) · 템플릿·시드(0014) · 날짜 탭 UX(0015) · 목적지·즐겨찾기(0016).
