# Trip Developer API

Trip API는 외부 자동화와 AI 에이전트가 사용자의 **소유 트립**을 안전하게 읽고, 명시적으로 승인된 쓰기를 수행하도록 만든 버전 API다.

## 시작하기

1. 로그인한 뒤 `/settings/api`에서 라벨과 최소 권한으로 토큰을 발급한다.
2. 원문 토큰을 비밀번호 관리자나 서버 전용 secret store에 즉시 저장한다. 다시 표시되지 않는다.
3. `Authorization: Bearer trip_pat_...` 헤더를 사용한다. URL query, path, cookie, 로그에는 토큰을 넣지 않는다.
4. [OpenAPI JSON](/api/v1/openapi.json)을 도구에 등록한다.

```bash
curl https://trip.gumyo.net/api/v1/token \
  -H 'Authorization: Bearer trip_pat_REDACTED'
```

## 권한

| Scope           | 의미                                         |
| --------------- | -------------------------------------------- |
| `trips:read`    | 소유 트립 목록·상세 조회                     |
| `trips:write`   | 소유 트립 생성·전체 교체·삭제                |
| `token:inspect` | 현재 토큰의 label·scope·만료·capability 확인 |

처음부터 모든 권한을 주지 말고, 읽기 전용 자동화에는 `trips:read`만 발급한다.

## 엔드포인트

- `GET /api/v1/token` — token introspection/capabilities.
- `GET /api/v1/trips?page=1&page_size=20` — 소유 트립 목록.
- `GET /api/v1/trips/{tripId}` — 소유 트립 상세.
- `POST /api/v1/trips` — 검증된 템플릿으로 생성.
- `PUT /api/v1/trips/{tripId}` — 검증된 템플릿으로 전체 교체.
- `DELETE /api/v1/trips/{tripId}` — 소유 트립 삭제.

쓰기는 매번 고유하고 재시도에 안전한 `Idempotency-Key`를 보낸다.

```bash
curl -X POST https://trip.gumyo.net/api/v1/trips \
  -H 'Authorization: Bearer trip_pat_REDACTED' \
  -H 'Content-Type: application/json' \
  -H 'Idempotency-Key: create-osaka-2026-09-12-v1' \
  -d '{"title":"Osaka","destination":"Osaka","startDate":"2026-10-01","endDate":"2026-10-05","destinations":[{"countryCode":"JP","city":"Osaka"}]}'
```

## 계약과 오류

성공은 `{ "success": true, "data": ... }`, 오류는 `{ "success": false, "error": { "code", "message" } }`다. 주요 코드: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `RATE_LIMITED`.

목록 응답은 `items`, `page`, `pageSize`, `total`, `pageCount`를 항상 포함한다. `page_size`는 1~100이다. 429 응답에는 `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` 헤더가 있다. 현재 기본 한도는 토큰당 읽기 60회/분, 쓰기 20회/분이다.

## AI 에이전트 가이드

- 먼저 OpenAPI를 읽고 `token:inspect`와 `trips:read`로 capability를 확인한다.
- 계획 단계에서 읽기 요청을 먼저 수행하고, 삭제·전체 교체처럼 되돌리기 어려운 작업은 변경 요약과 대상 ID를 사용자에게 보여준 뒤 확인받는다.
- JSON을 문자열 추출으로 해석하지 말고 schema와 `success`/`error.code`를 검증한다. 알 수 없는 필드는 보존하지 않고, `PUT` 전에 현재 템플릿을 읽어 명시적으로 수정한다.
- 429/5xx는 `Retry-After` 또는 지수 백오프로 재시도한다. 같은 쓰기 재시도에는 같은 `Idempotency-Key`, 다른 요청에는 새 키를 사용한다.
- 토큰을 프롬프트, 대화, 로그, URL, 브라우저 localStorage에 복사하지 않는다. 필요 최소 scope와 짧은 expiry를 사용하고 작업이 끝나면 폐기한다.
