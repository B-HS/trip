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

## 구현 메모 (2026-09-09 세션 3, 4단계 — Workflow `roadmap-7-tiptap-editor`)

- 패키지 8종을 3.31.3 으로 고정(`@tiptap/core` 도 명시), `isomorphic-dompurify` 4.2.0, `happy-dom` 20.14.0 을 dependencies 로. `isomorphic-dompurify` 는 Node 에서 jsdom 창을 만든다(happy-dom 이 아님). 서버 번들 크기·콜드스타트가 문제되면 `dompurify` + happy-dom 창으로 교체 검토.
- StarterKit 3.31 은 Link·Underline·ListKeymap·TrailingNode 를 포함한다 → `@tiptap/extension-link` 를 따로 등록하지 않고 `StarterKit.configure({ link })` 로 설정. 툴바에 없는 code(인라인)·horizontalRule·underline 은 끄고, 스키마에서도 빠지므로 그런 노드가 든 JSON 은 `parseRichTextDocument` 가 거부한다.
- Link 의 `protocols` 옵션은 허용 스킴을 "추가"만 하므로 http(s) 제한은 `isAllowedUri` 로 건다(리뷰에서 발견). 대문자 스킴(`HTTPS://`)은 유효하므로 검사 정규식에 `i`, YouTube 프리픽스 비교는 소문자화.
- sanitize 는 DOMPurify 기본 프로필(svg·mathml·form 포함) 대신 화이트리스트(`RICH_TEXT_ALLOWED_TAGS`·`RICH_TEXT_ALLOWED_ATTRIBUTES`)로 바꿨다(리뷰: form 피싱·svg image data: 우회·codeBlock `language` → class 주입 확인). 훅은 isomorphic-dompurify 싱글턴에 영구 등록하지 않고 호출 안에서 `addHook → sanitize → removeHook` 으로 한정(config 참조 비교는 DOMPurify 3.4 가 config 를 복제해 성립하지 않음). iframe 제거는 `uponSanitizeElement` 에서 `parentNode.removeChild`(DOMPurify 가 훅의 detach 를 공식 처리).
- 결과 타입 `SanitizedRichTextHtml`(브랜드)로 sanitize 경계를 타입에 옮겼다. `RichTextContent` 는 이 타입만 받아 서버 렌더를 거치지 않은 문자열을 컴파일 단계에서 막는다.
- `rich-text-html.ts` 는 `server-only`. bun test 에서 import 하기 위해 `tests/setup.ts` 가 `mock.module('server-only', () => ({}))` 를 등록한다. 같은 파일에서 happy-dom 의 자식 프레임 네비게이션을 끈다(YouTube iframe 렌더 시 실제 네트워크 요청 방지).
- 편집기: 확장 배열은 모듈 스코프 1회 생성(`@tiptap/react` 가 배열 identity 로 옵션 비교). 다이얼로그는 열릴 때만 마운트해 입력 상태가 자연히 초기화된다(닫힘 애니메이션 없음). lucide 1.43 에 YouTube 브랜드 아이콘이 없어 `PlayCircleIcon`. 붙여넣기·드래그 이미지 업로드는 없음(툴바 셀 + 숨김 file input 만).
- 검증: typecheck·lint·prettier·`bun test` 305(신규 49: 문서 15·sanitize 11·렌더 8·에디터 12·콘텐츠 3)·`bun run build` 통과. 보안 리뷰에서 우회 문자열 40여 건 실측(전부 차단). **브라우저 실측과 Next 서버 번들(happy-dom·jsdom) 검증은 아직 없다** — 사용처가 없어 빌드 경로에 실리지 않았다. 로드맵 6 게시글 작성·상세 화면에 연결하면서 라이트·다크 실측과 `next build` 번들 확인을 한다(ADR-0031). 번들 문제가 나면 `next.config.ts` `serverExternalPackages` 에 `jsdom`·`happy-dom` 추가가 첫 조치.

## 실측 메모 (2026-09-10, 로드맵 6 게시글 작성 화면에서 첫 브라우저 실측)

- **버그 발견·수정**: 서버 액션으로 보낸 본문에서 YouTube 노드의 `attrs` 가 `"$T"`(React Flight 임시 참조)로 직렬화돼 `richTextDocumentSchema` 가 "본문 형식이 올바르지 않습니다" 로 거부했다. 원인은 ProseMirror 가 노드 `attrs` 를 `Object.create(null)` 로 만들고, React 의 서버 액션 직렬화가 null 프로토타입 객체를 plain object 로 보지 않는 것. heading·image·codeBlock 등 attrs 가 있는 모든 노드가 같은 경로로 깨진다. `RichEditor.onUpdate` 가 `toPlainDocument`(JSON 왕복, `shared/lib/rich-text-document.ts`)로 정규화한 문서만 `onChange` 로 넘기도록 고쳤다(테스트 `toPlainDocument` 추가). bun 테스트가 plain 객체로만 검증해 잡지 못했던 사례.
- 툴바 셀·링크/YouTube 다이얼로그·nocookie iframe 삽입·트립 첨부 Select·저장 바는 라이트 모드에서 정상 렌더. 브라우저 자동화의 Return 키가 툴바 버튼에 전달돼 문단 분리 대신 버튼이 눌리는 현상은 도구 한계(합성 keydown 으로는 ProseMirror 가 문단을 나눔).
- **버그 발견·수정 2**: 링크·YouTube 다이얼로그의 `<form>` 제출 이벤트가 React 포털을 타고 바깥 글 작성 `<form>` 까지 버블링돼 글 폼 검증이 함께 실행됐다(제목 오류 표시). `RichEditorUrlDialog.handleSubmit` 에 `event.stopPropagation()` 을 추가했다(포털 안 중첩 폼은 React 트리 기준으로 이벤트가 전파된다).
