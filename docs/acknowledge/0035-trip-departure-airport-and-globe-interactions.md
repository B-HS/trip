# ADR-0035 — 트립별 출발 공항과 지구본 상호작용(툴팁·드래그 회전·경로 필터) (2026-09-10)

## 배경

ADR-0008 은 "항공편이 없는 트립은 `HOME_AIRPORT_CODE`(ICN) → 목적지 나라 좌표 순서로 체인"으로 정했고, ADR-0016 이 목적지(나라)를 도입하면서 그 규칙을 그대로 이어받았다. 그 결과 출발지가 앱 전역 상수 하나로 고정돼 있어 인천이 아닌 곳에서 출발하는 트립은 지구본 경로가 사실과 다르게 그려진다.

또 `/trips` 헤더 지구본은 전 트립의 경로를 한 장에 모아 그리지만(`collectGlobeRoutes`), 선이 어느 트립 것인지 알 수 없고 상호작용도 없다. 현재 `trip-globe.tsx` 의 `interactive` prop 은 OrbitControls 가 아니라 포인터 위치 기반 패럴랙스 기울기의 on/off 스위치이며(`trip-globe-scene.tsx` 의 `useFrame` 안 parallax 갱신), 드래그 회전 기능 자체가 없다. 경로 호는 drei `Line`(Line2)이 아니라 three 순정 `tubeGeometry` 두 겹(글로우 + 본선)으로 그린다.

이 세션에서 사용자가 출발지·상호작용 네 가지를 결정했고, 착수 전에 컬럼·인터페이스·쿼리 키를 확정한다.

## 결정

### 1. 출발 공항은 트립별 값 (마이그레이션 0007, 추가 전용)

- `trip_trip` + `departure_airport_code` varchar(3) NULL. TS 키는 `departureAirportCode: string | null`.
- 유효값은 `shared/constant/airports.ts` 의 `AIRPORTS` 키(43개)뿐이다. 저장 경로(zod `tripBasicsSchema`·템플릿 스키마)에서 그 집합으로 검증한다.
- `null` 이면 `HOME_AIRPORT_CODE`(ICN)로 계산한다. 기존 트립 데이터의 backfill 은 하지 않는다 — 지금 동작과 결과가 같다.
- `PublicTrip`·`TripSummary` 형태가 바뀌므로 `PUBLIC_TRIP_CACHE_VERSION` 을 `'3'` → `'4'` 로 올린다.
- 사용자 프로필(계정 단위) 출발지 설정은 두지 않는다.

### 2. 편집기 기본 정보 탭에 출발 공항 필드

- 편집기 "기본 정보" 탭에 출발 공항 콤보박스를 둔다. 후보는 `AIRPORTS` 43개, 표시는 `코드 · 이름(도시)` 한 줄(예: `ICN · 인천(서울)`), 비움 = `null`(= ICN 으로 계산)을 명시한다.
- 트립 생성 폼(`features/trips/trip-create-form.tsx`)에는 노출하지 않는다. 새 트립은 `null` 로 시작하고 필요하면 편집기에서 고른다.

### 3. 템플릿 JSON

- `shared/lib/trip-template.ts` 의 `tripTemplateSchema` 에 `departureAirportCode` 를 **선택 필드**로 추가한다(없으면 `null`). 오사카 템플릿(`shared/constant/template/osaka.ts`)은 `'ICN'` 을 명시한다.
- 가져오기·내보내기(ADR-0021)는 이 필드를 그대로 왕복한다.

### 4. 지구본 경로 체인 규칙

- 트립에 항공편이 있으면 기존대로 항공편 구간을 그대로 쓴다(변경 없음).
- 항공편이 없으면 `departureAirportCode ?? HOME_AIRPORT_CODE` → 목적지 나라 좌표 순서로 체인한다. `buildDestinationRoutes` 가 출발 코드를 인자로 받고, `collectGlobeRoutes` 가 트립별로 넘긴다.

### 5. `shared/ui/three` 는 도메인 중립을 유지한다

