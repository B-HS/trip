# ADR-0001 — 스택·도구 (2026-09-09)

## 배경

`docs/osaka-trip-interactive.html`(정적 페이지)을 로그인 기반 다중 트립 앱으로 재구현. Vercel 배포, 도메인 trip.gumyo.net.

## 결정

bun · Next 16.3(App Router, React Compiler, typedRoutes) · Tailwind 4 · shadcn 4(radix-vega) · drizzle-orm 0.45 + mysql2 · better-auth 1.7 · TanStack Query 5 · zod 4 · react-hook-form 7 · motion 13 · three + R3F 9 + drei 10 · @dnd-kit · lucide · dayjs · sonner · next-themes. TypeScript 5.9 고정. 파비콘은 Calendar 레포(`app/favicon.ico`) 것을 그대로 사용.

## 이유

컨벤션 기본값(bun·FSD·React Compiler) + 참조 레포 B-HS/Calendar 와 동일 스택. TS 7.0 은 도구 호환이 미검증이라 5.9.

## 기각된 대안

- **Turso(libsql)**: 사용자가 MySQL 로 변경(`DATABASE_URL` 직접 제공, 스키마 `trip`).
- **pnpm**: Calendar 와 컨벤션이 bun.
- **GSAP 병용**: 이중 모션 시스템 부담. `motion` 단독.
- **Google Maps 임베드**: API 키 필요·원본 UX 유지 → "지도 열기" 검색 링크만(ADR-0006).
