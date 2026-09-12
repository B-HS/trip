# ADR-0030 — SEO·GEO·JSON-LD·Analytics 이벤트·Speed Insights (2026-09-09)

## 배경

로드맵 10 을 사용자가 착수 지시했다(ADR-0022). 공개 표면(인트로·로그인·회원가입·`/s/[slug]`)에 커뮤니티 홈·게시판·사용자 페이지(ADR-0028)가 더해지므로, 새 공개 페이지가 모두 생긴 뒤 마지막 단계(6단계)에서 한 번에 적용한다.

## 결정

- **메타데이터**: 루트 `metadata` 에 `title.template`("%s | Trip")·`metadataBase`(정책화한 `SITE_URL`)·기본 description·`robots`. 로컬 개발만 유효한 `NEXT_PUBLIC_APP_URL`을 사용하고 Vercel preview/production은 production canonical을 사용한다. 라우트별 `generateMetadata` 로 canonical·OG·Twitter 카드를 낸다. 로그인 전용 화면(`/trips/**`, `/settings/**`)은 `robots: { index: false }`.
- **sitemap·robots**: `app/sitemap.ts`(정적 페이지 + 공개 트립 `/s/[slug]` + 게시판·게시글 + `/u/[username]`, `lastModified` 는 `updated_at`), `app/robots.ts`(비공개 경로 disallow, sitemap 링크). 공개 트립이 비공개로 바뀌면 다음 sitemap 생성에서 빠진다(`revalidate` 1시간).
- **OG 이미지**: 공개 트립의 `app/[locale]/(shell)/s/[slug]/opengraph-image.tsx`가 `next/og` `ImageResponse`를 생성한다. 게시글·사용자 페이지는 현재 공통 Open Graph metadata/card를 사용하며 전용 동적 이미지 라우트가 있다고 주장하지 않는다.
- **GEO**: 공개 트립 상단에 한 문단 요약(제목·기간·박/일·목적지·항공편 수)을 서버 렌더 HTML 로 포함한다. `app/llms.txt/route.ts` 가 사이트 개요와 주요 공개 URL 목록을 텍스트로 낸다. 본문은 계속 SSR(ADR-0010).
- **JSON-LD**: `shared/lib/json-ld.ts` 가 객체를 만들고 `features/seo/json-ld-script.tsx` 가 `</script>` 를 `<\/script>` 로 이스케이프해 주입한다(sanitize 예외). 루트 `WebSite`·`Organization`, 공개 트립 `TouristTrip`(`@id`와 `itinerary` `ItemList` 안의 날짜별 `TouristAttraction` 과 목적지 `Place`), 게시글 `Article`/질문은 `QAPage`(채택 답변 `acceptedAnswer`), 사용자 페이지 `ProfilePage` 를 출력한다. Flight·LodgingBusiness는 `TouristTrip`에 검증되지 않은 관계(`mentions` 등)를 만들지 않고 같은 `@graph`의 독립 노드로만 출력한다. TouristTrip 에 `touristDestination`·숙박·항공 관계를 넣지 않으며, 항공 시간은 TouristTrip의 공식 시간 속성으로만 표현한다.
- **Analytics 이벤트**: `@vercel/analytics` `track()` 으로 `trip_created`·`trip_created_from_template`·`share_link_copied`·`favorite_toggled`·`trip_imported`·`post_created`·`ai_job_requested`. 속성은 종류·개수 같은 비식별 값만, 이메일·제목·본문은 넣지 않는다. 호출은 위젯(mutation 성공 콜백)에서.
- **Speed Insights**: `@vercel/speed-insights` 를 루트 레이아웃에 마운트. 성능 예산(모바일, 배포 후 Vercel 대시보드 기준): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. 지구본(three) 청크는 계속 `TripGlobeLazy` 로 지연 로드하고, 예산을 넘기면 인트로 히어로의 지구본을 뷰포트 진입 후 로드하는 것을 첫 조치로 둔다.
- 접근성·시맨틱: 페이지당 `h1` 1개, 섹션 `h2`, 이미지 `alt`(업로드 첨부는 라벨을 `alt` 로).

## 이유

로드맵 10 의 명세를 그대로 따르며, 새 공개 페이지가 생긴 뒤 적용해야 sitemap·JSON-LD 를 두 번 만들지 않는다.

## 기각된 대안

- 라우트별 개별 `<Head>` 관리: App Router 의 `generateMetadata` 로 충분.
- 정적 OG 이미지 1장: 공개 트립마다 다른 정보를 담아야 한다.

## 구현 기록 (2026-09-12)

- `app/[locale]/layout.tsx` 에 locale별 `metadataBase`, title template, description, canonical/hreflang, `WebSite`/`Organization` JSON-LD를 두고 `SpeedInsights`를 함께 마운트했다. 로그인·가입·인증·트립 편집·설정·관리자 경로는 `noindex, nofollow`를 명시한다. 로컬 비-Vercel 개발은 유효한 `NEXT_PUBLIC_APP_URL`을 canonical origin으로 사용하고, Vercel preview와 production은 `https://trip.gumyo.net`을 canonical로 유지한다.
- `app/sitemap.ts`는 정적 공개 경로와 공개 트립·삭제되지 않은 게시글·username이 있는 비차단 프로필을 1시간 캐시로 내보내며, 각 URL에 ko·en·ja·x-default alternates를 포함한다. `app/robots.ts`는 locale 프리픽스를 포함한 비공개 경로와 API를 차단한다.
- 공개 트립은 `app/[locale]/(shell)/s/[slug]/opengraph-image.tsx`에서 제목·목적지·기간을 포함한 1200×630 이미지를 생성하고, `llms.txt`는 실제 공개 트립 URL을 포함한 기계 판독용 개요를 제공한다. 공개 트립 요약은 서버 컴포넌트로 초기 HTML에 포함한다.
- `shared/lib/json-ld.ts`의 빌더는 사용자 작성 값이 포함될 수 있는 JSON-LD를 `features/seo/json-ld-script.tsx`에서 `<`, `>`, `&`를 이스케이프해 주입한다. `QAPage`는 질문 게시판에만 사용하고, 댓글 본문을 추측해 `acceptedAnswer`를 만들지 않는다.
- Analytics 이벤트에는 집계 가능한 source/boolean 값만 넣고 제목·본문·이메일·식별자·URL을 전달하지 않는다. `ai_job_requested`는 AI 작업 생성이 성공한 클라이언트 mutation callback에서만 전송한다. Speed Insights는 루트 레이아웃의 `@vercel/speed-insights` 마운트와 Vercel 대시보드의 Core Web Vitals 확인을 운영 절차로 둔다. 현재 사용하는 Next 통합 export를 제공하는 Vercel 공식 1.3.1 패키지를 lockfile에 고정한다. Bun 1.3.14의 전체 그래프 설치에서 2.0.0 tarball만 무결성 추출 오류를 재현하며, 1.3.1은 같은 조건에서 통과한다.

검증에 참고한 1차 문서: [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Next.js sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [Vercel Web Analytics](https://vercel.com/docs/analytics), [Vercel Speed Insights package](https://vercel.com/docs/speed-insights/package).
