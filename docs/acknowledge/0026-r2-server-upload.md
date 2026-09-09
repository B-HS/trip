# ADR-0026 — 이미지 업로드는 서버 경유 R2 저장, 3MB 제한 (2026-09-09)

## 배경

로드맵 2(예매 첨부)·6(프로필 사진·대문)·7(에디터 이미지)이 같은 업로드 기반을 쓴다. 사용자가 저장소를 Cloudflare R2 로 정했고 키는 추후 제공한다(ADR-0022 답변 1~3).

## 결정

- 업로드는 **서버 경유**: `POST /api/uploads`(multipart, 로그인 필수) 가 파일 크기(≤ 3MB)·MIME(`image/jpeg`·`png`·`webp`·`gif`·`avif`)·매직 바이트를 검증하고 `@aws-sdk/client-s3` `PutObjectCommand` 로 R2 에 넣는다. 키는 `uploads/<kind>/<yyyy>/<uuid>.<ext>`(kind = booking·avatar·banner·post). 버킷 CORS 는 필요 없다.
- 기록: `trip_upload`(id, owner_id, kind, key, url, mime, size, created_at) 에 남기고 도메인 테이블(`trip_booking_attachment` 등)은 `upload_id` 또는 `url` 로 참조한다. 도메인 행 삭제 시 R2 객체 삭제는 best effort.
- 읽기: 공개 버킷 URL 은 `R2_PUBLIC_BASE_URL`(사용자가 Cloudflare 존에 연결한 커스텀 도메인, `r2.dev` 는 개발용). `next.config.ts` 의 `images.remotePatterns` 에 이 호스트를 등록하고 `next/image` 로 표시한다. 원본만 저장하고 리사이즈는 `next/image` 에 맡긴다.
- env 키: `R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_BASE_URL`. `getEnv()` 에서 전부 선택값으로 두고, 하나라도 없으면 업로드 UI 를 비활성화하고 "저장소 설정 전" 안내를 보여 준다(링크 첨부는 항상 가능).
- 파일명은 저장하지 않고 라벨만 받는다. 업로드 응답은 `{ id, url }`.

## 이유

사용자 답변(서버 경유·3MB). 서버 검증이 신뢰 경계이고, CORS·presign 없이 동작해 운영이 단순하다. 3MB 면 사진 원본도 대부분 들어간다.

## 기각된 대안

- presigned PUT 직접 업로드: 버킷 CORS 필요, 서버 검증 불가.
- 앱 프록시로 비공개 버킷 서빙: 함수 호출 비용·지연이 이미지마다 생긴다.
