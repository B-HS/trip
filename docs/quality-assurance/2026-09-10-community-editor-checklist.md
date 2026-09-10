# QA 체크리스트 — 커뮤니티·프로필·에디터 (2026-09-10, 세션 3 4단계 → 세션 4 마무리)

> 개발 서버 `:3000`(세션 3) → **`:7777`(세션 4부터, PROCESS 진행 메모)**, Claude in Chrome(localhost 탭 줌 54%, 확대 캡처로 확인), 로그인 계정 tester. 입력은 페이지 내 스크립트(native setter + input 이벤트, ProseMirror 는 `execCommand('insertText')`, `.click()`)로 넣었다 — 브라우저 자동화의 `type`·`Return` 은 선택 탭·툴바 버튼으로 새어 신뢰할 수 없었다(ADR-0027 실측 메모).
> 세션 3 의 비로그인 표면은 headless Chrome 이 멈춰 `curl` HTML 로만 확인했고, 세션 4 는 `http://[::1]:7777`(쿠키가 분리된 루프백 호스트)로 시각 확인했다. 백그라운드 탭에서는 motion 페이지 fade·reveal 이 늦게 끝나 옅게 찍히므로 캡처 전 `[style*="opacity"]{opacity:1!important;transform:none!important}` 를 주입했다(측정용).

## 확인 완료 — 세션 3 (라이트·다크)

- [x] 커뮤니티 홈 `/`: 셸 레일(홈·탐색·게시판·트립 목록·새 트립), 섹션 6개, 공개 트립 카드, 빈 문구 — 라이트
- [x] 글쓰기 `/boards/free/new`: 제목·연결할 트립 Select·툴바 14셀(이미지 셀은 R2 미설정으로 disabled + 안내)·저장 바 — 라이트
- [x] 에디터: 굵게 토글·문단 분리(합성 Enter)·제목 2·YouTube 다이얼로그(잘못된 주소 거부, youtu.be 주소 → nocookie iframe) — 라이트
- [x] 글 등록 → 상세로 이동, 상세 본문 sanitize 결과(h2·strong·`youtube-nocookie.com/embed` iframe), 배지·작성자·카운트·트립 링크 셀(`/s/osaka-qa`), 액션 셀(좋아요·수정·삭제·목록) — 라이트·다크
- [x] 좋아요 토글(낙관적, `aria-pressed`, 헤더 카운트 동기) — 다크
- [x] 댓글 작성(줄바꿈 유지)·답글(들여쓰기)·답글 삭제(AlertDialog) — 다크
- [x] 글 수정 `/edit`: 제목·트립 Select·본문(iframe 포함) 프리필, 제목 변경 저장 → "수정됨" — 다크
- [x] 게시판 목록 `/boards/free`: 헤더·전체 n건·글쓰기 셀·검색(일치 1건 / 없음 문구) — 다크
- [x] 게시판 인덱스 `/boards`: 게시판 3개 + 최신 글 — 다크
- [x] 탐색 `/explore`: 정렬 셀 `aria-current` — 다크
- [x] 공유 페이지 `/s/osaka-qa`(로그인): 셸 안 렌더, 작성자 칩, 좋아요 0→1 — 다크(JS 확인, 스크린샷은 로딩 중 캡처)
- [x] 프로필 `/u/tester`: 대문 자리(bg-muted)·이름·@username·포인트·가입일·탭(`aria-current`)·글/좋아요한 트립 목록·프로필 설정 셀 — 다크
- [x] 프로필 설정: 이름·소개 저장 → 프로필에 반영, 업로드 셀 disabled + 안내(R2 미설정) — 다크
- [x] 비로그인(curl): `/` PublicFrame + 로그인·시작하기 링크 + 인트로 하단 섹션 2개 + `bg-border` 심, `/boards/free` 로그인 후 글쓰기 링크, 글 상세 로그인 후 댓글 쓰기·수정/삭제 셀 없음, `/u/tester` 설정 셀 없음, `/explore` 카드·정렬 current

## 확인 완료 — 세션 4 (2026-09-10)

