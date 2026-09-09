# ADR-0009 — 브랜치·자동 커밋 (2026-09-09)

## 결정

원격 `https://github.com/B-HS/trip`. `prod` = 프로덕션(Vercel, 사용자가 main → prod 로 rename), `dev` = 작업. `git config llm-rules.auto-commit true`, auto-push false(push·prod fast-forward 머지는 사용자 지시 시). 커밋은 Conventional Commits, author 사용자 단독, AI 트레일러 금지.

## 이유

가드 훅이 보호 브랜치 직접 커밋을 막아 작업 브랜치 분리. 사용자 지시("메인은 prod, 작업은 dev").

## 기각된 대안

- main 직접 커밋: 훅 차단.
- `feat/trip-app` 브랜치명: 사용자가 dev 로 지정.
