# ADR-0002 — 데이터 모델은 전부 구조화 (2026-09-09)

## 배경

원본 HTML 은 산문(개요·안내·참고 목록)이 많아 Markdown 필드 또는 JSON 문서로 두는 선택지가 있었다.

## 결정

모든 내용을 테이블·행으로 구조화한다(`trip_day_fact`·`trip_route`·`trip_schedule_item`·`trip_day_note`·`trip_info_section/block` 등, `docs/memory/data-model.md`). 산문도 문단·불릿·링크 단위 행(kind·emphasis·text·link).

## 이유

사용자 판단: 확장성·개발 정확성. 이후 커스터마이징(배지·사이드바 링크 등)이 구조화 전제에서 쉬워진다.

## 기각된 대안

- 구조화 코어 + Markdown 산문(추천안이었으나 사용자가 B 선택).
- trip 1개 = JSON 문서: 부분 수정·권한·인덱싱이 어렵다.