- [x] 라이트 모드 재확인: 글 상세(헤더·본문·iframe·액션 셀·댓글), 게시판 목록(헤더·글쓰기 셀·검색·행), 프로필(대문 자리·헤더·포인트·탭·글 목록)
- [x] 질문 게시판 채택: tester 가 `/boards/qna/new` 로 질문 글 `ce90f6b2` 작성(조회 0 = 작성자 제외) → throwaway 계정 id 로 repository `createComment` 호출(브라우저 두 번째 로그인이 없어 대체) → 원장 `answer +2`(ref = 글) → tester 브라우저에서 "채택" 셀 → AlertDialog("채택은 되돌릴 수 없습니다") → 확인 → "채택됨" 배지, 채택 셀 사라짐, 원장 `accepted +10`(ref = 댓글), `accepted_comment_id`·`is_accepted` 반영, `/u/qa_session2_204103` 포인트 12
- [x] 삭제 흐름(임시 글 `64271607` 로, 남김 없음): 최상위 댓글 등록 → 댓글 "삭제" → AlertDialog → 댓글 0·헤더 카운트 0 → 글 "삭제" → AlertDialog → `/boards/free` 로 이동·목록에서 사라짐·"전체 1건", toast "댓글을 삭제했습니다."·"글을 삭제했습니다."
- [x] 비로그인 표면(`[::1]:7777`, 라이트·다크): 인트로 하단 "공개된 여행 일정"(카드 1 + `bg-border` 심)·"커뮤니티 최신 글" 섹션, 푸터. 글 상세: 좋아요(로그인 링크)·목록 셀, 댓글에 채택됨 배지, "로그인 후 댓글 쓰기" 셀, 수정·삭제 없음
- [x] 댓글 UI 정정 후 재확인(`7adc2fa`, 라이트·다크): 내용 블록 + 액션 셀 행 2블록, 중첩 답글(들여쓰기 + 같은 2블록), 답글 폼(textarea 블록 + 취소·등록 셀 행)
- [x] 공개 헤더 액션 셀(탐색·게시판·로그인·시작하기): 세션 4 후반에 확인(아래 절 E). 처음에는 `[::1]` 오리진이 하이드레이션되지 않아 미확인이었고, `allowedDevOrigins` 추가 + 세션 무관 셀 상시 렌더로 해소
- [ ] 관리자 삭제 UI: 관리자 계정이 없어 미실측(역할 판정 `canManagePost`·`canManageComment` 는 단위 테스트)
- [ ] 모바일(Sheet) — 기존 잔여와 동일

## 확인 완료 — 세션 4 후반 (2026-09-10, UI 정정 실측 · ADR-0034)

> 대상: 레일 게시판 tree · 편집기 행 정렬 · 트립 카드 배지 제거 · 모바일 1열 · 공개 헤더. 라이트·다크 양쪽. 실측은 Workflow 에이전트가 수행했다(ADR-0031 운용 메모).

### A. 레일 게시판 tree

- [x] 구조: `/boards/free` 에서 게시판 아래 자유·질문·후기가 `ul.ml-7.border-l.border-sidebar-border` 로 들여쓰여 렌더된다(라이트·다크 동일)
- [x] 활성 마커 단일성: `nav[aria-label="주요 메뉴"] [aria-current="page"]` 가 1개("자유")이고 부모 "게시판"(`/boards`)에는 없다. 활성 배경 `motion.span`(absolute, `layoutId`)도 1개
- [x] 접힘/펼침: Cmd+B 로 접으면 하위 `ul` 이 사라지고 부모 "게시판" 아이콘 행이 `aria-current='page'` 로, 다시 펼치면 자식 3개 복귀 + 활성이 "자유" 1개로 복귀
- [x] `/boards` 상태: 부모만 `aria-current='page'`, 자식 3개는 없음
- [x] 라벨 정렬: 자식 라벨 left 41px / 부모 40px(`border-l` 1px 차이)
- [x] 다크 트리선: border `lab(15.74)` vs 사이드바 배경 `lab(0.85)` — 확대 없이 세로선 식별
- [x] 라이트 트리선(수정 후 재확인): `--sidebar-border` `lab(66.128)` vs 배경 `lab(90.14)` = ΔL\* 24.0 / 대비 2.016:1. 1:1 캡처가 되는 500px 창에서 확대 없이 육안 식별

