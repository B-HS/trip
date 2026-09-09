# ADR-0023 — 셀형 액션 UI 를 `Button` 변형으로 전면 적용 (2026-09-09)

## 배경

ADR-0011 은 "완료 숨기기·체크 초기화" 만 셀형(패딩 든 버튼이 아니라 부모 블록 높이를 채우는 섹션) 으로 만들었고, 나머지 버튼은 shadcn 기본 `Button`(라운드·h-8/h-9 패딩) 이다. 로드맵 8 을 사용자가 착수 지시했다.

## 결정

- `shared/ui/button.tsx` 의 `buttonVariants` 에 변형 `cell`(카드 톤: `bg-card text-foreground hover:bg-muted`)·`cellPrimary`(`bg-primary text-primary-foreground hover:bg-primary/90`)·`cellDestructive`(`bg-destructive/10 text-destructive hover:bg-destructive/20`) 와 크기 `cell`(`h-auto min-h-10 self-stretch rounded-none px-4 text-xs font-medium`, 아이콘 `size-4`) 을 추가한다. 셀은 라운드·보더·그림자가 없고, 부모가 `flex gap-px bg-background` 로 1px 심을 만든다(기존 블록 심과 같은 메커니즘). `aria-pressed=true` 는 `bg-primary text-primary-foreground`, `disabled` 는 `opacity-50`, 포커스는 `focus-visible:ring-3 ring-ring/50` 그대로.
- 기존 shadcn 변형·크기는 지우지 않는다(다이얼로그 내부 등 다른 라이브러리 컴포넌트가 참조). 앱 화면의 액션은 화면 단위로 셀형으로 치환한다: 뷰어 도구 버튼(기존 raw `button` → `Button variant='cell' size='cell'`), 뷰어 헤더 "전체 일정 인쇄"·"보기"·"지도 열기", 목록 상단 "새 트립"·"오사카 예시 트립 만들기", 카드 액션(즐겨찾기·더보기 메뉴 트리거), 편집기 툴바 액션(행 추가·나라 추가·날짜 추가), 편집기 저장 바(되돌리기·저장 = 셀 2개), 다이얼로그 푸터(취소·확인), 인증 폼 제출·비밀번호 보기, 공유 탭 링크 복사·새 탭·내보내기·가져오기, 멤버 초대.
- 셀 묶음은 부모 `div.flex.gap-px.bg-background` 로 만들고, 단독 셀도 같은 부모 안에 둔다. `ButtonGroup`(shadcn) 은 라운드 결합 전제라 쓰지 않는다.
- 공개 표면(`.surface-public`: 로그인·회원가입·인트로)의 제출 버튼도 셀형으로 바꾸되 카드 안에서 풀폭 셀 1개로 둔다.

## 이유

사용자 지시(ADR-0011 의 확장). 변형으로 두면 기존 `Button` 의 `asChild`·포커스·disabled 처리를 재사용하고 치환이 클래스 변경으로 끝난다.

## 기각된 대안

- 별도 `cell-button` 컴포넌트: `Button` 과 상태 규칙이 두 벌이 된다.
- `ButtonGroup` 조합: 라운드 결합·보더 전제라 셀 심과 맞지 않는다.

## 미결

사용자 질문 13 의 답(변형 vs 별도 컴포넌트) 이 오면 이 ADR 을 갱신한다. 답이 없으면 추천안(변형)으로 진행한다.
