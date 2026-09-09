# ADR-0032 — 커뮤니티·프로필 구현 세부: 세션 프레임 라우팅, 스키마, 포인트·채택 규칙 (2026-09-10)

## 배경

ADR-0028 이 정책(홈·탐색·게시판 3종·댓글·채택·포인트·관리자·프로필)을 정했고, 로드맵 7(에디터)이 끝나 4단계 후반을 착수한다. 구현 전에 ADR-0028 이 비워 둔 세부를 확정한다.

## 결정

### 1. 라우팅과 프레임

- 새 route group `app/(community)/` 를 두고 그 `layout.tsx` 가 **세션 유무로 프레임을 고른다**: 세션이 있으면 `AppFrame`(현 `app/(app)/layout.tsx` 본문을 `widgets/app-shell/app-frame.tsx` 로 추출 — 즐겨찾기 prefetch + `HydrationBoundary` + `AppShell`), 없으면 `PublicFrame`(현 `app/(public)/layout.tsx` 본문을 `features/app-shell/public-frame.tsx` 로 추출). 기존 두 layout 은 그 프레임을 재사용한다.
- `(community)` 소속(비로그인 열람 가능): `/`(세션이면 커뮤니티 홈, 아니면 인트로 + 하단 공개 트립·최근 글 섹션), `/explore`, `/boards`(게시판 목록), `/boards/[key]`, `/boards/[key]/[postId]`, `/u/[username]`, `/s/[slug]`(이동, 좋아요 버튼 추가). `(app)` 소속(로그인 필수): `/boards/[key]/new`, `/boards/[key]/[postId]/edit`, `/settings/profile`. `(public)` 에는 `/login`·`/signup` 만 남는다.
- `proxy.ts`: matcher 에서 `/` 를 빼고, 로그인 상태의 `/login`·`/signup` 은 `/` 로 보낸다. 보호 경로에 `/boards/:key/new`, `/boards/:key/:postId/edit`, `/settings/:path*` 를 추가한다. 로그인 후 기본 이동은 `/`.
- `/` 는 세션을 읽으므로 동적 렌더가 된다(ADR-0010 의 "정적 인트로" 예외). 완성 HTML 원칙은 유지한다.

### 2. 스키마 (마이그레이션 0006, 추가만 — 이전 배포와 호환)

- `trip_user` + `role` varchar(32) NOT NULL DEFAULT 'user', `banned`·`ban_reason`·`ban_expires`(better-auth admin 플러그인 스키마 전체), `bio` varchar(300) NULL, `banner_url` varchar(500) NULL, `banner_upload_id` FK `trip_upload` set null. `trip_session` + `impersonated_by` varchar(36) NULL.
- `trip_trip` + `like_count` int NOT NULL DEFAULT 0 → `PublicTrip` 형태가 바뀌므로 `PUBLIC_TRIP_CACHE_VERSION` 을 `'3'` 으로.
- `trip_board`(id, key unique 40, name 40, kind enum free|qna|review, description 200 NULL, sort_order, created_at). 0006 SQL 끝에 기본 3행(`free` 자유게시판 · `qna` 질문게시판 · `review` 여행 후기) INSERT, id 는 `shared/constant/community.ts` 의 고정 UUID.
- `trip_post`(id, board_id FK cascade, author_id FK cascade, title 120, body json(Tiptap JSON), excerpt 300(평문), trip_id FK set null, view_count·like_count·comment_count int DEFAULT 0, created_at, updated_at; idx (board_id, created_at), author_id, trip_id).
- `trip_comment`(id, post_id FK cascade, author_id FK cascade, parent_id 자기참조 FK cascade NULL, body text(평문 ≤ 2000), is_accepted boolean DEFAULT false, created_at, updated_at; idx post_id, author_id).
- `trip_post_like`(user_id, post_id PK, created_at), `trip_like`(user_id, trip_id PK, created_at).
- `trip_point_ledger`(id, user_id FK cascade, delta int, reason enum answer|accepted, ref_id 36, created_at; unique (user_id, reason, ref_id)). 누적 포인트는 SUM(delta).