### B. 편집기 행 정렬

- [x] 일정 종류 탭: 드래그 핸들·번호 `01`·"이름" 라벨의 중심선 동일(183), 삭제 셀 높이 78px = 행 높이 78px(휴지통 세로 중앙, 라이트·다크)
- [x] 날짜 탭 행: `번호 | 탭 라벨(mono muted) | 제목` 세 텍스트 중심선 동일(165), 삭제 셀 40px = 행 40px
- [x] 탭 라벨 폭: "히메지 · 코베" 가 `min-w-20 max-w-32`(80px) 안에서 `scrollWidth <= clientWidth` 로 안 잘리고, 긴 제목만 truncate
- [x] 여행 정보 탭: 패널 헤더 "섹션 추가" 셀(62px), 섹션 헤더 `[기본 펼침 스위치+라벨][블록 추가][섹션 삭제]` 세 셀 모두 40px·중심 261px 로 같은 높이 셀 행(`gap-px bg-background`)
- [x] 블록 삭제 셀: 242px 로 블록 행 전체 높이와 같고 휴지통이 세로 중앙, hover 시 "블록 삭제" 툴팁(`role=tooltip`)
- [x] 항공·숙소 탭: 핸들/번호/라벨 중심선 동일(183·460·845), "항공편 삭제" 276px = 행 276px, "숙소 삭제" 210px = 행 210px
- [x] 무변경 이탈: 값을 바꾸지 않은 상태(hover·읽기만)에서 탭·페이지 이동 시 확인 다이얼로그가 뜨지 않음

### C. 트립 카드 텍스트화

- [x] `/trips`: `data-slot="badge"` 0개, 상태·역할이 "예정 D-21 · 소유자" mono 메타(`text-2xs`, tabular), 목적지는 "JP 오사카" 텍스트(라이트·다크)
- [x] `/explore`·`/u/tester?tab=trips`: 배지 0개, 나라 코드·도시가 칩이 아니라 텍스트. `article` 안에서 배경색을 가진 요소는 작성자 아바타 fallback 원형뿐

### D. 모바일 1열

- [x] 1열 레이아웃: 좁은 폭에서 `/explore`·`/u/tester?tab=trips`·`/` 의 `grid-template-columns` 가 단일값, `/boards/free` 도 1열 목록
- [x] 가로 넘침 없음: 네 화면 모두 `documentElement.scrollWidth === innerWidth`(500 === 500)
- [x] 모바일 셸: 레일이 사라지고 상단 바 햄버거 → Sheet, Sheet 안에도 게시판 tree(`ml-7 border-l`)가 그려지고 `aria-current` 는 "자유" 1개
- [x] 카드 폭(수정 후 재확인): `li` = `article` (데스크톱 1007 = 1007, 500px 뷰포트 500 = 500, 390px 강제 시뮬레이션 390 = 390) — 오른쪽 `bg-background` 띠 없음

### E. 공개 헤더 (수정 후 확인)

- [x] `[::1]:7777` 라이트·다크에서 헤더가 `Trip | 탐색 | 게시판 | 로그인 | 시작하기` 로 완전히 렌더. 셀 폭 탐색 53 / 게시판 63 / 로그인 63 / 시작하기 74(cellPrimary 반전 배경), ThemeToggle 아이콘도 테마에 맞게 전환
- [x] 하이드레이션: `[::1]:7777` 이 5.3초에 완료(ThemeToggle `disabled=false`, `body opacity=1`). 20초 백지 증상 재현 안 됨. `/_next/*` 요청이 `[::1]`·`127.0.0.1`·`localhost` 세 오리진 모두 200
- [x] SSR HTML: `<header>` 안 링크가 `[('/', 'Trip'), ('/explore', '탐색'), ('/boards', '게시판')]` — 세션 미확정 구간에도 헤더가 비지 않음

### F. 댓글

