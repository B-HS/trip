# ADR-0005 — 공동편집자·공개 링크·사용자별 상태 (2026-09-09)

## 결정

- 트립 멤버 역할 owner/editor/viewer(`trip_member`), 이메일 초대(`trip_invite`, 가입 시 자동 수락), 공개 읽기 전용 링크 `/s/[slug]`(`is_public` + `share_slug`).
- 완료 체크·예매 체크·메모는 **사용자별**(`trip_schedule_check`·`trip_booking_check`·`trip_day_memo`, user×item PK). 활성 뷰·날짜는 URL.

## 이유

사용자 선택("A+C → C"), 체크는 "DB 에 사용자별 저장" 안을 수락.

## 기각된 대안

- 소유자 전용: 공유 요구와 불일치.
- 트립 공유 체크(동행자 공동 체크): 사용자가 사용자별 안을 수락. 나중에 `updated_by` 로 확장 가능.
- localStorage(원본 방식): 기기 간 동기화 불가.
