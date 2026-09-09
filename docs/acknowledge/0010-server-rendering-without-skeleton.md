# ADR-0010 — 초기 화면은 완성 HTML, cacheComponents 해제 (2026-09-09)

## 배경

`cacheComponents: true`(PPR) 에서는 동적 데이터가 Suspense 폴백 뒤로 스트리밍되어 첫 화면에 스켈레톤이 보였다. 사용자: "prefetchQuery + fetch API 로 초기 로딩 없이 가능하지 않나".

## 결정

`cacheComponents` 끔. 페이지가 서버에서 `prefetchTripList/Detail` 로 데이터를 채운 뒤 `HydrationBoundary` 로 완성 HTML 을 내려준다. `loading.tsx`·페이지 Suspense 폴백 제거. 서버 캐시는 공개 공유 페이지만 `unstable_cache`(태그) + `export const revalidate = 3600`, 변경 시 `updateTag` + `revalidatePath`. 목록·상세는 DB 직접 조회(클라이언트 캐시는 TanStack). 뷰어의 `?view/&day` 는 페이지 `searchParams` → props, 클라이언트는 `history.replaceState`.

## 기각된 대안

- `'use cache'` + `cacheTag`/`cacheLife`(Phase 1 구현): cacheComponents 전용이라 함께 제거.
- `revalidateTag(tag, 'max')`(SWR): 편집 직후 공개 페이지가 stale 로 보일 수 있어 `updateTag` 채택.
- 라우트 핸들러 `connection()` 강제: prerender 경고 → `unstable_rethrow` 로 해결.
