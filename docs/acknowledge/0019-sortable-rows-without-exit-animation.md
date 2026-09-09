# ADR-0019 — 편집기 정렬 목록은 퇴장 애니메이션 없이 렌더 (2026-09-09)

## 배경

`features/trip-editor/sortable-rows.tsx` 의 `AnimatePresence` 가 퇴장 행을 제거하지 못해 저장·리셋마다 opacity 0 인 행 18개가 DOM 에 누적됐다(레이아웃 공간을 차지해 실제 행이 아래로 밀리고, 같은 `name` 의 입력이 RHF 에 이중 등록됨). 새로 열자마자 마운트 시 `form.reset` 으로 18개가 이미 남아 있었다.

Opus 에이전트가 motion 13.2 소스를 읽어 낸 원인: `AnimatePresence` 의 `exitComplete` 맵은 전부 완료돼야 자식을 제거하는데, 자식 exit feature 의 `mount()` 가 부모 layout effect 보다 먼저 `onExitComplete` 를 동기 호출하면 신호가 버려지고 재시도가 없다. `useFieldArray` 는 `reset` 마다 `fieldKey` 전부를 새로 발급해 18개 key 가 동시에 교체되므로 한 건만 어긋나도 영구히 잠긴다. React Compiler(`'use no memo'` 실험)와 dnd-kit 의 `style.transition`·`transform` 문자열은 원인이 아니었다.

## 결정

- `SortableRows` 에서 `AnimatePresence` 를 제거하고 `SortableRow` 의 `exit` 를 뺀다. 진입 페이드(`initial`/`animate`)는 유지한다.
- `DndContext` 에 `useId()` 기반 `id` 를 넘겨 `aria-describedby` 카운터의 SSR/클라이언트 불일치(hydration 경고)를 없앤다.

## 이유

이 목록의 아이덴티티는 `form.reset` 이 통째로 재발급하므로 "개별 행이 사라진다"는 exit 의미론 자체가 성립하지 않는다. 우회가 아니라 의미에 맞는 렌더로 되돌리는 것이다.

## 기각된 대안

- 행 key 를 도메인 id 로 안정화해 exit 을 삭제 1건에만 발생시키기: 신규 행 임시 id 발급 로직이 필요. 후속 후보.
- `children` 배열 안정화로 diff 반복 줄이기: all-or-nothing 게이트가 남아 확률만 낮춘다.
