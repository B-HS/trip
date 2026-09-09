# ADR-0025 — 일정 종류를 트립별 테이블로 (2026-09-09)

## 배경

일정 종류(배지·범례·여유 문구)는 `SCHEDULE_KINDS`(planned·confirmed·target) 하드코딩 + `trip_schedule_item.kind` MySQL enum 이다(로드맵 5).

## 결정

- 테이블 `trip_schedule_kind`(id, trip_id FK cascade, key 40, label 40, legend_label 80, color_token enum, buffer_label 80 NULL, sort_order; unique (trip_id, key)). `color_token` 은 토큰 팔레트만 허용: `muted`·`success`·`warning`·`destructive`·`chart-1`~`chart-5`(ADR-0011 의 토큰 색 원칙). 배지 클래스 맵은 `features/trip-viewer/trip-viewer-kind.ts` 에서 토큰 → `bg-<token>/15`·스와치 `bg-<token>` 으로 정적으로 나열한다(Tailwind 가 클래스를 찾을 수 있도록 동적 문자열 조합 금지).
- `trip_schedule_item` 에 `kind_id` FK 를 추가하고, 마이그레이션에서 기존 트립마다 기본 3종을 삽입해 enum 값을 매핑한 뒤 `kind` 컬럼을 제거한다(단일 마이그레이션 파일에 DDL + 데이터 SQL). 트립 생성·템플릿 생성·가져오기는 기본 3종을 시드한다(`shared/constant/trip.ts` 의 `DEFAULT_SCHEDULE_KINDS`).
- 템플릿 JSON: `scheduleKinds: [{ key, label, legendLabel, colorToken, bufferLabel }]` 추가, 일정 항목은 `kind` 문자열을 `key` 참조로 유지(하위 호환: 없으면 기본 3종 키 `planned`·`confirmed`·`target`).
- 편집기: 새 탭 `kinds`("일정 종류") 에서 추가·이름·범례 라벨·색 토큰(`Select`)·여유 문구·정렬·삭제. 삭제 시 그 종류를 쓰는 항목이 있으면 대체 종류를 고르게 한다(`AlertDialog` 안 `Select`). 마지막 1종은 삭제 불가. 날짜 폼의 "구분" `Select` 는 트립의 종류 목록을 읽는다.
- 뷰어 범례·배지·시간 칸·인쇄가 모두 트립의 종류 목록을 읽는다. 여유 문구는 항목 `bufferNote` 가 있으면 우선, 없으면 종류의 `bufferLabel`, 그것도 없으면 표시하지 않는다.

## 이유

로드맵 5 설계를 그대로 따른다. enum 을 없애야 사용자 정의가 가능하고, 토큰 팔레트로 제한해야 다크 모드와 인쇄에서 색이 깨지지 않는다.

## 기각된 대안

- 자유 HEX 색: 토큰 원칙 위반, 다크 모드 대응 불가.
- enum 유지 + 라벨만 커스터마이징: 종류 추가가 불가능하다.

## 구현 메모 (2026-09-09, 세션 2 후반)

- 새 종류의 `key` 는 UI 에 노출하지 않고 `crypto.randomUUID()` 로 발급한다(소문자·숫자·하이픈). 내보낸 JSON 의 키가 읽기 어려워지지만 항목 참조 안정성이 우선이다. 키 입력란 노출은 후속 판단.
- 배지 틴트는 토큰별 `bg-<token>/15` 이되 `muted` 만 기존과 같은 `bg-muted`(틴트 15% 는 배경과 구분되지 않음).
- 저장 직후 신규 종류의 서버 id 를 폼이 알 수 없어 `KindsTab` 이 종류 id 목록을 `key` 로 폼을 리마운트한다(저장 시 리셋되므로 입력 유실 없음).
- 마이그레이션 0004 는 DDL 뒤에 데이터 SQL(기본 3종 INSERT → 항목 `kind_id` UPDATE → NOT NULL·FK → `kind` 컬럼 삭제)을 손으로 이어 붙였고, 적용 순간 이전 배포 코드가 `kind` 컬럼을 잃으므로 적용과 배포를 연달아 한다.
