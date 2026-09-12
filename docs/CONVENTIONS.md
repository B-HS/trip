# 구현 규칙 — React Compiler·i18n·리팩터링

> 이 문서는 선택 사항이 아니라 이 저장소의 구현 계약이다. 신규 코드뿐 아니라 기존 코드를 수정하는 모든 리팩터링에 적용한다. `docs/acknowledge/0018-*`와 `0038-*`보다 구체적인 실행 기준이며, 충돌하면 더 엄격한 규칙을 따른다.

## 1. React Compiler

이 프로젝트는 `next.config.ts`의 `reactCompiler: true`로 React Compiler를 항상 사용한다.

### 반드시 지킬 것

- **`useMemo`, `useCallback`, `React.memo`를 사용하지 않는다.** 컴포넌트·훅·vendored shadcn 코드를 포함한다. 계산과 콜백의 메모이제이션은 Compiler에 맡긴다. `eslint.config.mjs`의 `no-restricted-syntax`·`no-restricted-properties`가 이를 오류로 강제한다.
- 렌더 중에는 props·state·context를 읽어 값을 계산하기만 한다. **렌더 중 `setState`, store 갱신, DOM 변경, 네트워크 요청 등 부수 효과를 실행하지 않는다.** 무효한 선택값은 state를 지우지 말고 현재 입력에서 유효한 파생값을 계산한다.
- 이벤트로 발생한 변경은 이벤트 핸들러에서 처리한다. 외부 시스템과 동기화할 때만 `useEffect`를 쓴다. props/state로 계산할 수 있는 값을 effect와 별도 state로 복제하지 않는다.
- 배열·객체·함수의 참조 동일성을 성능이나 정확성의 전제로 삼지 않는다. 외부 라이브러리가 안정 참조를 요구하면 그 사실을 테스트로 증명한 뒤 최소 범위의 Compiler opt-out을 검토한다.
- Compiler 또는 ESLint 경고를 우회하기 위해 disable 주석을 추가하지 않는다. 원인을 고치거나, 확인된 라이브러리 비호환이면 ADR에 근거와 재현 절차를 기록한다.

### 유일한 현재 예외: react-hook-form `register()`

- `register()`를 직접 호출하는 폼 컴포넌트는 파일 지시어를 정확히 다음 순서로 둔다.

    ```tsx
    'use client'
    'use no memo'
    ```

- 이유는 RHF의 `reset()` 이후 재등록 계약과 Compiler 메모이제이션이 충돌하기 때문이다(ADR-0018). 이 예외는 일반 폼, `useState` 다이얼로그, `Controller` 기반 컴포넌트까지 확대하지 않는다.
- 새 `register()` 사용 파일에는 opt-out과 함께 **저장 → 수정 → 재저장**, **reset/되돌리기**, **필수값 검증** 테스트를 둔다.
- `'use no memo'`를 제거하려면 현재 RHF 버전에서 프로덕션 빌드 재현 테스트까지 통과해야 한다. 개발 모드 StrictMode 결과만으로 제거하지 않는다.

### 금지 패턴

```tsx
const value = useMemo(() => deriveValue(input), [input])
const onClick = useCallback(() => setOpen(true), [])
if (!items.some((item) => item.id === selectedId)) setSelectedId(null)
```

다음처럼 쓴다.

```tsx
const value = deriveValue(input)
const onClick = () => setOpen(true)
const activeId = items.some((item) => item.id === selectedId) ? selectedId : null
```

## 2. 다국어(ko·en·ja)

### 사용자 노출 문자열은 예외 없이 카탈로그로 보낸다

- **JSX 텍스트, 제목, 설명, 버튼, placeholder, toast, dialog, tooltip, empty/error/loading 상태, `aria-label`, `sr-only`, 이미지 대체 설명, 지도·지구본 설명, metadata를 코드에 직접 쓰지 않는다.** `messages/{ko,en,ja}.json`에 의미 기반 키를 만들고 `useTranslations`/`getTranslations`로 읽는다.
- 같은 한국어 문장이라도 의미가 다르면 키를 분리한다. 반대로 같은 의미의 공통 동작은 `common.actions` 등 공통 네임스페이스를 재사용한다.
- 번역 키를 화면에 노출하거나 `t()` 실패를 fallback 문구로 숨기지 않는다. 누락은 테스트·타입 검사에서 실패해야 한다.
- 새 키는 **ko·en·ja 세 카탈로그에 한 변경으로 동시에 추가**한다. 세 파일의 키 구조는 완전히 같아야 한다.
- 번역은 단어 대 단어 치환이 아니라 해당 언어의 자연스러운 제품 문구로 작성한다. 일본어에 한국어 조사·어미, 영어에 한국식 띄어쓰기나 어순을 남기지 않는다. 고유명사·IATA 코드·URL·사용자가 작성한 콘텐츠는 번역 대상이 아니다.

### 계층별 규칙

