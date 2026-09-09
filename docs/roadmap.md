# 로드맵 — 다음 페이즈 (미착수)

> 2026-09-09 사용자가 기획 중인 고도화 기능. 현재 페이즈(Phase 3·4) 이후에 착수한다. 여기 적힌 제약은 구현 시 그대로 지킨다.

## 1. 콘텐츠 사이드바 — 추가 링크와 설명 커스터마이징

- 트립 뷰어의 콘텐츠 사이드바(항공편·숙소 아래)에 사용자가 임의의 링크 목록을 추가·정렬·삭제할 수 있게 한다(라벨 + URL + 짧은 설명).
- 사이드바 상단 설명 문구(기간 보조 문구·주의 문구 등)를 트립별로 커스터마이징한다.
- 데이터: `trip_sidebar_link`(trip_id, sort_order, label, url, description) + `trip_trip` 의 설명 필드 확장. 편집은 편집기 기본 정보 탭 또는 별도 "사이드바" 탭.

## 2. 예매 체크 — 이미지 업로드 또는 링크 첨부

- 예매 항목마다 예매 완료 증빙(이미지 업로드 또는 외부 링크)을 저장해 여행 중 바로 열어볼 수 있게 한다.
- 데이터: `trip_booking_attachment`(booking_id, kind image|link, url, label, uploaded_by, created_at). 업로드 저장소는 Vercel 배포 기준으로 결정(Vercel Blob 등 Marketplace 스토리지 후보). 파일은 MIME·확장자·크기 화이트리스트 검증, 이미지 미리보기는 `next/image`.
- 사용자별 체크 상태와 달리 첨부는 트립 공유 자산(멤버 전원이 봄).

## 3. OSM(OpenStreetMap) — 현재 위치와 실제 지도

- Google Maps 임베드 대신 OpenStreetMap 기반 지도 뷰를 제공한다(타일: OSM 표준 타일 또는 자체 호스팅/유료 타일 정책 확인 필요 — OSM 타일 사용 정책 준수).
- 기능: 일정 항목의 위치 마커, 방문 순서 폴리라인, 브라우저 Geolocation 으로 현재 위치 표시(권한 요청 UX 포함), "지도 열기" 는 유지.
- 데이터: 일정 항목에 좌표(lat/lng) 필드 추가, 편집기에서 검색(Nominatim 등 OSM 지오코더, 사용 정책 준수) 또는 지도에서 직접 찍기.
- 라이브러리 후보: MapLibre GL 또는 Leaflet(react-leaflet). SSR 비활성 동적 로드, 다크 모드 타일/스타일 대응.

## 4. AI — 일정 질문답과 AI 수정

- 트립 일정을 컨텍스트로 질문·답변하고, 승인 시 일정을 AI 가 수정(구조화된 변경 제안 → 사용자가 적용) 할 수 있게 한다.
- **프로바이더 3종**: Ollama Cloud, OpenAI, Claude(Anthropic). 사용자는 프로바이더와 모델을 별도로 선택한다.
- **모델 목록은 서버에서 각 프로바이더 공식 API 로 동적으로 가져온다.** `models.dev` 는 절대 사용 금지. 각 프로바이더의 정확한 1차 출처만 사용:
  - OpenAI: `GET https://api.openai.com/v1/models`
  - Anthropic: `GET https://api.anthropic.com/v1/models`(버전 헤더 포함)
  - Ollama Cloud: Ollama 공식 API 의 모델 목록 엔드포인트(구현 직전 공식 문서로 재확인)
  - 목록·capability 는 서버에서 캐시(짧은 TTL)하고, 클라이언트 선택값은 서버에서 프로바이더·모델 소속을 재검증한다.