- [x] `/boards/qna/ce90f6b2`: 댓글이 내용 블록(작성자·시각·채택됨 + 본문) + 셀 행(답글) 2블록 + 1px 심으로 렌더

### 미확인 / 도구 제약 (세션 4 후반)

- 390px 뷰포트: Chrome 창 최소 폭이 500px 이라 `resize_window(390,844)` 가 성공을 반환해도 `innerWidth` 는 500. 실제 500px 창 + `ul` 390px 강제 시뮬레이션으로 대체했고, 390px 고유의 줄바꿈·겹침은 확인하지 못했다
- 3024px 창에서는 스크린샷이 1456px 로 다운샘플되어 1px 보더가 캡처에서 소실된다. 트리선 판정은 1:1 캡처가 되는 500px 창에서 했다
- 테마 전환은 `localStorage('theme')` 설정 후 **navigate 로 새로 로드**해야 반영된다(같은 호출 안의 `location.reload()` 는 이전 테마로 측정될 수 있다)
- 로그인 상태 공개 헤더("탐색·게시판+홈" 분기)는 일상 경로에서 관측되지 않는다 — `(shell)` 레이아웃이 서버 세션이 있으면 `AppFrame` 을 고르고, `(public)` 의 `/login` 은 로그인 상태에서 `/` 로 리다이렉트된다. 서버·클라이언트 세션 판정이 어긋나는 구간의 방어 분기이며 단위 테스트로 덮었다
- 관리자 삭제 UI·모바일 Sheet 포커스 복귀는 기존 잔여와 동일

## 확인 완료 — 세션 4 지구본·출발 공항 (2026-09-10, 4-4e 실측 · ADR-0035)

> 대상: 편집기 출발 공항 콤보박스, `/trips` 헤더 지구본의 드래그 회전·hover 툴팁·선 클릭 필터. 라이트·다크 양쪽. 실측은 Workflow 에이전트가 수행했다(ADR-0031 운용 메모).

### A. 편집기 출발 공항

- [x] 필드 존재·초기값: `/trips/905b4695…/edit` 기본 정보 탭에 "출발 공항" 필드가 있고 저장값이 비어 있다(`input.value=''`, placeholder "공항 검색"), 힌트 "고르지 않으면 기본 ICN 으로 계산합니다." 노출(라이트·다크)
- [x] 높이 정렬: 콤보박스 `getBoundingClientRect().height` 32px 로 같은 행의 제목·목적지 입력과 동일(32 / 32 / 32)
- [x] 옵션: `[role=option]` 43개(`shared/constant/airports.ts` 의 `AIRPORTS` 43개와 일치). 첫 3개 ICN 인천(서울) / GMP 김포(서울) / PUS 김해(부산), 마지막 DXB·DOH
- [x] 검색: 도시명("부산")·소문자 IATA("pus") 모두 1건으로 좁혀지고, 무매칭("zzzz")이면 "일치하는 공항이 없습니다."
- [x] 선택·dirty: 선택 시 입력값이 `PUS · 김해(부산)` 로 채워지고 clear(X) 버튼이 나타나며 저장·되돌리기 버튼이 활성화된다
- [x] 되돌리기: "되돌리기" 로 원복 후 `input.value=''`, 저장·되돌리기 재비활성. 실측 종료 후 재진입해도 오사카 트립의 출발 공항은 비어 있다(저장하지 않음)

### B. 생성 폼과 경로 체인

- [x] `/trips/new` 에는 출발 공항 필드가 없다(ADR-0035 §2 "생성 폼에는 노출하지 않는다")
- [x] 임시 트립(JP 삿포로)에서 출발 공항 PUS 저장 → toast "기본 정보를 저장했습니다.", 저장 버튼 재비활성
- [x] 항공편이 없는 트립에 `PUS → JP` 호가 추가되고 지구본 sr-only 문구가 "…부산에서 JP 삿포로까지."로 갱신. panel variant 는 `showLabels:false` 라 라벨 `ul` 을 그리지 않아 sr-only·툴팁으로 확인했다

### C. 드래그 회전

