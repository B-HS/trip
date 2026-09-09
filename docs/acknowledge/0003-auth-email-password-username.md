# ADR-0003 — 인증: 이메일·비밀번호 + 사용자명 (2026-09-09)

## 배경

처음엔 Calendar 와 같은 GitHub/Google OAuth 를 제안했으나 사용자가 자체 회원가입으로 변경.

## 결정

better-auth `emailAndPassword` + `username` 플러그인(`^[a-z0-9_.]+$`, 3~30자). 이메일 인증 없음. 초대 이메일과 일치하는 가입자는 `databaseHooks.user.create.after` 에서 자동 멤버 등록(`shared/db/accept-invites.ts` — auth 가 entities 를 역참조하지 않도록 shared 로 둠). `name` 은 better-auth 필수 컬럼이라 폼에서 받았으나, ADR-0017(2026-09-09 세션 2)에서 폼 입력을 없애고 사용자명을 저장하는 것으로 바꿨다.

## 이유

사용자 지시("OAuth 로그인 없어도 괜찮아, id/pw + username").

## 기각된 대안

- GitHub·Google OAuth: 로드맵 7 에서 Naver·GitHub 로 재도입 예정.
- 사용자명에 `-` 허용: better-auth 기본 validator 가 거부해 패턴에서 제외.
- 폼의 "이름" 입력: ADR-0017 에서 제거(사용자명을 name 에 저장).
