# ADR-0027 — 게시글 에디터는 Tiptap 3, YouTube 는 공식 확장 (2026-09-09)

## 배경

로드맵 7 중 사용자가 지금 하기로 한 것은 Tiptap 에디터와 YouTube embed 다(OAuth·이메일 인증·약관은 보류, ADR-0022). 커뮤니티 게시판(ADR-0028)이 이 에디터를 쓴다.

## 결정

- 패키지 `@tiptap/react`·`@tiptap/starter-kit`·`@tiptap/pm`·`@tiptap/extension-youtube`·`@tiptap/extension-link`·`@tiptap/extension-image`·`@tiptap/html` 를 **같은 버전(3.31.x)** 으로 고정한다. `@tiptap/html` 의 peer 인 `happy-dom` 은 devDependencies 에서 dependencies 로 옮긴다.
- 저장 정본은 **Tiptap JSON**(`trip_post.body` json 컬럼). 렌더는 서버에서 `generateHTML` 후 `isomorphic-dompurify` 로 sanitize 하고, `iframe` 은 `uponSanitizeElement` 훅으로 `src` 가 `https://www.youtube.com/embed/` 또는 `https://www.youtube-nocookie.com/embed/` 로 시작할 때만 남긴다. 링크는 `http(s)` 만, `rel='noopener noreferrer'` 강제.
- YouTube 는 공식 `@tiptap/extension-youtube`(`nocookie: true`, `allowFullscreen: true`, 폭 640·높이 360 기본) 를 쓰고, URL 은 확장의 정규식(`youtube.com`·`youtu.be`·`youtube-nocookie.com`) 만 허용한다. 툴바의 "YouTube" 셀이 URL 입력 다이얼로그를 연다.
- 이미지는 ADR-0026 업로드(3MB) 후 URL 을 `Image` 노드에 넣는다. R2 미설정이면 이미지 버튼을 비활성화.
- 구조: `features/editor/rich-editor.tsx`(순수 UI, `content`·`onChange`·`onUploadImage` props, 툴바는 ADR-0023 셀), 위젯이 업로드·저장을 담당. 툴바 항목: 제목 2·3, 굵게·기울임·취소선, 목록·번호목록, 인용, 코드블록, 링크, 이미지, YouTube, 되돌리기·다시하기.

## 이유

사용자 답변 12(공식 확장). Tiptap JSON 정본 + 서버 sanitize 는 로드맵 7 의 원칙이며 XSS 경계를 서버 한 곳에 둔다.

## 기각된 대안

- 자체 YouTube 노드: 유지 비용, 공식 확장이 URL 파싱·nocookie 를 이미 다룬다.
- HTML 을 정본으로 저장: 클라이언트 산출 HTML 을 신뢰하게 된다.
