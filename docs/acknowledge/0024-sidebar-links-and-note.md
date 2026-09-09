# ADR-0024 — 뷰어 사이드바 링크 목록과 소개 문구 (2026-09-09)

## 배경

뷰어 사이드바는 항공편·숙소 아래에 트립별 링크를 둘 수 없고, 상단 문구는 `periodNote`·`disclaimer`·`verifiedOn` 만 편집할 수 있다(로드맵 1).

## 결정

- 테이블 `trip_sidebar_link`(id, trip_id FK cascade, sort_order, label 80, url 500, description 200 NULL) 를 추가한다(마이그레이션). `trip_trip` 에 `sidebar_note` text NULL 을 추가해 제목 블록 아래에 자유 소개 문구를 보여 준다.
- 뷰어 사이드바: 소개 문구는 기간 줄 아래, 링크 목록은 숙소 아래 "링크" 섹션(라벨 + 설명, 외부 링크 아이콘, `target='_blank' rel='noopener noreferrer'`). 인쇄 트리에도 같은 섹션.
- 편집기: 새 탭 `sidebar`("사이드바") 에 소개 문구 textarea 와 링크 목록(`SortableRows` 정렬, 추가·삭제, URL 은 `z.url()` 검증 + `https?` 만). 저장은 별도 액션 `saveSidebarAction` → `saveSidebar`(한 트랜잭션에서 `sidebar_note` 갱신 + 링크 reconcile). 기본 정보 탭은 바뀌지 않는다(`tripBasicsFieldsSchema` 가 두 필드를 omit).
- 템플릿 JSON(`tripTemplateSchema`) 에 `sidebarNote`·`sidebarLinks` 를 선택 필드로 추가해 내보내기·가져오기·시드가 함께 다룬다. 오사카 템플릿은 원본 HTML 의 링크가 없으므로 빈 배열.
- 권한은 편집(owner·editor). 공개 페이지에도 노출된다(링크는 공개 정보로 본다).

## 이유

로드맵 1 의 데이터 설계를 그대로 따르되, 편집 위치는 기본 정보 탭이 이미 길어 별도 탭으로 한다.

## 기각된 대안

- 링크를 `trip_info_block`(kind link) 으로 재사용: 정보 아코디언과 사이드바는 위치·의미가 달라 별도 테이블이 명확하다.
- URL 스킴 무제한: `javascript:` 등 위험 스킴을 막기 위해 `http(s)` 만.
