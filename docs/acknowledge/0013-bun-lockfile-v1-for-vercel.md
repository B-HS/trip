# ADR-0013 — Bun 락파일 v1, packageManager bun@1.3.14 (2026-09-09)

## 배경

Vercel 빌드 이미지의 Bun 1.3.14 가 Bun 1.4 산출 `lockfileVersion: 2` 를 못 읽어 "Unknown lockfile version" 실패.

## 결정

`npx bun@1.3.14 install --lockfile-only` 로 v1 락파일 재생성, `packageManager: "bun@1.3.14"`. 로컬 Bun 1.4 는 v1 을 재작성 없이 읽는다(`--frozen-lockfile` 통과). 다시 v2 로 바뀌면 같은 명령으로 되돌린다.

## 기각된 대안

- Vercel Bun 버전 상향 설정: 문서상 확실한 옵션을 찾지 못함(`bunVersion` 은 런타임용).