- [x] 포인터가 컨테이너에 들어가면 자동 회전이 멈추고(연속 캡처 2장 동일), 가로 200px 드래그로 크게 회전(아시아→아프리카→남아메리카). 컨테이너 className 에 `cursor-grab active:cursor-grabbing`
- [x] 드래그를 놓아도 필터가 걸리지 않는다: URL `/trips`(`?route=` 없음), 해제 셀 미노출, 목록 2건 유지(`CLICK_DRAG_THRESHOLD`)

### D. hover 툴팁

- [x] 호 위에서 DOM 오버레이 툴팁 2줄: `KIX → ICN · 오사카 → 서울` + `오사카 여행 노트 · 2026.10.01 – 10.07 (목–수)`(임시 트립 호는 `PUS → JP · 부산 → 삿포로`)
- [x] 컨테이너 밖으로 넘치지 않음: 컨테이너 rect(x268 y110 w2139 h224) 대비 툴팁 rect(x1417 y236 w224 h59)가 x·y 모두 내부(`placeGlobeTooltip` 클램프). 호 hover 중 컨테이너 `cursor: pointer`
- [x] 호에서 벗어나면 툴팁이 DOM 에서 제거된다

### E. 선 클릭 필터

- [x] 호 클릭 → URL `/trips?route=ICN-KIX`, 헤더에 `ICN → KIX 필터 해제` 셀(X 아이콘), 목록이 해당 경로 트립 1건만(motion exit 완료 후 `li` 1개)
- [x] 같은 호 재클릭·해제 셀 클릭 모두로 해제되고 URL 이 `/trips` 로 정리된다
- [x] 새로고침 유지: `/trips?route=ICN-KIX` 재진입 시 필터·해제 셀 유지(서버 `searchParams` → `initialRoute`)
- [x] 없는 경로: `/trips?route=ZZ-YY` 진입 시 필터가 걸리지 않고 목록 전체가 보이며 URL 이 `/trips` 로 정리(`hasStaleRoute`)
- [x] 통계 타일은 필터와 무관하게 전체 기준(트립 2 / 일정 65 / 예매 9), 사이드바 즐겨찾기 레일도 영향 없음
- [x] 선택 강조: 필터 적용 시 선택된 호만 굵고 밝은 글로우, 나머지는 흐린 회색. 해제 상태에서는 모든 호가 같은 idle 굵기(라이트·다크)

### F. 회귀·비상호작용 지구본

- [x] `/`(로그인 커뮤니티 홈)·`/s/osaka-qa`·`/trips/905b4695…`(뷰어) 정상 렌더, 세션 중 콘솔 error·exception 0건
- [x] 인트로 히어로(`[::1]:7777`): 컨테이너 className 이 `relative w-full h-80 sm:h-96 lg:h-[28rem]` 로 `cursor-grab`·`cursor-pointer` 없음(= `dragRotate`·`onRouteSelect` 미적용, OrbitControls 미렌더). 드래그 후에도 URL·클래스 변화 없고 툴팁도 뜨지 않는다. 라벨 `ul`("서울 ICN → 오사카 KIX" 등)과 "예시로 표시한 경로입니다." 문구 정상
- [x] 404 페이지 지구본(panel, `showTooltip`·`onRouteSelect` 없음): 호를 호버해도 툴팁·강조가 없고 컨테이너 cursor 가 `auto`(핸들러 미등록)

### 히트 반경 수정 후 재확인 (should 지적 반영)

- [x] 코드: 별도 히트 튜브 mesh·`ARC_HIT_SCALE`·`ARC_HIT_RADIAL_SEGMENTS`·`hitRadius` prop 이 모두 제거되고, 포인터 핸들러가 `hitTestHandlers` 스프레드로 글로우 튜브 mesh(`tubeRadius * ARC_GLOW_SCALE`)에 직접 붙는다. 호당 mesh 는 글로우 + 코어 2개(+트래블러)
- [x] 반경 축소 실측: 지구본을 world 반경 ≈196 스크린샷 px 로 키운 상태에서 세로 스윕 결과 idle 히트 밴드가 약 12px(글로우 3.4배 예상 지름 ≈10px 과 일치, 이전 8배 히트의 ≈23px 과 명백히 다름). 어두운 마커 클러스터 내부는 전부 미검출
- [x] 이웃 호 오검출 해소: 확대 상태 가로 스윕에서 `KIX → ICN` 과 `PUS → JP` 가 x 8px 간격으로 분리되고, 기본 패널 크기(반경 ≈75px)에서도 7px 떨어진 두 점이 각각 다른 호를 반환한다
- [x] 클릭·드래그: 호 클릭은 `?route=ICN-KIX` 토글, 호 위에서 시작한 드래그는 선택을 만들지 않는다
- [x] 다크: 호 렌더·호버·툴팁(밝은 배경 + 어두운 글자) 정상. 콘솔은 R3F 내부의 기존 경고 `THREE.Clock: This module has been deprecated` 1건뿐

