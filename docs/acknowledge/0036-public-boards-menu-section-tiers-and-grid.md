# ADR-0036 — 공개 헤더 게시판 드롭다운·섹션 배경 계층·auto-fit 카드 그리드 (2026-09-10)

## 배경

4-4e 까지 마친 화면을 사용자가 다시 보며 네 갈래를 지적했다.

1. 비로그인 공개 헤더의 "게시판" 이 단일 `/boards` 링크라 자유·질문·후기로 한 번에 갈 수 없다. 레일은 ADR-0034 로 tree 하위 메뉴를 갖췄지만 `PublicFrame` 헤더는 그대로였다.
2. 섹션 제목 스트립과 그 아래 블록이 **둘 다 `bg-card`** 라 섹션 경계가 1px 심으로만 남는다. ADR-0011 의 3단 계층이 화면에서는 2단으로 읽힌다.
3. 공개 트립 그리드가 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` 고정이라 카드가 1개일 때 오른쪽 두 열이 빈 `bg-background` 로 남는다(QA 체크리스트 "발견된 개선 후보").
4. 환경변수 키가 무엇이고 어디서 발급받아 어디에 넣는지가 `docs/PROCESS.md`·`docs/HANDOFF.md` 의 한 줄짜리 "사용자 작업" 문장에 흩어져 있다.

새 디자인 언어를 만드는 작업이 아니라 ADR-0011(배경 계층·1px 심)·ADR-0023(셀형 액션 UI)·ADR-0034(게시판 하위 메뉴)를 공개 표면과 섹션 단위에 마저 적용하는 교정이다.

## 결정

### 1. 공개 헤더의 "게시판" 은 드롭다운 (`widgets/app-shell/public-header-actions.tsx`)

- 단일 링크를 shadcn `DropdownMenu` 로 교체한다. 트리거는 `DropdownMenuTrigger asChild` + 기존과 같은 `Button variant='cell' size='cell'`(라벨 "게시판" + `ChevronDownIcon aria-hidden`)이고, `aria-haspopup='menu'`·`aria-expanded` 는 Radix 가 붙인다.
- 항목은 4개다: "게시판 전체"(`/boards`) + `DEFAULT_BOARDS` 3개(`board.name` = 자유게시판·질문게시판·여행 후기 → `/boards/<key>`). 전부 `DropdownMenuItem asChild` + `Link`.
- 활성 표시는 레일과 같은 `features/app-shell/nav-active.ts` 의 `isNavItemActive` 를 재사용한다. "게시판 전체" 는 정확 일치, 게시판 3개는 `matchPrefix: true`(글 목록·상세·작성까지 활성). 활성 항목만 `aria-current='page'` 를 받고 `aria-[current=page]:bg-primary` 로 칠한다.
- 메뉴 톤은 앱 규칙대로 라운드·그림자 없이 셀로 만든다: 콘텐츠 `flex min-w-36 flex-col gap-px rounded-none bg-background p-px shadow-none ring-0`, 항목 `rounded-none bg-card`(hover·focus 는 `bg-muted`).
- `/boards` 인덱스 페이지는 **포털로 유지**한다. 드롭다운은 바로가기이지 인덱스의 대체가 아니다.
- 게시판 목록의 출처는 계속 `shared/constant/community.ts` 의 `DEFAULT_BOARDS` 다 — 마이그레이션 0006 시드·레일 하위 메뉴·이 드롭다운·아래 게시판 셀이 함께 참조하는 계약이다(ADR-0034).

### 2. 섹션 배경 계층 규칙 (ADR-0011 확장)

페이지 안의 세로 계층을 3단으로 못박는다.

```
페이지 bg-background   ← 블록 사이 1px 심으로 보이는 바탕
섹션 헤더 스트립 bg-muted  ← 대문·섹션 제목 줄
블록 bg-card           ← 목록·카드·본문
```

- `features/community/section-heading.tsx` 의 제목 스트립을 `bg-card` → `bg-muted` 로 올린다. 같은 행의 "더 보기" 셀은 `bg-card` 로 남겨 스트립 위의 셀로 읽히게 한다.
- 페이지 대문(eyebrow + h1 + 설명)도 `bg-muted` 로 올린다: 커뮤니티 홈(`widgets/community/community-home.tsx`), 게시판 인덱스(`boards-index.tsx`), 탐색(`explore-list.tsx`), 트립 목록(`widgets/trips/trip-list-widget.tsx`).
- 프로필(`widgets/profile/profile-page.tsx`)의 탭 아래 목록은 제목 없이 바로 시작했다 → `SectionHeading` 을 넣어 탭별 제목("작성한 글"·"공개 트립"·"좋아요한 트립", `TAB_SECTION_TITLE`)을 스트립으로 세운다.
- 인트로 하단 두 섹션(`widgets/intro/intro-community-sections.tsx`)은 여백으로 구분하던 구조를 패널로 바꾼다: 패널 `flex flex-col gap-px bg-border` + 스트립 `bg-muted p-6`(`IntroSectionHeading` 의 `className`). 공개 표면은 심 색이 `bg-border` 라(ADR-0032 메인 결정) 그 토큰을 그대로 쓴다.

### 3. 게시판 셀 3개 (`features/community/board-cells.tsx` 신규)

- `DEFAULT_BOARDS` 를 `Button variant='cell' size='cell' asChild` + `Link`(→ `/boards/<key>`) 3셀로 그리는 순수 UI 컴포넌트다. 부모는 `flex flex-wrap items-stretch gap-px bg-background`, 오른쪽 남는 폭은 `aria-hidden` `bg-card` 채움 셀로 막는다. 컨테이너는 `nav aria-label='게시판 바로가기'`.
- 배치처는 두 곳이다: 커뮤니티 홈의 "최신 글" 섹션(`SectionHeading` 바로 아래), 비로그인 인트로의 "커뮤니티 최신 글" 섹션(심은 `bg-border`).

### 4. 카드 그리드는 auto-fit

- `features/community/public-trip-grid.tsx` 를 `grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]`(상수 `AUTO_FIT_COLUMNS_CLASS`) 로 바꾼다. 최소 폭 18rem 을 상수로 두고 브레이크포인트는 두지 않는다.
- 카드가 1개면 그 카드가 **전체 폭**을 차지하고, `min(100%, 18rem)` 이라 좁은 폭에서도 1열로 떨어진다(ADR-0034 §5 의 모바일 1열은 그대로 지켜진다).

### 5. 환경변수 안내는 `docs/env.md` 가 정본

- 키 목록·용도·발급 방법·로컬/Vercel/빌드 타임 여부를 `docs/env.md` 한 곳에 모은다. 런타임 검증 스키마(`shared/lib/env.ts`)와 `next.config.ts` 가 코드 정본이고, 이 문서는 "어디서 받아 어디에 넣는지" 를 더한 안내다.
- **값은 문서에 적지 않는다.** AI 는 `.env*` 를 읽지도 쓰지도 못하므로 `.env.example` 갱신도 사용자가 한다 — 붙여 넣을 블록을 `docs/env.md` §2 에 그대로 둔다.
- 지금 사용자가 채울 것은 **R2 5개**(`R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_BASE_URL`)와 **`APP_ENCRYPTION_KEY`** 다. 6단계 OAuth(GitHub·Naver)·이메일 인증(Cloudflare 메일 Worker) 키는 해당 단계 착수 시 이름을 확정하며 같은 문서에 추가한다.
- `docs/PROCESS.md` "사용자 작업" 과 `docs/HANDOFF.md` §6-7 은 키를 나열하지 않고 이 문서를 가리킨다.

### 6. 검증은 한 번만 (사용자 지시, ADR-0031 운용 메모 추기)

- 구현 에이전트가 `typecheck` · `lint` · `prettier` · `bun test`(필요하면 자체 브라우저 확인)까지 끝내면 **별도의 리뷰·실측·재확인 단계를 두지 않고 문서 → 배포로 간다.**
- 라이트·다크 전수 실측이나 리뷰 렌즈는 **사용자가 따로 요청할 때만** 넣는다. 4-4d·4-4e 처럼 "구현 → 리뷰 → 수정 → 실측 → 수정 → 재확인" 5단계로 도는 것은 과하다는 지적이다.
- 이 변경(4-4f)에는 그래서 별도 실측 절이 없다. QA 체크리스트에도 "실측 없음" 과 그 근거를 기록한다.

## 이유

헤더 드롭다운은 레일 tree(ADR-0034)와 같은 문제의 공개 표면 판이다. 비로그인 방문자는 레일을 못 보므로 게시판 3종에 도달하려면 `/boards` 를 한 번 더 거쳐야 했다. 활성 판정을 `isNavItemActive` 로 공유하면 레일과 헤더의 활성 규칙이 갈라지지 않는다.

섹션 스트립을 `bg-muted` 로 올리는 것은 새 규칙이 아니라 ADR-0011 이 이미 정한 3단 ladder 를 세로 방향에도 적용하는 것이다(DESIGN §3-3 three-tier rule). 스트립과 블록이 같은 톤이면 1px 심만으로 "여기서 섹션이 바뀐다" 를 전달해야 해서 계층이 무너진다.

auto-fit 그리드는 "카드 1개일 때 빈 열" 문제를 채움 블록을 덧대지 않고 레이아웃 자체로 푼다. 열 수를 브레이크포인트로 고정하지 않으므로 컨테이너 폭이 바뀌는 자리(인트로 max-w-5xl, 프로필 탭, 홈 섹션)마다 따로 조정할 필요가 없다.

## 기각된 대안

- **헤더에 게시판 4개를 인라인 셀로 나열**: 공개 헤더는 `Trip | 탐색 | 게시판 | 로그인 | 시작하기` 5셀이 이미 좁은 폭에서 빠듯하다. 셀 3개를 더하면 모바일에서 줄바꿈되고, 앱 셸(레일)과 정보 구조도 어긋난다.
- **드롭다운 대신 `/boards` 포털 페이지만 강화**: 지금도 인덱스가 게시판별 최신 5건을 보여준다. 문제는 "한 번 더 거쳐야 한다" 는 이동 비용이라 인덱스를 키워도 해소되지 않는다. 인덱스는 그대로 두고 헤더에 바로가기를 더했다.
- **섹션 사이 여백(`mt-10`)을 키워 경계를 만들기**: 인트로가 쓰던 방식이다. 보더 없는 정체성은 여백이 아니라 배경 계층으로 구분한다는 것이 ADR-0011 이고, 여백은 스크롤 길이만 늘린다.
- **그리드 빈 열에 `bg-card` 채움 블록을 덧대기**(QA 개선 후보 원안): 카드가 아닌 가짜 블록이 목록에 섞이고, 열 수마다 채움 개수를 계산해야 한다. auto-fit 은 계산 없이 같은 결과를 낸다.
- **`grid-cols-1 sm:2 lg:3` 을 유지하고 카드 1개일 때만 예외 처리**: 분기가 늘고 컨테이너 폭이 다른 배치처마다 다시 어긋난다.
