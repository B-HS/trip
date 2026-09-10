# 2026-09-10 — Vercel 에서 게시글 상세가 500 (jsdom require(esm))

## 증상

- prod `trip.gumyo.net` 의 `/boards/[key]/[postId]` 가 500. 목록·홈·프로필·`/s/[slug]` 는 200. 로컬 dev 와 `next start`(Node 22.14) 는 정상.
- Vercel 런타임 로그: `Failed to load external module jsdom … ERR_REQUIRE_ESM: require() of ES Module node_modules/@exodus/bytes/encoding-lite.js from node_modules/html-encoding-sniffer/lib/html-encoding-sniffer.js not supported`.

## 원인

- 글 상세는 `renderRichTextHtml` → `sanitizeRichTextHtml` 에서 `isomorphic-dompurify` 를 쓰고, Node 경로에서는 jsdom 30 창을 만든다. jsdom 30 의 `html-encoding-sniffer@6` 이 ESM 전용 `@exodus/bytes` 를 `require()` 한다.
- 로컬 Node 22.14 는 require(esm) 이 기본 허용이라 통과하지만 Vercel 함수 런타임(프로젝트 설정 Node 24.x)에서는 거부된다. `node --no-experimental-require-module` 로 로컬 재현이 된다. 누가 플래그를 끄는지는 미확정(Next 16.3.4 는 해당 플래그를 설정하지 않음).

## 해결 (`7adc2fa` 이후 세션 4 커밋)

- `isomorphic-dompurify` 제거, `dompurify@3.4.15` + `jsdom@26.1.0`(정확 고정) 창을 `shared/lib/rich-text-sanitize.ts` 가 직접 만든다(`server-only`). jsdom 26.1 은 의존성 체인이 전부 CJS 라 require(esm) 없이 뜬다(`node --no-experimental-require-module -e "require('jsdom')"` 통과). 정책 훅은 전용 인스턴스에 생성 시 1회 등록.
- 폐기한 대안: `dompurify` + happy-dom 창. DOMPurify 3.4 는 clobbering 방어로 `Node.prototype` 의 `nodeName` getter 만 쓰는데 happy-dom 은 하위 클래스에서 재정의해 모든 태그가 불허 판정이 나고, 어댑터로 우회해도 happy-dom `NodeIterator` 가 반복 중 제거된 노드 뒤를 방문하지 않아 `<script>x</script><img onerror>` 의 `onerror` 가 살아남는다(실측). sanitize 에는 쓰지 않는다.

## 검증

- `bun test` 440 통과(우회 문자열 포함), typecheck·lint·prettier·`bun run build` 통과.
- 새 빌드를 `NODE_OPTIONS=--no-experimental-require-module node node_modules/next/dist/bin/next start` 로 띄워 글 상세 200 과 sanitize 결과(iframe·h2·strong) 확인, 배포 후 prod 스모크.

## 후속

- Vercel 함수가 require(esm) 을 허용하는 것이 확인되면 jsdom 을 최신으로 올린다. 그 전까지 `jsdom` 은 26.x 에 고정한다.
