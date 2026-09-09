# 2026-09-09 — trip 프로젝트 스택·범위 합의

> 사용자(Hyunseok Byun)가 첫 세션에서 확정한 결정. 이후 세션은 이 문서를 전제로 진행한다.

## 제품 범위

- `docs/osaka-trip-interactive.html`(정적 오사카 일정 페이지)을 로그인 기반 다중 트립 앱으로 재구현한다.
- 라우트
    - `/` 로그아웃 상태: 소개 페이지(Surface B, 3D 히어로). 로그인 상태: `/trips` 로 리다이렉트.
    - `/login` 소셜 로그인(GitHub · Google).
    - `/trips` 목록, `/trips/new` 생성, `/trips/[id]` 뷰어(원본 HTML 화면), `/trips/[id]/edit` 구조화 편집기, 삭제는 다이얼로그.
    - `/s/[slug]` 공개 읽기 전용 공유 페이지(ISR).
- 배포 도메인 `https://trip.gumyo.net`, Vercel 배포는 사용자가 직접. 레포 주소는 완성 후 사용자가 제공.

## 결정 (질문 번호 = 첫 질문 묶음)

| #   | 항목             | 결정                                                                                                           | 이유·비고                                                                                                               |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | 데이터 모델      | **B안 — 전부 구조화**(Markdown 필드 없음)                                                                      | 확장성·개발 정확성. 산문도 문단·불릿·링크 단위 행으로 저장                                                              |
| 2   | 오사카 원본 반입 | 구조화 완료 후 **AI 가 데이터 투입**                                                                           | 사용자 없이 FK 를 만족할 수 없어 템플릿 상수 + 시드 스크립트 + 앱 내 "예시 트립 만들기" 로 제공                         |
| 3   | 공유 범위        | **C안 — 공동편집자 초대 + 공개 읽기 전용 링크**                                                                | A+C 를 묻자 "그러면 C"                                                                                                  |
| 4   | 체크·메모 저장   | **DB, 사용자별(trip × user)**                                                                                  | 기기 간 동기화. 활성 날짜·뷰는 URL 파라미터                                                                             |
| 5   | 인증             | **better-auth 자체 운영, 이메일·비밀번호 회원가입/로그인 + `username` 플러그인(사용자명 로그인)**              | OAuth 없음(사용자 추가 지시 2026-09-09). b-hub(공유 백엔드) 사용하지 않음. 이 앱 단독. 이메일 인증 없음(메일 서버 없음) |
| 6   | 프리픽스         | 테이블 **`trip_`**(auth 테이블 포함), 쿠키 **`cookiePrefix: 'trip'`**                                          | 같은 DB 의 타 프로젝트 테이블·세션 쿠키와 충돌 방지                                                                     |
| 7   | 지도             | **임베드 없음.** 원본처럼 "지도 열기" 링크 → Google Maps 검색 URL 에 질의 자동 입력                            | API 키 불필요                                                                                                           |
| 8   | 모션             | **`motion`(framer 후속) 을 최대한 활용.** 기본 틀은 DESIGN.md 이되 모션은 반드시 들어간다                      | DESIGN §7 의 "페이드만" 제약은 의도적으로 완화(디자인 변경으로 기록). `prefers-reduced-motion` 대응 유지                |
| 9   | Three.js         | **메인 히어로뿐 아니라 사용 중 도움이 되는 곳 전부**                                                           | 인트로·로그인·목록 헤더·트립 상세 사이드바·빈 상태·공유 페이지·404 등. R3F + drei, 지연 로드·오프스크린 정지            |
| 10  | 도구             | **bun** + **git**(main). 자동 커밋 ON(`git config llm-rules.auto-commit true`), push 는 레포 주소 수령 후 수동 | 컨벤션 기본 + Calendar 레포 동일                                                                                        |
| 11  | DB               | **Turso → MySQL 로 변경.** 사용자가 `.env` 에 `DATABASE_URL` 을 미리 넣음. 스키마명 `trip`                     | drizzle-orm `mysql2` 드라이버, drizzle-kit `generate` + `migrate`(push 금지)                                            |

## 전제(사용자 미반박 → 채택)

