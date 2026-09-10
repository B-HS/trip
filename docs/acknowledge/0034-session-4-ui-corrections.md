# ADR-0034 — 세션 4 UI 정정: 레일 게시판 tree, 편집기 행 정렬, 카드 배지 제거, 모바일 1열 (2026-09-10)

## 배경

로드맵 6 기본 구현(`8640392`) 이후 사용자가 화면을 직접 보며 지적한 UI 결함을 세션 4 에서 순차 정정했다. 지적은 네 갈래였다.

1. 레일의 "게시판" 항목이 단일 링크라 자유·질문·후기 게시판으로 한 번에 갈 수 없다.
2. 편집기 정렬 행의 드래그 핸들·번호·라벨·삭제 버튼의 세로 정렬이 어긋나고, 삭제 버튼이 카드 패딩 안에 떠 있다(댓글 액션 셀과 같은 결함, 앞서 `7adc2fa` 로 댓글만 고쳤다).
3. 트립 카드의 상태·역할·목적지가 배지·칩이라 배경 틴트가 카드 안에 여러 겹 생긴다.
4. 모바일 폭에서 공개 트립 그리드가 1열로 떨어지지 않고 카드가 가로로 넘친다.

ADR-0011(보더 대신 배경 계층·1px 심)·ADR-0023(셀형 액션 UI)의 규칙을 이미 갖고 있으므로, 새 규칙을 만들지 않고 그 규칙을 못 지킨 지점을 맞추는 작업이다.

## 결정

### 1. 레일 게시판은 tree 하위 메뉴 (`feat(app-shell)`)

- `features/app-shell/nav-sub-item.tsx` 를 새로 두고, `nav-item.tsx` 에 `NavChildLink<T>` 타입과 `NavItemLink.children` 을 추가한다. `nav-rail.tsx` 는 `ul`/`li` 중첩 마크업으로 그리고, 하위 목록은 `ml-7 border-l border-sidebar-border` 로 들여쓴다(DESIGN §6-4 tree 예외).
- 활성 판정은 `nav-active.ts` 의 `hasNavChildren`·`isNavParentActive` 로 한다. **펼침**: 활성 자식이 있으면 부모는 비활성, 없으면 부모 prefix 로 폴백. **접힘**: 하위 목록을 그리지 않고 부모 prefix 로만 판정. 그 결과 `aria-current='page'` 와 활성 배경 `layoutId` 마커는 레일 전체에서 **항상 정확히 1개**이며, 이를 테스트로 고정한다(`tests/features/app-shell/nav-active.test.ts`·`nav-rail.test.tsx`).
- 하위 목록의 출처는 `widgets/app-shell/app-shell.tsx` 의 `NAV_ITEMS` 가 `DEFAULT_BOARDS`(자유·질문·후기)와 `BOARD_KIND_LABEL` 로 만든다. 즉 `shared/constant/community.ts` 의 `DEFAULT_BOARDS` 는 **마이그레이션 0006 의 게시판 시드와 레일 하위 메뉴가 함께 참조하는 계약**이다 — 게시판을 추가하면 두 곳을 같이 고친다.
- 컨벤션 예외인 `Route<T>` 제네릭 화살표 컴포넌트가 3개(SectionHeading·SearchForm·PostForm)에서 **5개**(+ NavRail·NavSubItem)로 늘어난다.

### 2. DESIGN.md 개정 (리뷰 must)

원본 DESIGN.md 는 레일을 "flat, no nesting" 으로 못박고 tree 들여쓰기 보더를 속성 트리에만 허용한다. tree 하위 메뉴를 도입하는 이상 문서를 먼저 고친다. 해당 문구만 최소 수정한다.

- §10-11 Do: "Keep the item list flat … no nesting" → 게시판처럼 하위 그룹이 있는 항목은 tree 로 중첩할 수 있고, 나머지는 평평하게 둔다.
- §6-4 case 4: "nested attribute-tree levels" → "nested tree levels(속성 트리·레일 하위 메뉴)".
- 같은 절 border 사용 집계 `border-sidebar-border (2)` → `(3)`.

### 3. 편집기 행은 셀형 정렬 (`fix(ui)`)

- 공용 `features/trip-editor/sortable-row.tsx` 를 셀형으로 바꾼다: 행 루트 `flex items-stretch gap-px bg-background`, 내용 셀 `bg-card p-3`, 삭제는 `Button variant='cell' size='cellIcon'` 풀하이트 셀 + `Tooltip` + `aria-label`. 선택된 행은 내용 셀과 삭제 셀 **둘 다** `bg-accent` 로 칠해 셀이 갈라져 보이지 않게 한다.
- 핸들·번호 묶음은 `-my-1 h-6` 으로 첫 줄에 맞추고, 라벨 라인은 `EDITOR_LABEL_LINE_CLASS='leading-4'`(`editor-form.ts`)로 통일해 핸들·번호·라벨·입력의 중심선을 맞춘다.
- 날짜 탭 행은 `번호 | 탭 라벨(mono muted, min-w-20 max-w-32) | 제목(truncate)` 구성으로 고정한다. 라벨은 "히메지·코베" 같은 실제 값이 잘리지 않는 최소 폭을 갖고, 넘치는 제목만 말줄임한다.
- 여행 정보 탭은 섹션 헤더를 셀 행 `[기본 펼침][블록 추가][섹션 삭제]` 로 만들고(섹션 삭제는 `cellDestructive` 라벨 셀), 블록 삭제는 행 높이를 채우는 툴팁 셀로 둔다. `day_table` 블록 안내 문구는 `DAY_TABLE_HINT` 상수로 뺀다.
- **보류**: 섹션 삭제 확인 다이얼로그는 넣지 않고 현행 즉시 삭제를 유지한다. `EditorToolbar` 는 손대지 않는다.

