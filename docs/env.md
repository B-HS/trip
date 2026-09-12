# ENV — 환경변수 목록과 발급 방법

> 정본은 `shared/lib/env.ts`(런타임 검증 스키마)와 `next.config.ts`(빌드 타임 사용)다. 이 문서는 그 키 목록에 **어디서 발급받아 어디에 넣는지**를 더한 안내다.
> **값은 이 문서에 적지 않는다.** 시크릿은 로컬 `.env` 와 Vercel 환경변수에만 존재한다(`~/.claude/convention/security.md` §1). AI 는 `.env*` 를 읽지도 쓰지도 못한다.

## 1. 전체 키

| 키                                          | 필수           | 용도                                                                               | 발급·생성 방법                                                                 | 로컬 `.env` | Vercel Production | 빌드 타임 |
| ------------------------------------------- | -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ----------------- | --------- |
| `DATABASE_URL`                              | 필수           | MySQL 접속 문자열. drizzle 클라이언트·마이그레이션·시드가 쓴다                     | DB 제공자의 접속 정보로 조립: `mysql://user:password@host:3306/database`       | O           | O                 | △         |
| `BETTER_AUTH_SECRET`                        | 필수           | better-auth 세션·토큰 서명 키                                                      | `openssl rand -base64 32`                                                      | O           | O                 | X         |
| `BETTER_AUTH_URL`                           | 필수           | 인증 서버의 기준 URL(`baseURL`). 소셜 콜백 주소의 기준이 된다                      | 로컬은 `http://localhost:7777`, 배포는 `https://trip.gumyo.net`                | O           | O                 | X         |
| `NEXT_PUBLIC_APP_URL`                       | 필수           | 브라우저 authClient 의 `baseURL`. `NEXT_PUBLIC_` 이라 클라이언트 번들에 인라인된다 | `BETTER_AUTH_URL` 과 **같은 오리진**으로 맞춘다                                | O           | O                 | **O**     |
| `SEED_OWNER_EMAIL`                          | 선택           | `bun run db:seed` 가 오사카 예시 트립을 붙일 계정 이메일                           | 이미 가입된 계정의 이메일. 비워 두면 `db:seed` 가 안내만 하고 끝난다           | O           | 불필요            | X         |
| `R2_ACCOUNT_ID`                             | 선택(5개 묶음) | R2 S3 엔드포인트 계정 ID                                                           | Cloudflare 대시보드 → R2 개요 우측의 계정 ID                                   | O           | O                 | X         |
| `R2_ACCESS_KEY_ID`                          | 선택(5개 묶음) | R2 API 토큰의 Access Key ID                                                        | Cloudflare → R2 → **Manage R2 API Tokens** → Object Read & Write 토큰 발급     | O           | O                 | X         |
| `R2_SECRET_ACCESS_KEY`                      | 선택(5개 묶음) | 위 토큰의 Secret Access Key                                                        | 같은 화면에서 발급 시 **한 번만** 표시된다                                     | O           | O                 | X         |
| `R2_BUCKET`                                 | 선택(5개 묶음) | 업로드 대상 버킷 이름                                                              | Cloudflare → R2 → 버킷 생성 시 정한 이름                                       | O           | O                 | X         |
| `R2_PUBLIC_BASE_URL`                        | 선택(5개 묶음) | 업로드 결과를 읽는 공개 URL. `next/image` 원격 패턴이 여기서 만들어진다            | 버킷에 **커스텀 도메인**을 연결해 그 주소를 쓴다(`r2.dev` 는 개발용, ADR-0026) | O           | O                 | **O**     |
| `APP_ENCRYPTION_KEY`                        | 선택(7단계)    | AI 프로바이더 키를 AES-256-GCM 으로 암호화·복호화                                  | `openssl rand -base64 32`(base64 32바이트)                                     | O           | O                 | X         |
| `VERCEL_QUEUE_REGION`                       | 선택(7단계)    | Vercel Queues SDK/REST 지역                                                        | Vercel Queues 프로젝트 지역(예: `iad1`)                                        | O           | O                 | X         |
| `VERCEL_QUEUE_TOKEN`                        | 선택(7단계)    | SDK가 없는 로컬·REST queue publish bearer 토큰                                     | Vercel OIDC/Queues 설정에서 발급한 토큰                                        | O           | O                 | X         |
| `VERCEL_QUEUE_URL`                          | 선택(7단계)    | `@vercel/queue` SDK가 없는 로컬·REST fallback endpoint                             | region-specific `https://<region>.vercel-queue.com`                            | O           | O                 | X         |
| `AI_PROVIDER_MOCK`                          | 테스트 전용    | provider 네트워크 호출을 하지 않는 결정적 fake 응답                                | 테스트 실행 시에만 `1`; 운영에는 설정하지 않음                                 | O           | X                 | X         |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | 선택(6단계)    | GitHub 소셜 로그인. 두 값을 모두 넣을 때만 로그인 화면에 표시                      | GitHub Settings → Developer settings → OAuth Apps                              | O           | O                 | X         |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET`   | 선택(6단계)    | 네이버 소셜 로그인. 두 값을 모두 넣을 때만 로그인 화면에 표시                      | 네이버 개발자센터 → 애플리케이션 등록                                          | O           | O                 | X         |
| `EMAIL_WORKER_URL`                          | 선택(6단계)    | 인증 메일을 전달할 Cloudflare Worker HTTPS URL                                     | `cloudflare/mail-worker` 배포 URL                                              | O           | O                 | X         |
| `EMAIL_WORKER_TOKEN`                        | 선택(6단계)    | Worker `SEND_SECRET`과 같은 Bearer 토큰                                            | Worker secret으로 생성한 난수                                                  | O           | O                 | X         |
| `EMAIL_FROM`                                | 선택(6단계)    | 인증 메일 발신 주소. Worker 설정의 `EMAIL_FROM`과 같아야 한다                      | Cloudflare Email Service에 온보딩한 `trip.gumyo.net` 주소                      | O           | O                 | X         |
| `NODE_ENV`                                  | 자동           | 실행 모드. `env.ts` 가 기본값 `development` 로 검증만 한다                         | **직접 넣지 않는다.** Next 가 `dev`/`build` 에 맞춰 설정한다                   | X           | X                 | X         |

- 빌드 타임 **O**: `next build` 가 값을 읽어 결과물에 고정한다. 값을 바꾸면 **재배포(재빌드)** 해야 반영된다.
- 빌드 타임 **△**: 빌드 중 정적 생성이 DB 에 닿으면 필요하다. Vercel 은 빌드에도 환경변수를 주입하므로 실무상 항상 설정해 둔다.
- R2 5개는 **하나라도 비면 업로드가 통째로 비활성화**된다(`shared/lib/r2.ts`). 링크 첨부는 R2 없이도 동작한다.

## 2. `.env.example` 에 넣을 블록

`.env.example` 은 AI 의 도구 권한으로 읽기·쓰기가 모두 차단돼 있다(ADR-0026 구현 메모에도 같은 제약이 기록돼 있다). 아래 블록은 필수·선택 키를 모두 포함하므로 필요하면 `.env.example` 전체를 대체한다. 값이 아니라 키 이름과 설명만 담겨 있다.

```dotenv
# 필수 — MySQL 접속 문자열. 예: mysql://user:password@host:3306/trip
DATABASE_URL=
# 필수 — better-auth 세션 서명 키. `openssl rand -base64 32`
BETTER_AUTH_SECRET=
# 필수 — 인증 기준 URL. 로컬 dev 서버는 7777 포트를 쓴다
BETTER_AUTH_URL=http://localhost:7777
# 필수 — 브라우저에 노출되는 앱 URL. BETTER_AUTH_URL 과 같은 오리진으로 맞춘다
NEXT_PUBLIC_APP_URL=http://localhost:7777
# 선택 — `bun run db:seed` 가 오사카 예시 트립을 붙일 소유자 이메일
SEED_OWNER_EMAIL=