### 3. 규칙

- 포인트: `answer` +2 는 질문 게시판 글에 **작성자가 아닌** 사용자가 **첫 최상위 댓글**을 달 때 1회(ref_id = 글 id, unique 로 중복 차단). `accepted` +10 은 채택 시 댓글 작성자에게(ref_id = 댓글 id). 채택은 질문 작성자만, 글당 1건, **되돌릴 수 없다**. 삭제해도 포인트는 회수하지 않는다(1차).
- 카운터(`like_count`·`comment_count`)는 같은 트랜잭션에서 갱신. `view_count` 는 상세 페이지 조회마다 +1(중복 제거 없음).
- 인가: 읽기(게시판·글·프로필·탐색·공개 트립)는 비로그인 허용. 글 작성·수정·삭제, 댓글 작성·삭제, 채택, 좋아요, 프로필 편집은 로그인. 수정은 글만(댓글 수정 없음). 삭제는 작성자 또는 admin(`session.user.role === 'admin'`). 하드 삭제(댓글·좋아요는 FK cascade). 관리자 지정은 `scripts/set-admin.ts <email>`(`bun run admin:set`).
- 트립 첨부: 작성자가 view 권한이 있는 트립만 고를 수 있고, 표시는 공개 트립이면 `/s/[slug]` 링크, 아니면 제목만.
- 목록: 오프셋 20, `?page=` 와 `?q=`(제목 LIKE), 최신순. 탐색 `/explore` 는 `?sort=recent|popular`(좋아요 순). 홈 섹션: 이번 주(월~일, 시작일 기준)·이번 달 플랜, 최근 공개 트립 6, 인기 6, 최신 글 8, 최신 후기 4. 인트로 하단: 최근 공개 트립 6 + 최신 글 6.

### 4. 렌더 방식

- 목록·홈·프로필 탭·인트로 섹션은 **서버 컴포넌트가 repository 를 직접 읽어** 완성 HTML 로 낸다(쿼리 키 없음).
- 글 상세의 댓글·글 좋아요, 공개 트립 좋아요는 서버 프리페치 + `useQuery`/mutation(낙관적). 글 작성·수정은 `RichEditor` + 서버 액션 + invalidate. 저장 전 `richTextDocumentSchema` 검증, `isRichTextEmpty` 면 거부, `excerpt = richTextPlainText(body, 300)`. 상세 본문은 `renderRichTextHtml`(서버) → `RichTextContent`.
- 프로필 `/u/[username]`: 대문(없으면 `bg-muted` 블록)·사진·표시 이름(`name`)·사용자명·소개·포인트 합계·가입일, 탭(글 / 공개 트립 / 좋아요한 트립, 각 오프셋 20). `/settings/profile`: 표시 이름 2~40, 소개 ≤ 300, 사진·대문 업로드(`useUploadImage('avatar' | 'banner')`)·제거. 사용자명 변경은 범위 밖.
- 셸 레일: 홈 · 탐색 · 게시판 · 트립 목록 · 새 트립. 사용자 메뉴에 내 프로필·프로필 설정. 게스트 헤더에 탐색·게시판 링크. 메타데이터는 제목만(전체 SEO 는 로드맵 10).

### 5. 진행 방식(ADR-0031)

Workflow A(사실 확인 Sonnet → 데이터 계층 Opus max → 리뷰 2렌즈 Opus high → 수정) → 메인이 마이그레이션 SQL 검토·적용·커밋 → Workflow B(UI-A 메인 트리 ∥ UI-B 워크트리, Opus max) → 메인 patch 이식 → Workflow C(리뷰 4렌즈 → 수정) → 메인 검증·브라우저 실측(에디터 ADR-0027 실측 포함, 라이트·다크) → 문서·커밋·push·prod 머지.