- Client Component는 `useTranslations('<domain>')`, Server Component/metadata는 `getTranslations({locale, namespace})`를 사용한다.
- repository·schema·server action은 번역문을 반환하지 않는다. 검증은 `validation.*`, API/도메인 오류는 `error.*` 같은 안정 키를 반환하고 표시 경계에서 `translateMessage`로 번역한다.
- mutation 성공 메시지도 컴포넌트 언어를 따라야 한다. query hook 안에서 `useTranslations`를 호출해 toast를 만들며 한국어 상수를 두지 않는다.
- 날짜·요일·기간·국가명·숫자는 현재 locale을 formatter에 명시적으로 전달한다. 전역 `dayjs.locale()`처럼 요청 간 상태가 섞일 수 있는 설정을 사용하지 않는다.
- 신규 여행처럼 시스템이 생성해 저장하는 기본 데이터도 생성 시점 locale로 만든다. 이미 저장된 사용자 콘텐츠를 화면 locale 변경에 맞춰 강제로 번역하지 않는다.
- 내부 링크와 router는 `@/i18n/navigation`을 사용한다. `next/link` 또는 `next/navigation`의 router로 우회해 locale prefix를 잃지 않는다. 단, next-intl이 제공하지 않는 `useParams`·`useSearchParams`는 허용한다.
- locale 전환은 현재 논리 pathname을 유지하고 `NEXT_LOCALE`을 갱신해야 한다. 공개 페이지와 로그인 사용자 페이지에서 동일하게 작동해야 한다.

### 카탈로그 품질 게이트

- 세 카탈로그의 재귀 키 집합이 같은지 검사한다.
- ko 이외 카탈로그에 의도하지 않은 한글이 없는지 검사한다. 한글 고유명사를 유지한 경우 키 옆 문서나 테스트로 의도를 남긴다.
- 사용자 화면 코드에서 한글 리터럴을 검색한다. 테스트명, 주석, 콘텐츠 fixture, 한국어 원본 템플릿은 허용하지만 UI chrome은 허용하지 않는다.
- 적어도 ko·en·ja 각각에서 public, auth, trips 목록/생성, viewer, editor, profile/settings 페이지를 확인한다. 언어 전환 후 URL, `<html lang>`, 날짜/요일, toast, dialog, 접근성 이름까지 확인한다.

## 3. 컴포넌트와 상태

- 서버에서 완성할 수 있는 화면은 Server Component에서 데이터를 읽고 HTML을 완성한다. 상호작용이 필요한 최소 경계만 `'use client'`로 둔다.
- state에는 사용자가 선택하거나 입력한 원본만 둔다. props/query 결과에서 구할 수 있는 상태, 필터된 목록, 활성 항목, 집계값은 렌더에서 파생한다.
- list key는 영속 id를 쓴다. index key는 순서가 절대 변하지 않는 정적 표시 외에는 금지한다.
- 버튼에는 정확한 `type`, icon-only 버튼에는 번역된 접근성 이름, 토글에는 `aria-pressed`, 현재 링크에는 `aria-current`를 둔다.
- 로딩·실패·빈 상태를 정상 상태와 같은 도메인 컴포넌트에서 명시적으로 처리한다. 실패를 빈 목록처럼 보이게 하지 않는다.

## 4. FSD 경계와 코드 구성

- 의존 방향은 `app → widgets → features → entities → shared`다. 아래 계층이 위 계층을 import하지 않는다.
- 데이터 접근과 서버 액션은 `entities`, 사용자 행위 단위 UI는 `features`, 여러 feature를 조립하는 페이지 블록은 `widgets`, 범용 UI·순수 유틸은 `shared`에 둔다.
- 같은 포맷·라벨·경로 계산을 화면마다 복제하지 않는다. locale을 인자로 받는 순수 함수로 추출하고 기본 locale은 기존 호출·테스트 호환이 필요한 경우에만 `ko`로 둔다.
- 상수는 식별자·제약·원본 콘텐츠만 보관한다. 번역 가능한 UI label map은 카탈로그로 이동한다.
- 수정 범위와 무관한 사용자 변경을 되돌리지 않는다. 대규모 기계 변경 뒤에는 diff를 도메인별로 읽어 잘못된 import, 죽은 상수, 중복 키를 확인한다.

## 5. 리팩터링 완료 조건

리팩터링은 동작을 옮긴 것으로 끝나지 않는다. 다음을 모두 만족해야 한다.

1. 변경 전 보장해야 할 동작과 발견한 결함을 먼저 적는다.
2. UI 문자열·locale 포맷·React Compiler 금지 패턴을 정적 검색한다.
3. 메시지 카탈로그 JSON 파싱과 ko/en/ja 키 동등성을 확인한다.
4. `bun run typecheck`, `bun run lint`, `bun test`, `bun run build`를 통과한다.
5. React Compiler/RHF 변경은 프로덕션 번들에서 저장 → 수정 → 재저장을 확인한다.
6. 다국어 변경은 세 locale의 공개 페이지와 로그인 사용자 페이지를 브라우저에서 확인한다.
7. 문서의 완료/GAP 상태를 실제 코드와 일치시킨다. 통과하지 않은 검증을 green으로 기록하지 않는다.

권장 감사 명령:

```bash
rg -n "useMemo|useCallback|React\.memo" --glob '*.{ts,tsx}'
rg -n "[가-힣]" app entities features shared widgets --glob '*.{ts,tsx}' --glob '!*.test.*' --glob '!*.stories.*'
bun run typecheck
bun run lint
bun test
bun run build
```

검색 결과는 무조건 0이어야 하는 것이 아니라 **분류되지 않은 위반이 0이어야 한다**. 테스트 설명·주석·한국어 콘텐츠처럼 허용한 항목은 사용자 UI chrome과 명확히 구분한다.
