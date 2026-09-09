# ADR-0030 — SEO·GEO·JSON-LD·Analytics 이벤트·Speed Insights (2026-09-09)

## 배경

로드맵 10 을 사용자가 착수 지시했다(ADR-0022). 공개 표면(인트로·로그인·회원가입·`/s/[slug]`)에 커뮤니티 홈·게시판·사용자 페이지(ADR-0028)가 더해지므로, 새 공개 페이지가 모두 생긴 뒤 마지막 단계(6단계)에서 한 번에 적용한다.

## 결정

- **메타데이터**: 루트 `metadata` 에 `title.template`("%s | Trip")·`metadataBase`(`NEXT_PUBLIC_APP_URL`)·기본 description·`robots`. 라우트별 `generateMetadata` 로 canonical·OG·Twitter 카드를 낸다. 로그인 전용 화면(`/trips/**`, `/settings/**`)은 `robots: { index: false }`.
- **sitemap·robots**: `app/sitemap.ts`(정적 페이지 + 공개 트립 `/s/[slug]` + 게시판·게시글 + `/u/[username]`, `lastModified` 는 `updated_at`), `app/robots.ts`(비공개 경로 disallow, sitemap 링크). 공개 트립이 비공개로 바뀌면 다음 sitemap 생성에서 빠진다(`revalidate` 1시간).
- **OG 이미지**: `app/(public)/s/[slug]/opengraph-image.tsx`(`next/og` `ImageResponse`, 제목·기간·목적지 코드 칩, 1200×630, 토큰 색 하드코딩은 라이트 팔레트 값만). 게시글·사용자 페이지도 같은 방식.
- **GEO**: 공개 트립 상단에 한 문단 요약(제목·기간·박/일·목적지·항공편 수)을 서버 렌더 HTML 로 포함한다. `app/llms.txt/route.ts` 가 사이트 개요와 주요 공개 URL 목록을 텍스트로 낸다. 본문은 계속 SSR(ADR-0010).
- **JSON-LD**: `shared/lib/json-ld.ts` 가 객체를 만들고 `features/seo/json-ld-script.tsx` 가 `</script>` 를 `<\/script>` 로 이스케이프해 주입한다(sanitize 예외). 루트 `WebSite`·`Organization`, 공개 트립 `TouristTrip`(`itemListElement` 로 날짜별 `TouristAttraction`/`Place`, 숙소 `LodgingBusiness`, 항공편 `Flight`), 게시글 `Article`/질문은 `QAPage`(채택 답변 `acceptedAnswer`), 사용자 페이지 `ProfilePage`.
- **Analytics 이벤트**: `@vercel/analytics` `track()` 으로 `trip_created`·`trip_created_from_template`·`share_link_copied`·`favorite_toggled`·`trip_imported`·`post_created`·`ai_job_requested`. 속성은 종류·개수 같은 비식별 값만, 이메일·제목·본문은 넣지 않는다. 호출은 위젯(mutation 성공 콜백)에서.
- **Speed Insights**: `@vercel/speed-insights` 를 루트 레이아웃에 마운트. 성능 예산(모바일, 배포 후 Vercel 대시보드 기준): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1. 지구본(three) 청크는 계속 `TripGlobeLazy` 로 지연 로드하고, 예산을 넘기면 인트로 히어로의 지구본을 뷰포트 진입 후 로드하는 것을 첫 조치로 둔다.
- 접근성·시맨틱: 페이지당 `h1` 1개, 섹션 `h2`, 이미지 `alt`(업로드 첨부는 라벨을 `alt` 로).

## 이유

로드맵 10 의 명세를 그대로 따르며, 새 공개 페이지가 생긴 뒤 적용해야 sitemap·JSON-LD 를 두 번 만들지 않는다.

## 기각된 대안

- 라우트별 개별 `<Head>` 관리: App Router 의 `generateMetadata` 로 충분.
- 정적 OG 이미지 1장: 공개 트립마다 다른 정보를 담아야 한다.
