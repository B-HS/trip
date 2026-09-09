# ADR-0007 — 모션은 항상 동작, OS reduce-motion 무시 (2026-09-09)

## 배경

사용자 환경이 OS `prefers-reduced-motion: reduce` 라 지구본·전환이 멈춰 "3D 가 안 움직인다"는 지적.

## 결정

`MotionConfig reducedMotion='never'`, 전역 CSS reduce-motion 블록 제거. 모션 감소는 앱 내 설정(`shared/hooks/use-motion-preference.ts`, localStorage `trip-motion`, 기본 `full`, 사용자 메뉴 토글)로만. DESIGN §7 의 "페이드만" 제약도 완화해 `motion` 을 적극 사용(사용자 지시).

## 기각된 대안

- `reducedMotion='user'`(접근성 기본값): 사용자 요구와 충돌.
- 페이드 0.18s 만 허용(DESIGN 원문): 사용자가 "motion 최대한 활용" 지시.