# 선택 — Cloudflare R2. 아래 5개를 모두 채워야 이미지 업로드가 열린다
# R2 개요 화면의 계정 ID
R2_ACCOUNT_ID=
# R2 API 토큰의 Access Key ID
R2_ACCESS_KEY_ID=
# R2 API 토큰의 Secret Access Key
R2_SECRET_ACCESS_KEY=
# 업로드 대상 버킷 이름
R2_BUCKET=
# 버킷 공개 URL(커스텀 도메인). next/image 원격 패턴이라 빌드 타임에도 필요하다
R2_PUBLIC_BASE_URL=

# 선택 — AI 키 암호화용 base64 32바이트. `openssl rand -base64 32`
# 7단계(AI) 전까지는 쓰이지 않는다
APP_ENCRYPTION_KEY=

# 선택 — Vercel Queues REST fallback credentials. Queue callbacks are authenticated by the Vercel Queues SDK handler/OIDC boundary, not this publish token.
VERCEL_QUEUE_REGION=
VERCEL_QUEUE_TOKEN=
VERCEL_QUEUE_URL=
AI_PROVIDER_MOCK=

# 선택 — OAuth. ID와 secret을 모두 채운 provider만 로그인 화면에 표시된다
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# 선택 — Cloudflare Email Worker. 세 값을 모두 채우면 이메일 인증이 활성화된다
EMAIL_WORKER_URL=
EMAIL_WORKER_TOKEN=
EMAIL_FROM=
```

## 3. 지금 사용자가 채워야 할 것

문서 기준으로 아직 비어 있는 키다(`docs/PROCESS.md` "사용자 작업").

### R2 5개 — `R2_ACCOUNT_ID` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` · `R2_BUCKET` · `R2_PUBLIC_BASE_URL`

