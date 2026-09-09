# ADR-0018 — RHF `register` 컴포넌트는 React Compiler 에서 제외 (2026-09-09)

## 배경

QA 실측(세션 2)에서 편집기 폼이 **첫 저장 이후의 편집을 서버로 보내지 않는** 버그가 나왔다. 두 번째 편집값은 입력창에 보이지만 서버 액션 본문에는 직전 값이 실렸고, 빈 필수값도 검증 없이 저장됐다.

원인은 react-hook-form 7.87 의 `reset()` 이 `keepFieldsRef` 없이는 `_fields = {}` 로 필드 등록을 비우고, 다음 렌더에서 `register()` 가 다시 호출되어 ref 가 재부착되는 것에 의존한다는 점이다. React Compiler 는 `form.register('title')` 처럼 인자가 상수인 호출을 메모이즈해 재호출하지 않는다. 그 결과 `_names.mount` 에 최상위 필드가 빠지고 `onChange` 가 `_formValues` 를 갱신하지 못한다. dev 에서는 StrictMode 의 이중 마운트가 첫 편집을 가려 주고, 저장 뒤 `form.reset(values)` 부터 드러난다. `useFieldArray` 행은 배열이 바뀔 때 `.map()` 이 다시 계산되어 재등록되므로 증상이 최상위 필드에만 나타났다(파이버에서 `control._names.mount` 를 읽어 확인).

## 결정

`register()` 를 호출하는 폼 컴포넌트 파일 상단에 `'use no memo'` 지시어를 둔다: `features/auth/login-form.tsx` · `signup-form.tsx`, `features/trips/trip-create-form.tsx`, `features/trip-editor/basics-form.tsx` · `day-form.tsx` · `day-schedule-row.tsx` · `flights-form.tsx` · `lodgings-form.tsx` · `bookings-form.tsx` · `info-block-row.tsx` · `info-section-row.tsx` · `members-panel.tsx` · `share-panel.tsx`. `useFieldArray` 만 쓰는 부모(`info-sections-form.tsx`)는 제외한다. 새 폼도 같은 규칙을 따른다.

## 이유

React 가 문서화한 컴파일러 제외 지시어이며, RHF 의 uncontrolled `register` 계약(매 렌더 호출)이 컴파일러 메모이제이션과 충돌하는 라이브러리 비호환이라 앱 코드로는 해결할 수 없다. ADR-0001·frontend.md 의 "메모이제이션은 React Compiler 에 위임" 원칙의 유일한 예외로 기록한다.

## 기각된 대안

- `reset(values, { keepFieldsRef: true })`: `_fields` 는 남지만 `_names.mount` 가 비워져 되돌리기(`reset()`)에서 최상위 필드의 DOM 값이 복원되지 않는다.
- `reset(values, { keepValues: true })`: 저장 직후는 되지만 되돌리기 경로에서 같은 문제.
- `Controller`/`useController` 전면 전환: 훅이라 컴파일러와 호환되지만 폼 13개 재작성이라 범위 과다. 후속 후보로 남긴다.

## 검증

저장 → 편집 → 저장 시 서버 액션 본문에 두 번째 값이 실리고 API 에 반영된다. 빈 필수값은 `aria-invalid=true` 로 저장이 막힌다. `bun run build` 의 프로덕션 번들에서도 같은 흐름을 확인한다.

## 추가 (2026-09-09 세션 2 후반)

- 같은 규칙으로 `features/trip-editor/sidebar-form.tsx`·`kinds-form.tsx`·`booking-attachments-field.tsx` 가 추가되어 총 16개 파일이다. 새 폼을 만들 때 `register()` 를 쓰면 반드시 같은 지시어를 둔다.