- 경로 항목은 표시용 문자열만 받는다: `key`(안정 식별자) · `label`(1줄) · `description`(2줄). 트립 제목·기간 문자열 조립은 `widgets/trips` 가 한다.
- 선택·선택 해제는 `selectedKey`(선택 없음이면 `null`)와 `onRouteSelect(key)` 콜백으로만 오간다. 지구본은 트립·목적지 같은 도메인 타입을 알지 못한다.
- 히트 테스트는 이미 그리고 있는 글로우 튜브(`tubeGeometry`, `ARC_GLOW_SCALE` 3.4배)에 포인터 핸들러를 붙여 쓴다. mesh raycast 라 판정이 안정적이고, drei `Line`(Line2) + `lineWidth` 임계값으로 갈아탈 필요가 없다.

### 6. `/trips` 지구본 상호작용

- **툴팁**: 선 hover 시 `출발→도착 코드·도시`(1줄) + `트립 제목·기간`(2줄)을 보여준다. 3D 안이 아니라 컨테이너 기준 absolute DOM 오버레이로 그리고(`pointer-events-none`), 좌표는 R3F 포인터 이벤트의 `nativeEvent.clientX/clientY` 를 컨테이너 상대좌표로 환산해 얻는다. 톤은 기존 툴팁과 같다(`bg-popover` 계열, 라운드·그림자 없음, mono `text-2xs` 메타).
- **드래그 회전**: drei `OrbitControls` 를 도입한다. `enableZoom={false}`·`enablePan={false}`, 회전만 허용, `enableDamping`. 자동 회전은 기존 규칙 그대로(호버 시 정지, 모션 감소 설정이면 정지). 터치 드래그는 OrbitControls 의 기본 터치 매핑(한 손가락 회전)을 쓰고, 두 손가락 줌·팬은 비활성이므로 페이지 스크롤을 막지 않는다.
- **선 클릭 필터**: 선을 클릭하면 그 경로가 속한 트립만 목록에 남는다. 같은 선을 다시 클릭하거나 해제 셀을 누르면 풀린다. 목록 헤더에 `ICN → KIX 필터 해제` 셀(`Button variant='cell' size='cell'`)을 둔다.
- **필터 상태는 URL 쿼리 `route`** 로 유지한다(값 예: `ICN-KIX`). 목록은 클라이언트에서 TanStack 캐시를 필터하므로, 뷰어(`widgets/trip-viewer/trip-viewer-widget.tsx`)와 같은 방식을 따른다: 초기값은 서버 페이지가 `searchParams` 에서 파싱해 `initialRoute` 로 1회 내려주고, 이후 변경은 `window.history.replaceState` 로 URL 만 조용히 동기화한다(`useSearchParams`·`router.replace` 를 쓰지 않아 리렌더·서버 왕복이 없다).
- 적용 범위는 `/trips` 헤더 지구본이다. 인트로 히어로·빈 상태·404 는 hover·클릭 대상이 아니므로 기존 동작을 유지한다.

### 7. 접근성 한계 (기록)

키보드로 선을 고르는 대체 수단은 두지 않는다. 필터를 조작할 수 있는 접근 가능한 컨트롤은 **해제 셀 하나뿐**이며, 필터를 거는 것은 포인터 전용이다. 지구본 `Canvas` 는 지금처럼 `aria-hidden` 이고 목록 자체가 정보의 정본이라 정보 손실은 없지만, "포인터 없이 필터를 걸 수 없다"는 제약은 남는다. 경로 목록을 셀 버튼으로 노출하는 방식은 후속 판단으로 미룬다.

## 이유

출발지를 트립 속성으로 두는 편이 데이터 모델과 맞는다 — 같은 사용자도 트립마다 출발 공항이 다르고, 트립은 공동편집·공개 공유 대상이라 열람자 계정 설정으로 경로가 달라지면 같은 트립이 사람마다 다르게 보인다. NULL 허용 + 상수 fallback 이라 마이그레이션이 추가 전용이고 backfill·배포 순서 제약이 없다.

`shared/ui/three` 에 표시용 문자열과 `key` 만 넘기면 지구본이 트립 도메인을 몰라도 되고, FSD 의존 방향(widgets → shared)이 유지된다. 히트 테스트를 이미 있는 글로우 튜브에 얹는 것이 렌더 구조를 바꾸지 않는 최소 변경이다.