- 스택: Next 16.3 · React 19.2 · Tailwind 4.3 · shadcn 4 · drizzle-orm 0.45 · better-auth 1.7 · TanStack Query 5 · zod 4 · react-hook-form 7 · motion 13 · three 0.186 + @react-three/fiber 9 + drei 10 · lucide-react · dayjs · sonner · next-themes · @dnd-kit.
- TypeScript **5.9 고정**(7.0 은 도구 호환 미검증).
- 테스트 러너 `bun test` + happy-dom + Testing Library.
- 렌더링: `/` 정적, `/s/[slug]` ISR + `revalidateTag`, 인증 페이지 동적 + 서버 프리페치(`HydrationBoundary`).
- UI 한국어 단일, 라이트·다크 지원, 웹폰트 없이 시스템 폰트(DESIGN §5-2), 인쇄 스타일 유지, 이모지 없음.
- `.env` 는 사용자 지시로 AI 가 `echo >>` 로 키를 추가한다(컨벤션의 .env 접근 금지보다 사용자 지시 우선). 값을 읽거나 출력하지 않는다. 키: `DATABASE_URL`(사용자 제공) · `BETTER_AUTH_SECRET`(openssl 생성) · `BETTER_AUTH_URL` · `NEXT_PUBLIC_APP_URL` · `SEED_OWNER_EMAIL`.
- README.md 는 지시 전까지 손대지 않는다.

## DESIGN.md 대비 의도적 변경(기록)

- §7-3 "오버레이는 즉시 열림" → shadcn 오버레이 애니메이션(`tw-animate-css`) 사용, 목록·전환에 `motion` 적용. 사용자 지시(8번).
- §7 "슬라이드·스케일·stagger 금지" → 허용. 단 토큰(0.18s / 0.24s / `cubic-bezier(0.4,0,0.2,1)`)은 기본값으로 유지하고 `prefers-reduced-motion` 시 정적.
- Surface B(공개 페이지)에 3D 캔버스 추가. Surface A 에도 보조적 3D(사이드바 미니 지구본 등) 추가.

## 관련 문서

- 작업 체크리스트: `docs/PROCESS.md`
- 데이터 모델 상세: `docs/memory/data-model.md`(스키마 확정 시 작성)

## 추가 결정 (같은 날)

