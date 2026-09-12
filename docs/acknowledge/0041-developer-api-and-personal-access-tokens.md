# ADR-0041 — Versioned developer API and personal access tokens (2026-09-12)

## 배경

자동화와 AI 에이전트가 사용자의 여행 데이터를 읽고, 사용자의 명시적인 승인 아래 구조화된 트립을 생성·교체할 수 있는 공개 API가 필요하다. 세션 쿠키를 외부 클라이언트에 재사용하거나 공개 공유 링크로 쓰기에는 소유권·범위·회수·감사 경계가 부족하다.

## 결정

- 공개 표면은 `/api/v1`로 명시적으로 버전 관리한다. `/api/v1/openapi.json`은 OpenAPI 3.1 JSON 정본이다.
- API는 `trip_pat_` 접두어를 가진 256-bit 난수 bearer 토큰을 사용한다. 원문은 발급 응답에서 한 번만 반환하고 DB에는 SHA-256 digest와 prefix/last4 메타데이터만 저장한다. Authorization 헤더 외 위치(쿼리·경로·로그)는 허용하지 않는다.
- 토큰은 사용자 소유이며 `trips:read`, `trips:write`, `token:inspect` 범위를 가진다. 모든 트립 API는 토큰 주체의 **소유 트립만** 반환·변경하며 멤버 권한을 우회하지 않는다. 모든 쓰기는 기존 `tripTemplateSchema`, `createTrip*`, `replaceTripFromTemplate`, `deleteTrip` 도메인 서비스를 사용한다.
- 목록은 `page`/`page_size`(최대 100) 오프셋 페이지네이션과 `items`, `page`, `pageSize`, `total`, `pageCount`를 사용한다. 오류는 기존 `success:false` 계약과 안정적인 코드로 반환한다.
- JSON body는 1 MiB로 제한하며, `Content-Length`가 없거나 chunked인 요청도 스트림을 읽는 동안 같은 상한을 적용한다. 초과 시 413을 반환하고 body 전체를 먼저 버퍼링하지 않는다.
- 생성·교체·삭제에는 `Idempotency-Key`가 필요하다. 토큰·키 복합 primary key와 request hash/status/claim nonce/응답·응답 헤더를 0012에 저장해 멀티 인스턴스에서도 원자적으로 claim한다. 완료·해제는 현재 claim nonce까지 일치해야 하며, processing lease는 10분이 지나면 회수할 수 있다. abandoned processing 행은 20분 후 정리하고, completed replay 행은 30일 동안 재생할 수 있도록 보존한다.
- 토큰별 고정 윈도우 rate limit(읽기 60회/분, 쓰기 20회/분)을 0012 DB 행 잠금/트랜잭션으로 원자적으로 적용하고 `X-RateLimit-*` 헤더와 429를 반환한다. 이는 기본 애플리케이션 경계이며 운영 edge/WAF 한도를 대체하지 않는다.
- `/settings/api`에서 토큰을 생성·목록·폐기한다. 기본 만료는 관리 UI가 선택하도록 두고, 운영 권장값은 365일 이내다.
- 트립 교체·삭제가 제거한 첨부 업로드는 다른 booking/profile에서 참조되지 않을 때만 private R2와 DB에서 정리한다. 커밋 후 정리 실패나 중단은 보호된 cron이 24시간 이상 된 orphan upload 행을 재시도하며, 다른 곳에서 참조되는 업로드는 보존한다.

## 이유와 보안 근거

Next.js 16은 Route Handler의 `params`를 비동기 API로만 제공하므로 모든 동적 API 라우트는 `await context.params`를 사용한다. OpenAPI 3.1의 HTTP bearer security scheme으로 자동화 클라이언트의 발견 가능성을 유지한다. OWASP는 bearer 토큰의 TLS 전송·안전한 저장, 공개 API의 per-key quota, 슬라이딩 윈도우를 권고한다. 해시만 저장하면 DB 유출 시 원문을 바로 재사용할 수 없고, 256-bit 난수는 추측 공격에 충분한 여유를 준다. `timingSafeEqual`은 검증 비교에 사용하며 길이가 다른 입력은 먼저 거부한다.

공식 근거: [Next.js 16 async Request APIs](https://nextjs.org/docs/app/guides/upgrading/version-16), [OpenAPI Specification](https://spec.openapis.org/oas/latest.html), [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP Bot Management / Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html).

## 기각한 대안

- 세션 쿠키를 API 인증으로 재사용: 브라우저 CSRF·수명·회수 모델이 외부 자동화에 부적합하다.
- JWT: 즉시 폐기와 토큰 목록 UI가 필요하고 서명 키·claim 검증 복잡도가 늘어난다. opaque hash token으로 시작한다.
- 쿼리 파라미터 토큰: 프록시·브라우저 기록·Referer로 유출될 수 있으므로 금지한다.
- 외부 Redis rate limit: 별도 운영 의존성을 추가하는 대신 0012의 동일 MySQL 트랜잭션 경계를 사용한다.

## 통합 메모

0011/0012는 현재 운영 DB에 아직 적용하지 않은 release precondition이다. 운영자는 스냅샷·journal 순서를 확인한 뒤 0010 → 0011 → 0012 순서로 한 번만 적용한다.

`0010_trip-consent.sql`과 Phase 7 AI migration `0011_ai.sql` 다음으로 이 마이그레이션은 `0012`로 provision한다. 통합자는 스냅샷·journal 순서를 확인한 뒤 한 번만 생성·적용한다. idempotency/rate-limit은 0012의 durable DB 행과 트랜잭션을 사용하므로 별도 프로세스 캐시 승격이 필요하지 않다.
