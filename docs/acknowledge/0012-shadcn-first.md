# ADR-0012 — shadcn 전 컴포넌트 우선 사용 (2026-09-09)

## 결정

https://ui.shadcn.com/docs/components 의 55개 컴포넌트를 전부 `shared/ui` 에 설치. 새 UI 는 손으로 만들기 전에 해당 컴포넌트가 있는지 먼저 확인해 사용한다(예: 날짜 점프 = Calendar+Popover, 나라 선택 = Combobox, 셸 = Sidebar 후보, 명령 팔레트 = Command).

## 이유

사용자 재강조("적극 활용, 진짜 엄청 많으니까").

## 비고

shadcn 원본 파일은 `function` 선언 등 벤더 스타일을 유지(최소 diff). carousel 은 set-state-in-effect 린트 때문에 `useSyncExternalStore` 로 수정.