### 4. 트립 카드는 배지 대신 텍스트 (`fix(ui)`)

- `features/trips/trip-status.ts` 의 `TRIP_STATUS_BADGE_VARIANT` 를 `TRIP_STATUS_TEXT_CLASS` 로 교체한다(배경 틴트 없음, `upcoming`·`ongoing` = `text-foreground`, `done` = `text-muted-foreground`).
- `trip-card.tsx` 는 상태·역할을 mono 메타 한 줄("예정 D-21 · 소유자")로, `public-trip-card.tsx` 는 나라·도시 칩을 텍스트로 바꾼다.
- **범위는 트립 카드만**(사용자 결정). 게시판 배지·"채택됨" 배지는 의미 표시라 그대로 둔다.

### 5. 모바일은 1열 (`fix(ui)`)

- `public-trip-grid.tsx` 를 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 으로 명시한다(탐색·프로필·홈·비로그인 인트로가 공유).
- 카드·목록 텍스트에 `min-w-0`·`truncate`·`break-keep` 을 넣어 좁은 폭에서 가로 넘침을 없앤다.

### 6. 실측 후 반영 (같은 `fix(ui)` 범위)

브라우저 실측 지적 4건을 반영했다(상세는 `docs/quality-assurance/2026-09-10-community-editor-checklist.md`).

- `next.config.ts` 에 `allowedDevOrigins`(`localhost`·`127.0.0.1`·`[::1]`) — Next 16 의 크로스 사이트 dev 차단이 `[::1]` 오리진의 `/_next/*` 를 403 으로 막아 비로그인 검증용 루프백 호스트가 하이드레이션되지 않았다. dev 전용 설정이라 프로덕션 빌드에는 영향이 없다.
- `widgets/app-shell/public-header-actions.tsx`: 세션과 무관한 "탐색"·"게시판" 셀은 항상 렌더하고, `!isPending` 게이트는 "홈" ↔ "로그인"+"시작하기" 분기에만 남긴다. 첫 페인트에 헤더가 비는 구간이 사라진다. 로그인 상태에서 "탐색·게시판+홈" 이 함께 보이는 분기는 서버·클라이언트 세션 판정이 어긋나는 구간에서만 나타나는 방어 경로다(일상 경로에서는 `(shell)` 레이아웃이 `AppFrame` 을 고른다).
- `app/globals.css`: 라이트 `--sidebar-border` 를 `--palette-neutral-900`(oklch 0.9) → `--palette-neutral-708`(0.708) 로 올린다. 기존 값은 사이드바 배경과 대비 1.05:1 이라 tree 들여쓰기 선이 사실상 보이지 않았다(다크는 1.39:1 로 정상, 미변경). `border-border` 로 올리는 안은 라이트 `--border`(0.922)가 사이드바 배경(0.915)보다 밝아 오히려 나빠져 기각했다. **DESIGN.md 139·235 행(`--palette-neutral-900` = sidebar-border light)과 어긋나는 문서 드리프트로 남는다** — DESIGN 은 외부 원본이라 팔레트 표는 고치지 않는다.
- `features/community/public-trip-card.tsx`: `article` 에 `w-full`. `li` 가 `display:flex` 라 카드가 `max-content`(285.8px)에서 멈추고 컬럼 오른쪽이 `bg-background` 띠로 남았다.

## 이유

넷 다 새 디자인이 아니라 ADR-0011·0023 을 못 지킨 지점의 교정이다. 셀 행을 카드 패딩 밖으로 빼면 심이 양쪽에 생겨 앱 전역 규칙과 같아지고(댓글 `7adc2fa` 와 동일한 처방), 배지·칩을 텍스트로 내리면 카드 한 장에 배경 틴트가 한 겹만 남는다. 레일 tree 는 게시판 3종이 고정 집합이라 URL 을 외우지 않고 한 번에 이동할 수 있고, 활성 마커 단일성을 테스트로 고정해 `layoutId` 마커가 둘로 갈라지는 회귀를 막는다.

## 기각된 대안

- **레일 하위 목록을 `findBoards` 로 동적 조회**: 셸은 모든 페이지에 있어 요청마다 게시판 조회가 붙는다. 게시판은 마이그레이션 0006 이 시드한 고정 3종이라 상수(`DEFAULT_BOARDS`)로 충분하다. 게시판을 사용자가 만들 수 있게 되면 다시 본다.
- **게시판 배지·"채택됨" 배지도 텍스트로**: 사용자가 트립 카드만으로 범위를 정했다. 두 배지는 목록에서 상태를 찍어 주는 의미 표시라 남긴다.
- **섹션 삭제에 확인 다이얼로그 추가**: 저장 전 폼 상태라 되돌리기 비용이 낮고, 날짜·항공·숙소 행 삭제와 동작이 달라진다. 즉시 삭제 유지.
- **부모 "게시판" 도 자식과 함께 활성 표시**: `aria-current='page'` 가 2개가 되고 `layoutId` 마커가 두 곳을 오간다.
- **라이트 트리선을 하드코딩 색으로 조정**: 토큰만 쓰는 규칙 위반. `--sidebar-border` 값 자체를 올렸다.
