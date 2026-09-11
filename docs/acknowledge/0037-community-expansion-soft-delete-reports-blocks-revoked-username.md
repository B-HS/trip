# ADR-0037 — 커뮤니티 확장: 소프트 삭제·신고·차단·채택 회수·사용자명 변경 (2026-09-11)

## 배경

ADR-0033 §3 이 커뮤니티 기본 구현(ADR-0028·0032) 직후 붙일 확장 범위를 정했다. 4-4에서 남긴 두 개의 보류(KNOWN ISSUE: 채택 댓글 삭제 시 +10 재지급 경로, 트립 첨부 인가 `view` 로 남의 비공개 트립 제목 노출 여지)를 여기서 닫는다. 마이그레이션은 0008, 추가 전용이다.

## 결정

### 1. 소프트 삭제

- `trip_post`·`trip_comment` 에 `deleted_at` timestamp NULL 을 추가한다. 목록·카운트·검색·상세·홈·프로필 탭·탐색 등 사용자-facing 읽기는 전부 삭제 행을 제외한다(SQL `deleted_at IS NULL`).
- 답글이 살아 있는 삭제 댓글은 자리 표시자로 남긴다: `isDeleted: true`, `body: null`. 답글이 없는 삭제 댓글은 완전히 숨긴다. 댓글은 전부 로드(ADR-0032)하므로 이 판정은 JS 순수 함수 `projectComments(rows, blockedIds)`(`entities/community/community.comment.ts`)에서 한다.
- 사용자 삭제 액션은 하드 삭제를 소프트 삭제(`deleted_at` 갱신)로 바꾼다. 관리자 복구는 `deleted_at` 을 null 로 되돌린다.

### 2. 신고

- `trip_report`(id PK, reporter_id FK cascade, kind enum `post|comment|user`, target_id varchar(36), reason enum `spam|harassment|obscenity|defamation|illegal|privacy|other`, memo varchar(500) NULL, status enum `open|hidden|dismissed|banned` default `open`, handled_by FK set null, handled_at NULL, created_at; UNIQUE(reporter_id, kind, target_id)).
- `submitReport`(로그인 필수): 동일 사용자가 같은 대상에 중복 신고하면 기존 `ALREADY_ACCEPTED` 와 같은 패턴(`ApiError('VALIDATION_ERROR', 상수 메시지)`)으로 거부한다.
- 관리자 전용: `hideTarget`(소프트 삭제 + status `hidden`), `dismissReport`(status `dismissed`), `banUser`(better-auth admin `banUser`, status `banned`), `unbanUser`. admin 주장은 액션 레벨에서도 `isAdminRole` 로 한다.

### 3. 차단

- `trip_user_block`(blocker_id FK cascade, blocked_id FK cascade, created_at, PK (blocker_id, blocked_id)). 단방향: 차단한 사람이 차단당한 사람의 글·댓글을 어떤 표면에서도 보지 못한다.
- 저장소 읽기에서 `author_id NOT IN (차단 id)` 로 필터링한다. 목록은 페이지네이션 카운트가 맞아야 하므로 SQL 필터, 댓글은 전부 로드하므로 `projectComments` JS 필터. 보는 사람의 차단 id 는 `findBlockedIdsForUser`(React `cache`, `community.cache.ts` 와 동일 방식)로 조회한다. 기존 저장소 함수에는 `viewerId` 를 넘긴다.

### 4. 채택 회수(원장)

- `trip_point_ledger.reason` enum 에 `revoked` 를 추가한다. 채택이 변경 가능해진다.
- 첫 채택: +10 `accepted`(ref 채팅 댓글 id). 재채택: 기존 채택에 -10 `revoked`(ref 옛 댓글 id) 후 새 댓글에 +10 `accepted`, `trip_post.accepted_comment_id` 갱신. 같은 댓글 재채택은 no-op.
- 채택된 댓글을 소프트 삭제하면 -10 `revoked` 를 넣고 `accepted_comment_id` 를 null 로 비운다(4-4 KNOWN ISSUE 해소 — 삭제 후 재채택 시 옛 +10 이 이미 회수되어 이중 지급이 없다). `answer` +2 는 회수하지 않는다. `SELECT … FOR UPDATE` 트랜잭션 패턴은 기존 코드 그대로 유지한다.

### 5. 사용자명 변경

- `changeUsernameAction`(`entities/profile/profile.action.ts`): `^[a-z0-9_.]+$` 3~30자(auth.validate 와 동일 규칙), 중복 검사, 세션 사용자 본인만. better-auth `disabledPaths` 는 건드리지 않는다(코어 `/update-user` 는 계속 닫아 둔다).

### 6. 트립 첨부 인가

- 글 작성·수정의 트립 첨부(와 트립 옵션 조회)는 **작성자 소유이거나 공개 트립**만 가능으로 좁힌다(기존 `view` 권한 검사 대체). 순수 판정 `canAttachTrip(viewer, trip)` = `viewer.id === trip.ownerId || trip.isPublic`.

### 7. 관리자 데이터

- `findOpenReportsPage(offset, limit)`: 상태 `open` 신고 목록에 대상 미리보기(글 제목/댓글 본문/사용자 표시 이름)와 신고자 사용자명을 붙여 오프셋 페이지로 반환. `countOpenReports` 로 개수.

## 이유

소프트 삭제는 복구·신고 처리에 필요하고(ADR-0033 기각 대안 뒤집기), 댓글 자리 표시자는 답글 스레드의 맥락을 보존한다. 신고 UNIQUE 로 같은 사람의 같은 대상 중복 접수를 막는다. 차단은 단방향으로 충분하다(양방향 차단은 별도 합의가 필요하다). 채택 회수는 "채택 되돌릴 수 없음"을 완화하면서도 포인트 원장을 정확히 유지하는 최소 장치다 — 회수 행을 넣어야 +10 반복 지급이 원장에서 상쇄된다. 트립 첨부 축소는 ADR-0032 구현 메모가 4-5로 미룬 정책 결정을 실행한다.

## 기각된 대안

- 신고 하드 삭제: 감사 추적 불가. 소프트 삭제 + status 로 숨긴다.
- 차단 양방향 자동화: 차단 semantics 를 넘는다.
- 채택 회수 없이 변경만 허용: +10 이중 지급(4-4 KNOWN ISSUE)이 남는다.
- 사용자명 변경 시 옛 URL 리다이렉트·이력: ADR-0033 §3 에서 1차 범위 밖으로 기각 유지.
- 차단·삭제 필터를 JS 에서만 처리: 목록 페이지네이션 카운트가 어긋난다.
