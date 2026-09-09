# ADR-0004 — 테이블·쿠키 프리픽스 (2026-09-09)

## 결정

모든 테이블은 `trip_`(`shared/db/table.ts` `mysqlTableCreator`), better-auth 테이블 포함(`trip_user` 등). 세션 쿠키는 `advanced.cookiePrefix: 'trip'` → `trip.session_token`. 마이그레이션 이력 테이블 `trip___drizzle_migrations`.

## 이유

같은 DB·도메인의 다른 프로젝트와 테이블·쿠키 충돌 방지(사용자 요구).

## 기각된 대안

프리픽스 없이 스키마 분리: 사용자가 프리픽스를 명시 요구.