- **추론 강도(reasoning effort)**: 모델별로 지원하는 추론 강도 옵션을 정확히 표시·선택할 수 있어야 한다. 프로바이더·모델마다 다르므로(예: OpenAI reasoning 모델의 `reasoning.effort` low/medium/high 계열, Anthropic 의 extended thinking·budget 계열, Ollama 모델의 think 옵션 등) 하드코딩하지 말고 각 프로바이더 공식 문서·모델 메타데이터에서 지원 여부와 허용 값을 확인해 모델 선택 시 동적으로 노출하고, 미지원 모델에는 표시하지 않는다. 서버에서 선택값을 재검증한다.
- **과금**: 무료 한도(서비스 키로 제공, 사용자·일 단위 쿼터) + 사용자가 자신의 API 키를 등록하면 그 키로 무제한. 키는 서버 측 암호화 저장, API·로그·UI 에 원문 미노출, 교체·삭제 UI 제공.
- **장시간 작업**: 요청은 job 으로 DB 에 저장 후 즉시 응답, 서버 worker 가 처리하고 결과를 메시지로 저장. 대화 전환·연결 끊김과 무관하게 완료된다. UI 는 polling 으로 갱신.
- 대화·메시지·usage(프로바이더·모델·토큰) 를 사용자별로 영속 저장. 일정 수정은 diff 미리보기 후 적용(기존 server action 재사용).

## 5. 일정 종류 배지 커스터마이징

- 현재 일정 종류(배지·범례)는 하드코딩된 3종이다: `planned`(계획 일정) · `confirmed`(항공편·공식 셔틀) · `target`(예매 목표·미확정). 정의 위치는 `shared/constant/trip.ts` 의 `SCHEDULE_KINDS`·`SCHEDULE_KIND_LABEL`·`SCHEDULE_BUFFER_LABEL` 과 `features/trip-viewer/trip-viewer-kind.ts` 의 색·범례 라벨이며, DB 는 `trip_schedule_item.kind` 를 MySQL enum 으로 저장한다.
- 다음 페이즈에서 트립별 사용자 지정 종류로 바꾼다: `trip_schedule_kind`(trip_id, key, label, legend_label, color_token(제한된 토큰 팔레트 중 선택: muted/success/warning/destructive/chart-n), buffer_label, sort_order). 일정 항목은 `kind` enum 대신 `kind_id` FK 를 참조하고, 트립 생성 시 기본 3종을 시드한다. 범례·배지·시간 칸·인쇄 뷰가 모두 이 테이블을 읽는다.
- 편집기에 "일정 종류" 관리 UI(추가·이름·색·여유 문구·정렬·삭제 시 대체 종류 지정) 를 두고, 템플릿 JSON 스키마에도 종류 정의를 포함한다. 마이그레이션은 기존 enum 값을 기본 3종으로 매핑한다.

## 6. 커뮤니티 — 메인 페이지 전환

- 로그인 후 "/" 는 지금처럼 곧바로 내 트립 목록으로 가지 않고 **커뮤니티 홈**이 된다(내 트립은 레일·메뉴에서 진입). 로그아웃 상태의 인트로는 유지하되 공개 커뮤니티 일부를 노출할지 착수 시 결정.
- **공유 트립 탐색**: 공개(`is_public`)로 설정한 다른 사용자의 트립을 목록·상세로 보고 **좋아요**(사용자당 1회, `trip_like`)를 누른다. 홈에는 "이번 주 여행 플랜"·"이번 달 여행 플랜"(트립 시작일 기준) 섹션과 최근·인기(좋아요 순) 트립을 둔다. 공개 트립 상세는 기존 `/s/[slug]` 뷰어(읽기 전용)를 재사용한다.
- **게시판**: 자유게시판·질문게시판(확장 가능한 board 타입). `trip_board`(key, name, kind free|qna), `trip_post`(board_id, author_id, title, body, trip_id nullable 로 트립 첨부, view/like/comment count), `trip_comment`(post_id, author_id, parent_id 대댓글, is_accepted 채택), `trip_post_like`. 본문은 구조화 편집기 원칙과 별개로 게시판만 마크다운 또는 리치텍스트 허용 여부를 착수 시 결정(렌더 시 sanitize 필수).
- **답변 포인트**: 질문게시판에서 답변 작성·채택 시 포인트 적립(`trip_point_ledger`: user_id, delta, reason, ref). 사용자 프로필에 누적 포인트 표시. 적립 규칙·수치는 상수로 두고 acknowledge 에 기록.
- **사용자 페이지** `/u/[username]`: 프로필(이름·사용자명·포인트·가입일), 작성 게시글 목록, 공유(공개)한 트립 목록, 좋아요한 트립. 다른 사용자도 열람 가능.
- 전제: 공개 범위·신고/차단·삭제 정책, 페이지네이션(`pagination` 컴포넌트), 검색은 착수 시 acknowledge 로 합의. 인가 규칙은 기존 §6 표에 "공개 트립 열람/좋아요"·"게시글 작성/수정/삭제(작성자·관리자)" 행을 추가한다.

