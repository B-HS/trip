# ADR-0006 — 지도는 Google Maps 검색 링크만 (2026-09-09)

## 결정

일정 항목의 `map_query` 로 `https://www.google.com/maps/search/?api=1&query=…` 링크("지도 열기")를 연다. 임베드 없음.

## 이유

원본과 동일한 UX, API 키 불필요(사용자 지시).

## 기각된 대안

`@vis.gl/react-google-maps` 임베드 + Places 자동완성. OSM 기반 지도는 로드맵 3.
