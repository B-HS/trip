# ADR-0017 — 회원가입 폼에서 "이름" 제거, `name` 에는 사용자명 저장 (2026-09-09)

## 배경

better-auth 의 `user.name` 이 non-null 필수 컬럼이라 회원가입 폼에 "이름" 입력을 두었다(ADR-0003). 사용자는 가입 입력을 **사용자명·이메일·비밀번호** 만으로 줄이라고 지시했고, 로드맵 7 의 이 항목을 세션 2 의 첫 로드맵 작업으로 골랐다.

## 결정

- `entities/auth/auth.validate.ts` 의 `signupSchema` 에서 `name` 을 제거한다. 입력은 `username`·`email`·`password`·`passwordConfirm` 이다.
- `widgets/auth/signup-widget.tsx` 는 `signUp.email({ name: values.username, username: values.username, displayUsername: values.username, email, password })` 로 호출해 `name` 컬럼에 사용자명을 그대로 저장한다.
- `features/auth/signup-form.tsx` 에서 이름 필드를 지우고, 더 쓰지 않는 `NAME_MAX_LENGTH` 상수(`shared/constant/auth.ts`)와 테스트의 `name` 값을 함께 정리한다.
- 표시 이름 변경은 이후 프로필 편집(로드맵 6 사용자 페이지·로드맵 7)에서 다룬다. 기존 가입자의 `name` 은 손대지 않는다.

## 이유

사용자 지시. 현재 `name` 은 셸의 사용자 메뉴 표시에만 쓰이므로 사용자명으로 충분하고, better-auth 스키마 계약(`name` 필수)은 그대로 지킨다.

## 기각된 대안

- 이름을 선택 입력으로 남기기: 사용자가 제거를 명시했다.
- `trip_user.name` 을 nullable 로 바꾸기: better-auth 코어 스키마 계약 위반.
- 이메일 로컬파트를 `name` 으로 쓰기: 사용자명보다 예측하기 어렵고 중복 가능.

## 검증

`tests/entities/auth/auth.validate.test.ts`(name 없이 통과, name 이 있어도 무시), `bun run typecheck`·`lint`·`test`, 브라우저 `/signup` 라이트·다크 렌더, API 로 가입한 계정의 `name` 이 사용자명과 같은지 확인.