필터를 URL 에 두면 새로고침·뒤로가기·링크 공유에서 상태가 살아남는다. 목록 데이터가 이미 클라이언트 캐시에 있으므로 서버 왕복 없이 `history.replaceState` 로만 동기화하는 편이 맞다.

## 기각된 대안

- **사용자 프로필에 기본 출발지 설정**: 공유 트립이 열람자마다 다른 경로로 보인다. 트립별 값 하나로 충분하다.
- **뷰어(`/trips/[tripId]`·`/s/[slug]`)에 지구본 추가**: ADR-0008 의 "정보 있는 곳에만" 원칙 유지. 적용처는 인트로 히어로·`/trips` 헤더·빈 상태·404 그대로다.
- **`HOME_AIRPORT_CODE` 상수만 유지하고 컬럼을 두지 않음**: 인천 외 출발 트립의 경로가 계속 틀린다. 상수는 fallback 으로만 남긴다.
- **필터 상태를 로컬 state 로만 유지**: 새로고침·공유에서 사라지고, 이 앱의 다른 뷰 상태(`?view=`·`?day=`)와 규칙이 어긋난다.
- **기존 트립을 `'ICN'` 으로 backfill**: `null` fallback 과 결과가 같은데 마이그레이션만 무거워진다.
- **경로 호를 drei `Line`(Line2)으로 교체해 `lineWidth` 임계값으로 히트 테스트**: 렌더 구현(튜브 두 겹)을 갈아엎어야 하고, 이미 있는 글로우 튜브로 같은 결과를 얻는다.
- **`OrbitControls` 의 줌·팬까지 허용**: 페이지 스크롤(터치)과 충돌하고, 지구본이 화면 밖으로 밀려 헤더 레이아웃이 깨진다.

## 구현 메모 (2026-09-10 세션 4, 4-4e)

### 출발 공항

- 마이그레이션 `0007_absent_santa_claus`(ALTER 1개, 추가 전용) 적용됨 — `trip_trip` + `departure_airport_code varchar(3) NULL`, 이력 8행. TS 키는 `departureAirportCode`.
- 검증은 `shared/constant/airports.ts` 의 `AIRPORT_CODES`(43개) 로 한다. 같은 파일에 `asAirportCode(code: string | null)` 를 추가해 DB 문자열을 안전하게 좁힌다(repository export·편집기 매퍼·경로 조립이 공유).
- `tripTemplateFieldsSchema.departureAirportCode` 는 `z.enum(AIRPORT_CODES) | ''` → `null` 로 정규화하는 선택 필드다. `tripBasicsSchema`·`tripBasicsFormSchema`·`tripCreateSchema` 가 이 필드 스키마를 그대로 상속하므로 저장 경로가 한 곳이다. 오사카 템플릿은 `'ICN'` 명시.
- `TripSummary` 에 `departureAirportCode` 를 추가하고 `PUBLIC_TRIP_CACHE_VERSION` 을 `'4'` 로 올렸다.
- 편집기 "기본 정보" 탭에 `features/trip-editor/airport-combobox.tsx`(shadcn `Combobox`, RHF `Controller`). 입력 높이는 같은 행의 다른 입력과 맞추려 `EDITOR_INPUT_CLASS` 를 그대로 받는다(실측 32px 동일). 힌트 문구는 "고르지 않으면 기본 ICN 으로 계산합니다.". 생성 폼에는 노출하지 않는다(§2 대로).

### 지구본

