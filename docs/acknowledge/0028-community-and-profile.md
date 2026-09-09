# ADR-0028 — 커뮤니티 홈·게시판·포인트·프로필(대문·사진) (2026-09-09)

## 배경

로드맵 6 을 사용자가 착수 지시하며 YouTube 채널식 프로필 대문(배너)과 프로필 사진 커스터마이징을 요구했다(ADR-0022). 정책은 질문 묶음 8~11·14 의 답변대로다.

## 결정

- **홈**: 로그인 상태의 `/` 는 커뮤니티 홈(이번 주·이번 달 여행 플랜, 최근·인기 공개 트립, 최신 글·후기). 내 트립은 레일·메뉴에서 `/trips`. 로그아웃 인트로는 유지하고 하단에 공개 트립·최근 글 섹션을 붙인다. `proxy.ts` 의 `/` 리다이렉트를 없앤다.
- **공개 트립 탐색·좋아요**: `is_public` 트립 목록 `/explore`(`/s/[slug]` 재사용), `trip_like`(user×trip PK). 좋아요는 로그인 필요.
- **게시판**: `trip_board`(key, name, kind free|qna|review), `trip_post`(board_id, author_id, title, body json, trip_id NULL, view_count, like_count, comment_count, created/updated), `trip_comment`(post_id, author_id, parent_id NULL, body text, is_accepted), `trip_post_like`(user×post). 경로 `/boards/[key]`, `/boards/[key]/[postId]`, 작성 `/boards/[key]/new`. 본문은 Tiptap JSON(ADR-0027). 목록은 오프셋 20개 + 제목 검색.
- **포인트**: `trip_point_ledger`(user_id, delta, reason, ref_id). 질문 게시판 답변 작성 +2, 채택 +10(상수 `POINT_ANSWER`·`POINT_ACCEPTED`). 채택은 질문 작성자만, 1건만.
- **관리자**: better-auth `admin` 플러그인으로 `trip_user.role`(user|admin). 게시글·댓글 삭제는 작성자 또는 admin. 최초 관리자는 `scripts/set-admin.ts <email>` 로 지정. 신고·차단은 1차 범위 밖.
- **프로필**: `trip_user` 에 `bio`(300)·`banner_url`·`banner_upload_id` 추가, 사진은 기존 `image` 컬럼(ADR-0026 업로드). `/u/[username]`(대문·사진·표시 이름·사용자명·포인트·가입일, 작성 글·공개 트립·좋아요한 트립 탭), 편집은 `/settings/profile`(표시 이름·소개·사진·대문 업로드·제거).
- 인가 표(ARCHITECTURE §6)에 공개 트립 열람·좋아요, 게시글 작성·수정·삭제(작성자·admin), 채택(질문 작성자) 행을 추가한다.

## 이유

사용자 답변(8 B, 9 A, 10 A, 11 A, 14 A)과 로드맵 6 설계를 그대로 따른다.

## 기각된 대안

- `ADMIN_EMAILS` env 판정: 사용자가 role 컬럼을 선택.
- 무한 스크롤: 사용자가 오프셋 페이지네이션을 선택.
