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

## 우선순위·전제

- 순서는 사용자가 정한다(현재 1 → 2 → 3 → 4 순으로 기록).
- 착수 전 각 항목마다 `docs/acknowledge` 에 스택·정책 합의를 먼저 남기고, `docs/PROCESS.md` 체크리스트로 진행한다.