- `shared/ui/three/globe-interaction.ts` 신규(도메인 중립 순수 모듈): `placeGlobeTooltip`(포인터 옆 배치 + 컨테이너 안 clamp·반대편 flip), `resolveGlobeArcEmphasis`, `GLOBE_ARC_STYLE`(idle/hovered/selected/muted 의 색 토큰·불투명도·`radiusScale`).
- `globe-math.ts`: `GlobeRouteInput` 에 선택 `key`·`label`·`description` 을 받고 `GlobeRoute` 가 그대로 들고 다닌다(`formatGlobeRouteLabel` 은 `label` 이 있으면 그것을 쓴다). 지구 뒤편 히트를 버리는 `isHiddenBySphere` 추가.
- `trip-globe.tsx`: `dragRotate`·`showTooltip`·`selectedKey`·`onRouteSelect` prop, `hoveredKey` 로컬 state, DOM 오버레이 툴팁. `trip-globe-scene.tsx`: `dragRotate` 면 drei `OrbitControls`(줌·팬 끔) 를 렌더하고 패럴랙스는 끈다, `CLICK_DRAG_THRESHOLD`(`event.delta`) 로 드래그와 클릭을 가른다.
- `widgets/trips/trip-summary.derive.ts`: `collectGlobeRoutes` 가 트립 전체를 훑어 `key`(코드 쌍)·`label`(코드 → 코드 · 도시 → 도시)·`description`(트립 제목 · 기간, 최대 3개 + "외 n개")·`tripIds` 를 만든다. `findGlobeRoute`·`filterTripsByRoute` 로 목록을 거른다. `buildDestinationRoutes` 는 `asAirportCode(departureAirportCode) ?? HOME_AIRPORT_CODE` 에서 체인을 시작한다.
- `widgets/trips/trip-list-widget.tsx`: `?route=` 필터, 해제 셀(`Button variant='cell' size='cell'` + `XIcon`), 목록에 없는 유령 키는 렌더 중 정리(`hasStaleRoute`). 서버 페이지가 `searchParams.route` 를 `initialRoute` 로 1회 내려주고 이후 동기화는 `shared/lib/search-param.ts` 의 `replaceSearchParam`(`history.replaceState`, 빈 쿼리면 `?` 제거) 이 한다 — 뷰어(`trip-viewer-widget.tsx`)의 인라인 구현도 이 헬퍼로 합쳤다.
- 인트로 히어로·빈 상태·404 지구본은 prop 을 안 넘기므로 자동 회전만 하고 핸들러가 등록되지 않는다(레이캐스트 대상이 아니다).

### §5·§6 결정에서 달라진 것

- **드래그 회전은 `interactive` 가 아니라 별도 `dragRotate` prop**, 그리고 **정밀 포인터에서만** 켠다. `interactive` 는 기존 패럴랙스 스위치라 의미가 겹치고, 터치에서 OrbitControls 를 켜면 한 손가락 드래그가 세로 스크롤을 먹는다 → `shared/hooks/use-pointer.ts` 의 `useFinePointer()`(`(pointer: fine)`, `useSyncExternalStore`) 로 게이팅한다. 터치 기기는 자동 회전 + 탭 선택만 남는다.
- **툴팁 1줄은 코드가 아니라 도시 기준 라벨을 함께 적는다**: `ICN → KIX · 서울 → 오사카`. 2줄은 트립 제목 · 기간이고, 한 호를 여러 트립이 공유하면 최대 3개까지 나열하고 나머지는 "외 n개".
- **같은 나라의 서로 다른 목적지 도시는 한 호로 합친다.** 목적지 체인의 끝점 코드가 나라 코드(`JP`)라 `ICN-JP` 키가 같아지고, 두 트립의 `tripIds` 가 한 호에 모인다 — 필터는 그 호에 묶인 트립을 전부 보여준다.
- **툴팁 톤은 `bg-popover` 가 아니라 `bg-foreground` + `text-background`** 다(§6 서술 정정). 2줄 메타는 `font-mono text-2xs text-background/70`.
- **콤보박스는 비우기(clear)를 노출**한다. `ComboboxInput showClear` 로 값을 지우면 `null` 이 되어 ICN fallback 으로 돌아간다.
- **드롭다운 목록 행은 코드 열 + `이름(도시)` 2열**이다(`ICN` / `인천(서울)`). §2 예시(`ICN · 인천(서울)`)와 정확히 같은 형태는 **선택된 입력값**뿐이며, 목록은 코드 열이 정렬돼 읽기 쉬워 그대로 둔다.
- **히트 테스트는 §5 결정대로 글로우 튜브 자체에 붙인다.** 1차 구현이 `colorWrite=false` 히트 튜브(`ARC_HIT_SCALE` 8배)를 따로 겹쳤다가, 실측에서 히트 반경이 그려진 선의 약 2.35배라 이웃 호(`ICN↔KIX` 위에서 `PUS → JP` 툴팁)를 잡는 것이 확인돼 되돌렸다. 지금은 글로우 mesh 에 `hitTestHandlers`(`onPointerOver`·`onPointerMove`·`onPointerOut`·`onClick`) 를 스프레드하고, 두 콜백이 모두 `null` 이면 빈 객체라 핸들러가 없다. 호버 시 `radiusScale` 이 1 → 1.8 로 커져 히스테리시스는 유지된다. 호당 mesh 는 글로우 + 코어 2개(+ 트래블러).
- §7 접근성 한계(포인터 없이 필터를 걸 수 없음)는 그대로다. 해제 셀만 접근 가능한 컨트롤이다.