1. Cloudflare 대시보드 → R2 → 버킷을 만든다(이름이 `R2_BUCKET`).
2. R2 개요 화면의 계정 ID 를 `R2_ACCOUNT_ID` 에 넣는다.
3. **Manage R2 API Tokens** 에서 해당 버킷에 Object Read & Write 권한 토큰을 발급해 Access Key ID / Secret Access Key 를 받는다. Secret 은 발급 시 한 번만 보인다.
4. 버킷 설정에서 **커스텀 도메인**을 연결하고 그 주소(`https://...`)를 `R2_PUBLIC_BASE_URL` 에 넣는다.
5. 로컬 `.env` 와 Vercel Production 양쪽에 같은 값을 넣는다. `R2_PUBLIC_BASE_URL` 은 빌드 타임 값이라 **추가 후 재배포**해야 이미지가 표시된다.
6. 확인: 업로드 UI 의 "저장소 설정 전" 안내가 사라지고 이미지 업로드가 열린다.

### `APP_ENCRYPTION_KEY`

- `openssl rand -base64 32` 로 만들어 로컬 `.env` 와 Vercel Production 에 **같은 값**으로 넣는다(ADR-0029).
- 7단계(AI) 구현 전까지는 없어도 앱이 동작한다. 키가 없으면 AI 키 등록 화면이 비활성화된다.
- 값을 바꾸면 이미 저장된 AI 키를 복호화할 수 없다. 교체 시 저장된 키를 다시 등록해야 한다.

## 4. 6단계 인증 확장 설정

| 단계              | 키                                                       | 발급처                                              | 비고                                                                            |
| ----------------- | -------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| 6단계 인증 확장   | `GITHUB_CLIENT_ID` · `GITHUB_CLIENT_SECRET`              | GitHub → Settings → Developer settings → OAuth Apps | 콜백 URL 은 `{BETTER_AUTH_URL}/api/auth/callback/github`                        |
| 6단계 인증 확장   | `NAVER_CLIENT_ID` · `NAVER_CLIENT_SECRET`                | 네이버 개발자센터 → 애플리케이션 등록               | 콜백 URL 은 `{BETTER_AUTH_URL}/api/auth/callback/naver`(better-auth 1.7.3 기준) |
| 6단계 이메일 인증 | `EMAIL_WORKER_URL` · `EMAIL_WORKER_TOKEN` · `EMAIL_FROM` | Cloudflare Workers(Email Service, Workers Paid)     | Worker `SEND_SECRET`과 `EMAIL_FROM`을 각각 같은 값으로 맞춘다                   |
| 7단계 AI          | `APP_ENCRYPTION_KEY`                                     | 직접 생성                                           | 위 3절 참고                                                                     |

출처: ADR-0033 §2, `docs/memory/research-2026-09-10-mail-i18n-auth.md`. 리서치 메모의 `[미확인]` 항목(임의 수신자 발송 가능 여부 등)은 착수 시 실제 발송으로 검증한다.

## 5. 로컬 dev 서버는 7777 포트

- trip 의 dev 서버는 **`bun run dev -p 7777`** 이다. `:3000` 은 다른 프로젝트가 쓴다(세션 4 결정).
- 그래서 로컬 `.env` 의 `BETTER_AUTH_URL` 과 `NEXT_PUBLIC_APP_URL` 이 **둘 다 `http://localhost:7777`** 을 가리켜야 한다. 포트가 어긋나면 로그인·로그아웃과 공개 헤더의 `useSession` 이 조용히 실패한다.
- 비로그인 화면을 볼 때는 쿠키를 분리하려고 `http://[::1]:7777` 을 쓴다(`next.config.ts` 의 `allowedDevOrigins`).

## 6. 취급 규칙

- 값(시크릿)은 코드·문서·커밋·로그·AI 대화 어디에도 남기지 않는다. 새 키가 필요하면 **이름만** 이 문서와 `.env.example` 에 추가한다.
- `.env*` 는 `.gitignore` 대상이고 `.env.example` 만 예외로 커밋한다.
- 실수로 노출된 값은 즉시 폐기(rotate)한다.
- `NEXT_PUBLIC_APP_URL` · `R2_PUBLIC_BASE_URL` 은 빌드 결과에 박히므로, 바꾼 뒤에는 재배포해야 반영된다. 나머지는 재시작으로 충분하다.
