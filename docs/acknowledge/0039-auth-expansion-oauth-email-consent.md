# ADR-0039 — 인증 확장: 조건부 OAuth·Email Worker·법적 동의 (2026-09-12)

## 배경

6단계 요구사항은 GitHub·Naver OAuth, 이메일 주소 인증, 가입 시 약관·개인정보 동의를 포함한다. OAuth client secret과 Cloudflare Email Service 설정은 배포 환경마다 다르고, 아직 키가 없는 개발 환경에서도 이메일 로그인과 기존 화면은 동작해야 한다.

## 결정

- `shared/lib/auth-capabilities.ts`가 환경변수의 완전한 쌍을 확인한다. GitHub·Naver는 ID와 secret이 모두 있을 때만 better-auth `socialProviders`와 로그인 버튼을 활성화한다. 설정되지 않은 provider는 관리자 설정 안내만 표시한다.
- 이메일 인증은 `EMAIL_WORKER_URL`, `EMAIL_WORKER_TOKEN`, `EMAIL_FROM`이 모두 있을 때만 required로 켠다. Next.js는 bearer 토큰으로 Cloudflare Worker를 호출하고, Worker는 `SEND_SECRET`, 발신 주소, `SEND_EMAIL` 바인딩을 검증한다. 세 값이 없으면 인증 메일을 요구하지 않는다.
- 가입은 `/api/auth/sign-up`에서 현재 문서 버전을 먼저 검증한 뒤 better-auth 가입을 수행하고, `trip_user_consent`에 terms/privacy 동의를 기록한다. 문서 버전은 `shared/constant/legal.ts`의 상수로 관리한다.
- 약관·개인정보 페이지와 가입 체크박스는 ko·en·ja 메시지를 사용한다. 법적 원문은 `docs/legal/`에 초안으로 보관하며 배포 전 법률 검토를 거친다.

## 이유

기능별 설정을 capability로 분리하면 secret이 없는 로컬·preview에서도 깨진 OAuth 콜백이나 인증 메일 실패를 만들지 않는다. 동의 버전을 저장하면 향후 문서 개정 시 재동의 대상과 시점을 판별할 수 있다.

## 기각된 대안

- 키가 없어도 빈 OAuth provider를 등록하는 방식은 런타임 콜백 오류와 오해를 만들므로 기각했다.
- Vercel에서 직접 SMTP를 구성하는 방식은 현재 인프라 결정(Cloudflare Email Service)과 맞지 않아 기각했다.
- 동의를 쿠키나 사용자 JSON에만 저장하는 방식은 서버 감사와 버전별 재동의를 지원하지 못해 기각했다.