## 7. 인증 확장·약관·후기 게시판·리치 에디터

- **소셜 로그인**: Naver·GitHub OAuth 를 better-auth 에 추가한다(GitHub 은 내장 프로바이더, Naver 는 generic OAuth 프로바이더 설정). 기존 이메일·비밀번호·사용자명 로그인은 유지하고 계정 연동(같은 이메일 병합 정책)을 acknowledge 로 합의한다. 콜백 URL·클라이언트 키는 `.env` 키만 추가하고 값은 사용자가 입력.
- **회원가입 약관**: 서비스 이용약관·개인정보 처리방침 문서(`docs/legal/` 초안 → 앱 `/terms`, `/privacy` 페이지)를 만들고, 회원가입 폼에 필수 동의 체크(약관 버전과 동의 시각을 `trip_user_consent` 에 저장). 약관 개정 시 재동의 흐름.
- **여행 후기 게시판**: 커뮤니티 게시판 타입에 `review` 를 추가한다(방문 트립 첨부, 평점(선택), 사진). 홈에 최신 후기 섹션.
- **게시글 에디터**: Tiptap + shadcn 기반 리치 에디터(features 순수 UI + 위젯에서 저장). 지원: 제목·본문 서식, 목록, 인용, 코드, 이미지 업로드(2번 첨부 저장소 재사용), 링크, **YouTube 영상 embed**(Tiptap YouTube 확장; 허용 도메인 화이트리스트). 저장 포맷은 Tiptap JSON 을 정본으로 하고 렌더는 서버에서 HTML 로 변환 후 `isomorphic-dompurify` 로 sanitize(iframe 은 YouTube 도메인만 허용). 이미지·영상은 `next/image`·lazy iframe.

## 8. 셀형 액션 UI 전면 적용

- 트립 상세의 "완료 숨기기 / 체크 초기화"처럼, 버튼을 패딩 있는 버튼이 아니라 **하나의 섹션(셀)** 으로 보이게 하는 방식을 모든 UI 에 확장한다: 툴바·카드 액션(열기/편집/삭제/별표)·편집기 저장 바(저장/되돌리기)·다이얼로그 푸터·목록 상단 액션(새 트립/예시 만들기)·인증 폼 제출까지. 셀은 부모 블록의 높이를 꽉 채우고, 배경색(card/muted/primary)과 1px 심으로만 구분하며 보더·라운드·그림자 없음.
- 구현 방식: `shared/ui` 에 `cell-button`(또는 button 의 `cell` variant + `ButtonGroup` 조합) 을 추가해 재사용하고, 기존 `Button` 사용처를 화면 단위로 치환한다. 아이콘+라벨 정렬·포커스 링·disabled·pressed(aria-pressed) 상태 규칙을 한 곳에서 정의한다.
- 트립 상세 페이지 자체도 아직 완전하지 않으므로, 이 작업과 함께 상세 페이지의 남은 버튼(인쇄·지도 열기·메모 상태)도 같은 규칙으로 정리한다.

## 우선순위·전제

- 순서는 사용자가 정한다(현재 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 순으로 기록).
- 착수 전 각 항목마다 `docs/acknowledge` 에 스택·정책 합의를 먼저 남기고, `docs/PROCESS.md` 체크리스트로 진행한다.