### 미확인 / 도구 제약 (세션 4 지구본)

- 자동화 탭의 `document.visibilityState` 가 `hidden` 이라 `requestAnimationFrame` 이 돌지 않는다(3초 0프레임). WebGL 렌더와 motion 이 캡처가 강제하는 프레임에서만 큰 delta 로 진행해 (a) 자동 회전이 캡처마다 10~20도 점프, (b) 필터 직후 `AnimatePresence` exit 중인 카드가 한 프레임 남아 두 건으로 보임, (c) 통계 타일 count-up 이 0 에서 멈춘 채 찍힘. (b)(c) 는 앱 결함이 아니라 이 환경의 아티팩트
- 호 hover 는 캡처 직후 얼어붙은 방향 기준으로만 좌표가 맞았다(CDP hover 39회 중 초반 20회 실패). 포인터를 컨테이너에 넣으면 회전이 멎어 그 상태에서 프로브했고, 재확인 때는 `requestAnimationFrame` 을 페이지에서 임시로 무력화해 자전을 세웠다(코드 변경 아님, 새로고침으로 소멸)
- JS 합성 `PointerEvent` 격자 스캔은 프로브 1회당 ≈0.9초로 45초 CDP 타임아웃이 반복돼 폐기했다. R3F raycast 가 합성 이벤트를 타는지는 확인하지 못했다
- `zoom` 은 스크린샷을 약 1.85배 업스케일할 뿐 해상도를 주지 않아, 확대 판정 시 지구본 컨테이너 `height`(224 → 760~900px)·`max-width` 만 인라인 style 로 임시 확대한 뒤 새로고침으로 원복했다(코드 무변경). "보이는 선의 가장자리"와 "히트 경계"를 서브픽셀로 겹쳐 비교하지는 못했다(WebGL 캔버스 픽셀 되읽기 불가)
- 세션 중 브라우저 창 폭이 한 번 바뀌어(1920 → 2419) CSS 좌표가 달라졌다. 단계마다 `getBoundingClientRect` 로 배율을 다시 계산해 보정했다. `resize_window` 는 지시대로 쓰지 않았다
- 인트로 히어로의 "자동 회전만" 은 캡처 사이 위치 변화 + 클래스 부재로 판정했고, 자동 회전과 드래그 회전을 화면만으로 분리 판정하지는 못했다
- 빈 상태 지구본(`interactive={false}`)과 로그아웃 상태 인트로 히어로는 확인하지 못했다(트립이 남아 있어 빈 상태가 뜨지 않고, 로그아웃은 세션 유지 지시상 미시도)
- 네 번째 호 `ICN → JP`(lift 가 가장 낮음)는 샘플링으로 잡지 못했다. 리프트가 큰 호에 가려 최근접 히트가 다른 호로 잡히는 것으로 보이며 얇은 튜브에서는 정상 동작이지만, "호버 가능" 을 직접 확인하지는 못했다
- 테마 측정을 위해 localhost 의 `localStorage.theme` 을 light/dark 로 바꿔가며 확인했고 종료 시 `light` 로 두었다(원래 값은 알 수 없다)

### 임시 데이터 (정리 완료, 남김 없음)

