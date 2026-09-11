# ADR-0038 — i18n 1차: next-intl 라우팅·카탈로그 키 체계·남은 범위 (2026-09-11)

## 배경

ADR-0033 이 i18n 을 ko 기본·ja·en 3언어로 못박았고, 리서치 메모(`docs/memory/research-2026-09-10-mail-i18n-auth.md`)가 next-intl 4.x 의 Next 16 `proxy.ts` 합성 골격을 확보했다. 4-5(ADR-0037) 완료 후 5단계를 착수하되, 세션 컨텍스트 한계로 **전면 완료 대신 견고한 골격 + 4개 도메인 완료 + 혼입 제로**로 1차 마감한다. 남은 도메인은 2차로 이어서 완성하는 것을 전제로 한다.

## 결정

### 1. next-intl 4.x + `localePrefix: 'as-needed'`

- `i18n/routing.ts` 의 `defineRouting` 으로 locales `['ko','ja','en']`, defaultLocale `ko`, localePrefix `as-needed` 를 정의한다. ko 는 프리픽스 없음(기존 URL 무변경), en·ja 는 `/en`·`/ja` 프리픽스.
- 라우트는 `app/[locale]/` 아래로 이동한다. ko 요청은 미들웨어가 프리픽스 없이 `[locale]=ko` 로 매칭하므로 기존 경로가 그대로 살아 있다. `layout.tsx` 는 `[locale]` 안에 두고 `<html lang={locale}>`·`setRequestLocale`·`generateStaticParams` 를 갖춘다.

### 2. proxy.ts 합성 순서

기존 `proxy.ts`(인증 게이팅) 안에 `createMiddleware(routing)` 을 합성한다. 순서가 semantics 를 결정한다.

1. `handleI18nRouting(request)` 를 먼저 실행한다.
2. 그 응답이 리다이렉트(쿠키 기반 `/` → `/en` 협상 등)면 **그대로 통과**시킨다 — 인증 체크를 건너뛰고 다음 요청에서 평가하게 한다.
3. 통과가 아니면 pathname 에서 프리픽스를 제거한 논리 경로로 PROTECTED/GUEST_ONLY 를 판정한다. 로그인 리다이렉트의 `next` 파라미터에는 **프리픽스를 보존**한 경로(`/en/trips`)를 실어, 로그인 후 같은 언어로 복귀하게 한다.
4. matcher 는 next-intl 표준 `['/((?!api|_next|_vercel|.*\\..*).*)']` 로 넓힌다. 인증 로직은 판정되는 경로에서만 작동하므로 기존 semantics 와 동일하다.

### 3. 네비게이션 스윕과 typed routes 해제

- 내부 링크·`useRouter`·`usePathname` 은 `@/i18n/navigation`(createNavigation)로 일원화한다. `usePathname` 은 프리픽스가 제거된 논리 경로를 반환하므로 기존 active-판정 로직(`isNavItemActive` 등)이 무변경으로 동작한다.
- `typedRoutes` 가 생성한 Route union 은 `[locale]` 재구조화 이후 `/[locale]/...` 만 포함하게 되어, 프리픽스 없는 문자열(`'/'`)과 충돌한다. 내부 내비게이션이 next-intl Href(string)로 전환된 이상 `Route`/`Route<T>` 타입 결합은 의미가 사라졌으므로 **plain string 으로 해제**한다(nav-item·post-form·search-form·section-heading·pagination-cells·login-widget·like-cell).

### 4. 메시지 키 체계 (혼입 제로의 구조적 장치)

- 카탈로그: `messages/{ko,en,ja}.json`, 네임스페이스는 `common`·`auth`·`community`·`profile`·`metadata`(+ `community.toast`·`profile.toast`).
- 서버·데이터 계층은 번역된 텍스트가 아니라 **안정 키**를 emitting 한다: zod 스키마 메시지는 `validation.*`, ApiError·repository 메시지는 `error.*`, 인증 에러 맵은 `auth.errors.<CODE>`, entities mutation 토스트는 `community.toast.*`·`profile.toast.*`.
- 표시 지점에서 `shared/lib/message-key.ts` 의 `translateMessage(t, message)` 가 키 접두부를 감지해 번역하고, 원문이 키가 아니면 그대로 통과시킨다. `shared/ui/field.tsx`(FieldError)·토스트 호출부가 이 헬퍼를 쓴다. 이렇게 하면 데이터 계층을 건드리지 않고도 EN·JA 화면에 한국어가 새지 않는다.
- 숫자 보정이 있는 검증 문구는 카탈로그에 값을 박는다(예: `validation.titleTooLong` = "제목은 120자 이하로 입력해 주세요."). 상수 변경 시 카탈로그도 함께 갱신하는 유지 부담을 수용한다.

### 5. 언어 전환기

`widgets/app-shell/locale-switcher.tsx` — public header 에 ko·english·日本語 드롭다운(기존 게시판 메뉴 패턴 재사용). next-intl 공식 패턴대로 `router.replace(pathname, { locale })` 가 `NEXT_LOCALE` 쿠키를 설정·유지한다.

### 6. 완료 범위와 GAP (2차 과제)

- **완료**: app 페이지 metadata·copy, app-shell 내비·푸터·전환기, community 전역(게시판·글·댓글·신고·차단·admin), profile(헤더·탭·설정·닉네임·이미지), auth 폼·위젯, entities 메시지 키화, `ja` 카탈로그 한국어 혼입 교정, 테스트 목(`tests/setup.ts` next-intl/i18n 모킹) 정비.
- **GAP(2차)**: trip 도메인(trip-editor·trip-viewer·trips·editor 상수)과 `marketing.ts`·`shared/constant/trip.ts`·`community.ts` 의 EMPTY_* 라벨은 아직 한국어 하드코딩 — `trip.toast.*` 등 키 접두부는 레지스트리에 예약돼 있다. dayjs per-request 로케일(서버측 포맷) 미작: 현재 `import 'dayjs/locale/ko'` 하드코딩 3곳(`trip-viewer-format`·`day-picker`·`trip-date-range`). `osaka.ts`·`countries.ts`·`airports.ts` 는 콘텐츠 데이터로 한국어 유지(번역 대상 아님).

## 각된 대안

- **쿠키·헤더 기반 로케일(URL 무변경)**: SEO canonical·공유 링크의 언어 보존이 약해 기각(사용자 결정).
- **`next/link` 유지 + 미들웨어 리다이렉트에 의존**: 동작은 하나 이동마다 307 왕복과 typedRoutes 충돌이 남아 기각.
- **zod 스키마에 locale별 messages 주입**: 스키마가 locale 마다 분기되어 원본 유지 부담이 커지므로 errorMap+키 방식으로 대체.
- **Trip 도메인까지 단일 세션 완수**: 컨텍스트 한계로 중간 파괴 이력이 3회 반복된 실측 교훈 — 도메인 경계 커밋 + 2차 분할이 안전하다.