## 이유

세션 프레임 라우팅은 비로그인 열람(SEO, ADR-0030)과 로그인 셸을 한 URL 로 만족시키고 레이아웃 코드를 중복하지 않는다. 포인트를 글당 1회로 제한해야 댓글 도배로 포인트를 모으는 것을 막는다. 채택을 되돌릴 수 없게 해야 +10 회수 규칙이 필요 없다. 추가 전용 마이그레이션이라 배포 순서 제약(ADR-0025 의 컬럼 삭제 사례)이 없다.

## 기각된 대안

- `/` 를 `(public)` 에 두고 로그인 홈을 공개 표면으로 렌더: 로그인 사용자가 셸을 잃는다.
- 댓글마다 +2: 도배 유인. 채택 변경 허용: 회수 규칙과 UI 가 필요해 1차 범위 초과.
- 소프트 삭제: 목록·카운터·검색이 전부 `deleted_at` 을 봐야 해 1차 범위 초과.
- 게시판 목록을 TanStack Query 로 클라이언트 조회: 비로그인 SEO 페이지에 불필요한 왕복.

## 구현 메모 — 데이터 계층 (2026-09-10, Workflow `roadmap-6a-community-data-layer`)

- `trip_post.accepted_comment_id` 컬럼(FK 없음)을 추가해 "글당 채택 1건·되돌릴 수 없음" 을 글 행에 기록한다. 채택 댓글이 삭제돼도 재채택이 막혀 +10 반복 지급이 불가능하다. `PostListItem.hasAcceptedComment` 는 이 컬럼에서 유도한다.
- 카운터·채택·좋아요 트랜잭션은 대상 글/트립 행을 `SELECT … FOR UPDATE` 로 먼저 잠근다(리뷰: 잠금 없는 COUNT 재계산은 동시 요청에서 어긋남). `trip_post`·`trip_comment` 의 `updated_at` 은 `$onUpdate` 없이 두고 본문 수정 경로만 명시적으로 갱신한다(조회수·좋아요 갱신이 수정 시각을 오염시키지 않도록).
- 글 **수정은 작성자만**(`canEditPost`·`assertPostEdit`), 삭제는 작성자 또는 admin(`canManagePost`·`assertPostManage`). ADR-0028 의 "삭제는 작성자 또는 admin" 을 그대로 두고 수정에는 admin 을 넣지 않았다.
- 프로필 저장: `profileUpdateSchema` 의 `avatarUploadId`·`bannerUploadId` 는 `undefined` = 유지, `null` = 제거, 문자열 = 본인 소유·kind 일치 업로드로 교체. UI 는 이미지를 그대로 둘 때 그 필드를 보내지 않는다.
- better-auth 코어 `/update-user` 를 `disabledPaths` 로 닫았다(name·image 를 검증 없이 바꾸는 우회 경로). 사용자명 변경을 열 때 이 목록을 다시 본다.
- `banner_upload_id` 는 FK(set null)를 걸었다. `auth.ts ↔ trip.ts ↔ community.ts` 순환 import 는 drizzle 의 지연 콜백이라 정상이며 양쪽 진입 순서로 로드해 확인했다.
- **UI 제약**: `/s/[slug]` 는 `(community)` 레이아웃(세션 프레임)으로 옮기면서 `export const revalidate` 를 제거해 동적 렌더로 둔다(사용자별 좋아요 상태를 프리페치하므로 ISR 로 두면 다른 방문자에게 새어 나간다). 트립 데이터 자체는 `getPublicTrip` 의 `unstable_cache` 가 계속 캐시한다. 채택 버튼은 `!post.hasAcceptedComment && canAcceptComment(...)` 로 게이팅한다.
- 마이그레이션 0006 적용(로컬 = prod DB): 이력 7행, 테이블 32, 게시판 3행 시드, 기존 사용자 3명 `role='user'`.