- **브랜치**: 커밋 가드 훅이 `main` 직접 커밋을 차단한다. 스캐폴딩 첫 커밋만 main 에 있고, 이후 작업은 `feat/trip-app` 브랜치에서 자동 커밋한다. main 머지·push 는 사용자 지시 시에만.
- **인증 변경**: OAuth 없이 이메일·비밀번호 회원가입/로그인 + better-auth `username` 플러그인(사용자명 로그인). 이메일 인증 없음.
- **shadcn 컴포넌트 적극 활용(사용자 재강조)**: https://ui.shadcn.com/docs/components 의 전 컴포넌트를 `shared/ui` 에 설치해 두었다(55개: accordion·alert·alert-dialog·aspect-ratio·avatar·badge·breadcrumb·button·button-group·calendar·card·carousel·chart·checkbox·collapsible·combobox·command·context-menu·dialog·drawer·dropdown-menu·empty·field·hover-card·input·input-group·input-otp·item·kbd·label·menubar·native-select·navigation-menu·pagination·popover·progress·radio-group·resizable·scroll-area·select·separator·sheet·sidebar·skeleton·slider·sonner·spinner·switch·table·tabs·textarea·toggle·toggle-group·tooltip). 새 UI 를 손으로 만들기 전에 반드시 해당 shadcn 컴포넌트가 있는지 먼저 확인하고 있으면 그것을 쓴다. 매핑 예: 앱 셸 레일 → `sidebar`, 경로 표시 → `breadcrumb`, 빠른 이동 → `command`(Cmd+K), 날짜 → `calendar`+popover(date picker), 공항 코드 → `combobox`, 뷰 전환 → `toggle-group`/`tabs`, 이동 경로 블록 → `collapsible`, 멤버 정보 → `hover-card`, 안내 → `alert`, 카드 우클릭 → `context-menu`, 편집기 분할 → `resizable`, 통계 → `chart`, 인트로 쇼케이스 → `carousel`, 모바일 액션 → `drawer`, 상태 → `badge`·`progress`·`skeleton`·`empty`·`spinner`.
- **레포·브랜치(2026-09-09)**: 원격 `https://github.com/B-HS/trip`. `main` = 프로덕션(Vercel 배포 대상), `dev` = 작업 브랜치(기존 `feat/trip-app` 을 rename). 작업 커밋은 dev 에 쌓고 사용자 지시 시 main 에 머지·push.
- **모션 감소(OS) 무시(2026-09-09)**: 사용자 환경이 OS `prefers-reduced-motion: reduce` 라 지구본이 멈춰 보였고, 사용자는 모션이 항상 동작하길 원한다. OS 설정은 따르지 않고(`MotionConfig reducedMotion='never'`, CSS 미디어 블록 제거) 앱 내부 설정 `shared/hooks/use-motion-preference.ts`(localStorage `trip-motion`, 기본 `full`)로만 모션을 줄일 수 있게 한다. 토글 UI 는 Phase 3 에서 셸 사용자 메뉴에 추가.
- **파비콘**: Calendar 레포의 `app/favicon.ico` 를 그대로 사용.
- **3D 배치 원칙(사용자 지적 2026-09-09)**: 정보가 없는 장식용 3D(뷰어 사이드바의 미니 지구본)는 금지 → 제거. 3D 는 경로·데이터를 실제로 보여주는 곳(인트로 히어로, 목록 헤더의 전체 경로, 빈 상태 안내)에만 두고, 그 외에는 넣지 않는다.
- **배경 계층(사용자 지적 2026-09-09)**: 셸 레일만 tier 1(bg-sidebar). 콘텐츠 블록은 tier 3(bg-card), 표 헤더·안내 스트립은 bg-muted. 레일과 콘텐츠 사이에 1px 심이나 12px 인셋을 두지 않는다(색 계층으로만 분리). 콘텐츠 블록 사이의 1px 심은 유지.
- **초기 로딩 스켈레톤 금지 → PPR(cacheComponents) 해제(사용자 지적 2026-09-09)**: `cacheComponents: true` 는 동적 데이터를 Suspense 폴백 뒤로 스트리밍해 첫 화면에 스켈레톤이 보였다. 해제하고 페이지가 서버에서 TanStack `prefetchQuery` 로 데이터를 채운 완성 HTML 을 내려주도록 바꿨다(`HydrationBoundary`). `loading.tsx`·페이지 Suspense 폴백 제거. 서버 캐시는 공개 공유 페이지만 `unstable_cache`(태그 `trip:share:<slug>`, 1시간) + 변경 시 `updateTag`·`revalidatePath`. 목록·상세는 DB 직접 조회(클라이언트 캐시는 TanStack Query). 뷰어의 `?view=&day=` 초기값은 페이지 `searchParams` → props 로 전달하고 클라이언트는 `history.replaceState` 로만 동기화.
- **구역 색 계층 확정(사용자 지적 2026-09-09)**: 레일 `bg-sidebar` → 콘텐츠 사이드바 컬럼 `bg-muted`(콘텐츠 영역 전체 높이, 내부 sticky) → 탭 스트립은 `bg-background` 위에 활성 탭만 `bg-card`(밑줄·보더·그림자 없음) → 콘텐츠 블록 `bg-card`. 콘텐츠 영역은 최소 뷰포트 높이(dvh)를 채우고, 마지막 블록 아래는 `bg-card` 채움 블록으로 마감한다(뷰어·편집기·목록 공통). 목록 카드는 그리드 대신 세로 행 목록(빈 그리드 셀이 배경으로 남는 것 방지).
- **트립 목적지(나라) 지정(사용자 요청 2026-09-09)**: 지구본이 실제 지리를 그리므로 트립 생성·수정에서 나라(및 도시)를 여러 개 순서대로 지정할 수 있어야 한다 → `trip_destination` 테이블(country_code·city·sort_order) + 나라 상수(중심 좌표) 추가, 지구본은 항공편이 없으면 출발지(ICN)→목적지 순서로 곡선 경로를 그린다. Phase 3 에서 구현.
- **보더 최소화(사용자 재강조 2026-09-09)**: 표를 제외하고 보더로 구분하지 않는다. 배지·버튼·아코디언·사이드바 구분선 모두 배경색(카드/뮤티드/프라이머리)과 1px 심으로 해결. 시간 칸은 카드 톤(사이드바 뮤티드와 구분). 도구 버튼(완료 숨기기·체크 초기화)은 패딩 없는 셀형 버튼. 표는 카드 인셋 없이 블록에 꽉 채운다.
- **날짜 탭 오버플로 UX(사용자 요청 2026-09-09)**: 그라데이션 대신 양끝 화살표 셀(넘칠 때만 표시, 끝에서 비활성) + 스트립 아래 2px 스크롤 위치 표시 + 키보드 좌우 이동 + "n/총" 카운터 겸 달력 점프(shadcn Calendar 팝오버, 트립 날짜만 활성).
- **사이드바 트립 목록·즐겨찾기(사용자 요청 2026-09-09)**: 셸 레일에 즐겨찾기한 트립 목록을 표시하고, 트립 목록 카드에서 즐겨찾기(레일 추가/제거) 토글. 사용자별 `trip_favorite`(user_id·trip_id·sort_order). Phase 3 에서 목적지(나라) 기능과 함께 구현.
