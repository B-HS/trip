# ADR-0015 — 날짜 탭 오버플로 UX (2026-09-09)

## 결정

`features/trip-viewer/day-picker.tsx`: 넘칠 때만 양끝 화살표 셀(끝에서 비활성), 스트립 아래 2px 스크롤 위치 표시, 키보드 좌우 이동, "n/총" 카운터 겸 달력 점프(shadcn Calendar 팝오버, 트립 날짜만 활성). 상태는 ResizeObserver·scroll 이벤트로 갱신.

## 기각된 대안

그라데이션 힌트: 사용자가 "너무 짜친다".