## 실측 메모 (2026-09-10 세션 4, `/trips` 라이트·다크)

- 편집기 출발 공항: 필드 존재·빈 값·힌트 노출, 콤보박스 높이 32px(제목·목적지 입력과 동일), 옵션 43개(`AIRPORTS` 와 일치, 첫 3개 ICN·GMP·PUS), 도시명("부산")·소문자 IATA("pus") 검색 1건, 무매칭 시 "일치하는 공항이 없습니다.", 선택 시 `PUS · 김해(부산)` + clear 버튼 + dirty 감지, 되돌리기로 원복. `/trips/new` 에는 필드가 없다.
- 경로 체인: 임시 트립에 출발 공항 `PUS` 를 저장하니 항공편이 없는데도 `PUS → JP` 호가 추가되고 sr-only 문구가 "…부산에서 JP 삿포로까지."로 갱신됐다. panel variant 는 `showLabels:false` 라 라벨 `ul` 을 그리지 않아 sr-only 와 툴팁으로 확인했다.
- 상호작용: 포인터가 컨테이너에 들어가면 자동 회전이 멈추고 가로 드래그로 크게 회전(아시아→아프리카→남아메리카), 드래그를 놓아도 필터가 걸리지 않는다(`?route=` 없음). 호 hover 시 2줄 툴팁이 뜨고 컨테이너 밖으로 넘치지 않으며(클램프 확인), 호에서 벗어나면 DOM 에서 사라진다.
- 필터: 호 클릭 → `?route=ICN-KIX` + 해제 셀 + 목록 1건, 같은 호 재클릭·해제 셀 클릭으로 해제, 새로고침해도 유지(`initialRoute`), 없는 키(`?route=ZZ-YY`)는 필터가 걸리지 않고 URL 이 `/trips` 로 정리된다. 통계 타일·즐겨찾기 레일은 필터와 무관하게 전체 기준이다. 선택 시 그 호만 굵고 밝게, 나머지는 흐리게 렌더된다.
- 히트 반경 수정 후 재확인: 확대 상태에서 idle 히트 밴드가 약 12px(글로우 3.4배 예상 지름 ≈10px 과 일치, 이전 8배 히트의 ≈23px 과 명백히 다름), 7px 떨어진 두 점이 각각 다른 호를 반환해 "보이는 선 = 잡히는 선" 이 됐다. 404 페이지 지구본은 호버해도 툴팁·강조가 없고 커서가 `auto` 다.
- 인트로 히어로: 컨테이너에 `cursor-grab` 이 없고(= OrbitControls 미렌더) 드래그 후에도 URL·클래스가 그대로다. 자동 회전과 라벨 `ul`·예시 문구는 기존대로.
- 미확인: 인트로 히어로의 "자동 회전만" 은 캡처 사이 위치 변화와 클래스 부재로 판정했을 뿐 자동 회전과 드래그 회전을 화면만으로 분리 판정하지는 못했다. 빈 상태 지구본(`interactive={false}`)과 로그아웃 인트로는 확인하지 못했다. `ICN → JP`(lift 가 가장 낮은 호)는 샘플링으로 잡지 못했다.
- 도구 제약과 임시 데이터 처리는 `docs/quality-assurance/2026-09-10-community-editor-checklist.md` "세션 4 지구본·출발 공항" 절에 적었다.