- 트립 "세션 4 지구본 실측"(`57684d15`) — 카드 더보기 → 삭제 → AlertDialog → toast "여행을 삭제했습니다." 로 제거. 재접속 후 `/trips` 트립 수 1, sr-only 도 ICN↔KIX 2개로 복귀
- 히트 반경 재확인용 임시 트립 2건(`zz-temp-a` PUS→JP 삿포로, `zz-temp-b` 기본 출발→JP 도쿄)도 UI 삭제 다이얼로그로 제거. 최종 상태는 "오사카 여행 노트" 1건
- 오사카 트립의 출발 공항은 A 항목에서 PUS 로 바꿨다가 "되돌리기" 로 원복했고 저장하지 않았다(재확인 시 non-dirty)

## 세션 4 공개 게시판 메뉴·섹션 계층·그리드 (2026-09-10, 4-4f · ADR-0036) — 실측 없음

> **이 변경에는 브라우저 실측 절이 없다.** 사용자 지시로 검증을 한 번만 하기로 했다(ADR-0036 §6, PROCESS 진행 메모): 구현 단계에서 typecheck·lint·prettier·`bun test` 를 끝내면 별도의 리뷰·실측·재확인 단계를 두지 않는다. 라이트·다크 전수 실측이나 리뷰 렌즈는 사용자가 따로 요청할 때 넣는다.

- 검증 결과: typecheck·`bun run lint`·`bun run format:check`·`bun test` 528 통과(4-4e 506 → 신규·보강 테스트 22건).
- 자동 테스트로 덮은 것: 공개 헤더 게시판 드롭다운(항목 4개·href·`aria-current`), `BoardCells`(게시판 3셀·href), `SectionHeading` 스트립이 `bg-muted`·"더 보기" 셀이 `bg-card`, 커뮤니티 홈·게시판 인덱스·탐색·인트로·프로필 위젯의 섹션 구조(공용 리포지토리 목은 `tests/support/community-repository-mock.ts`).
- 화면으로만 확인할 수 있어 이번에 보지 않은 것(요청 시 실측 대상): 드롭다운 열림·닫힘과 포커스 이동, `bg-muted` 스트립의 라이트·다크 대비, auto-fit 그리드가 실제 폭에서 나누는 열 수(카드 1개 = 전체 폭 포함), 인트로 패널의 `bg-border` 심.

## 발견·수정

- 세션 3: ProseMirror `attrs`(null 프로토타입)가 서버 액션에서 `$T` 로 직렬화돼 본문 저장 실패 → `toPlainDocument` 정규화(ADR-0027 실측 메모).
- 세션 3: 링크·YouTube 다이얼로그 폼 제출이 포털을 타고 글 폼까지 버블링 → `stopPropagation`.
- 세션 4: 댓글 액션 셀 행이 카드 패딩 안에 있어 심이 한쪽만 생기고 셀이 떠 보임(사용자 지적) → 내용 블록 + 별도 셀 행(`7adc2fa`, ADR-0032 구현 메모).
- 세션 4 후반(실측 지적 4건, ADR-0034 §6):
    - [must] `[::1]:7777` 이 하이드레이션되지 않아 비로그인 헤더를 볼 수 없었다 → Next 16 의 크로스 사이트 dev 차단이 `[::1]`·`127.0.0.1` 오리진의 `/_next/*` 를 403 으로 막는 것이 원인(curl 로 403 → 설정 후 200 확인) → `next.config.ts` `allowedDevOrigins`(dev 전용).
    - [should] `PublicHeaderActions` 가 `!isPending` 으로 헤더 전체를 감싸 첫 페인트에 헤더가 비었다 → 탐색·게시판 셀은 항상 렌더하고 로그인/시작하기 ↔ 홈 분기만 세션 결과로. 단위 테스트 4건 추가.
    - [should] 라이트 모드 트리선이 사이드바 배경과 대비 1.05:1 로 사실상 안 보였다 → 라이트 `--sidebar-border` 를 `--palette-neutral-708` 로(2.016:1). `border-border` 안은 라이트 `--border`(0.922)가 배경(0.915)보다 밝아 더 나빠져 기각.
    - [should] 공개 트립 카드가 컬럼 폭을 못 채우고 오른쪽에 `bg-background` 띠가 남았다(`li` 가 flex, `article` 이 `max-content` 285.8px) → `article` 에 `w-full`. 테스트 1건 추가.
    - [nit] `app-shell.tsx` 의 `constant/community` import 가 alias 그룹 안에서 경로 순서에 어긋난다(자동 정렬 플러그인 없음) — 반영 대상에 없어 남아 있다.
- 세션 4 지구본·출발 공항(실측 지적 2건, ADR-0035 구현 메모):
    - [should] 호 히트 반경이 ADR-0035 §5 결정과 달랐다 — 구현이 글로우 튜브 대신 `colorWrite=false` 히트 튜브(`ARC_HIT_SCALE` 8배, panel idle 0.056 world)를 따로 겹쳐, 그려진 어떤 선보다 약 2.35배 넓었고 출도착이 몰린 구간에서 `ICN↔KIX` 호에서 2~4px 떨어진 좌표가 계속 `PUS → JP` 툴팁을 반환했다 → 별도 히트 mesh·`ARC_HIT_SCALE`·`ARC_HIT_RADIAL_SEGMENTS`·`hitRadius` prop 을 제거하고 글로우 mesh 에 포인터 핸들러를 직접 붙였다(제안 a). 호당 draw call 3 → 2. 재확인은 위 "히트 반경 수정 후 재확인" 절.
    - [nit] 드롭다운 목록 행 표기가 ADR-0035 §2 예시(`코드 · 이름(도시)`)와 1:1 이 아니다 — 선택된 입력값은 `PUS · 김해(부산)` 로 정확하지만, 목록 행은 코드(mono 열)와 `이름(도시)` 두 span 이라 가운데 `·` 가 없다. 코드 열 정렬이 목록에서 더 읽기 쉬워 UI 를 두고 **ADR §2 를 정정**하는 쪽으로 처리했다(ADR-0035 구현 메모 "§5·§6 결정에서 달라진 것").
    - `trip-globe-scene.tsx` 를 렌더하는 테스트는 없다(`tests/shared` 는 `globe-interaction`·`globe-math`·`globe-geography` 순수 모듈만 덮는다). R3F 씬 테스트는 `@react-three/test-renderer` 의존성이 필요해 이번 범위 밖으로 뒀다.

## 관찰 (수정 안 함)

- 글 삭제 직후 `GET /api/posts/{삭제된 id}/like` 가 404 로 한 번 찍힌다(삭제 성공 후 목록으로 이동하기 전 좋아요 쿼리 refetch). 화면 영향·에러 toast 없음. 4-5 소프트 삭제에서 다시 본다.
- 채택 확인 뒤 AlertDialog 닫힘 애니메이션이 백그라운드 탭에서는 수 초 걸린다(도구 한계, 실제 사용에는 무관).

## 발견된 개선 후보

- 프로필 대문 자리(`aspect-3/1`)가 넓은 화면에서 지나치게 높다 → 높이 상한 검토(4-5)
- ~~공개 트립 그리드에 카드가 1개일 때 나머지 열이 `bg-background` 로 비어 보인다(비로그인 인트로 하단에서도 동일)~~ → 4-4f 에서 auto-fit 그리드로 해소(카드 1개면 전체 폭, ADR-0036 §4). 채움 블록 안은 기각
- 편집 페이지 초기 렌더가 dev 서버 컴파일로 2초 이상 걸릴 때 폼이 늦게 마운트된다(prod 는 해당 없음)

## QA 데이터 (사용자 결정: 전부 유지, 나중에 한 번에 삭제)

| 항목                                             | 상태                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- |
| 자유게시판 글 `050aa2f0` "세션 3 QA 글 - 수정됨" | 댓글 1(tester)·좋아요 1(tester)·오사카 트립 연결               |
| 질문 글 `ce90f6b2` "세션 4 채택 실측 질문"       | 댓글 1(qa_session2_204103, 채택됨), `accepted_comment_id` 설정 |
| 포인트 원장                                      | qa_session2_204103: answer +2, accepted +10                    |
| 오사카 트립 `905b4695`(`osaka-qa`)               | 좋아요 1(tester), like_count 1                                 |
| tester 소개                                      | 25자                                                           |
