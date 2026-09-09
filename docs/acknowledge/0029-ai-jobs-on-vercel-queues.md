# ADR-0029 — AI 작업은 Vercel Queues, 키는 사용자 소유·암호화 저장 (2026-09-09)

## 배경

로드맵 4(AI 질문답·수정) 착수. 사용자 답변: 실행은 Vercel Queues(Pro 플랜, 다른 프로젝트에서 사용 중), 호출은 AI SDK + 프로바이더 패키지, 무료 한도 없음(자기 키 필수), 키는 암호화 저장(ADR-0022).

## 결정

- **실행**: 질문·수정 요청은 `trip_ai_conversation`·`trip_ai_message`·`trip_ai_job`(status queued|running|done|failed, attempts, error) 에 먼저 저장하고 즉시 응답한 뒤 `@vercel/queue` `send('ai-job', { jobId })` 로 큐에 넣는다. 컨슈머 `app/api/queues/ai-job/route.ts`(`handleCallback`, `export const maxDuration = 300`, `vercel.json` `experimentalTriggers` 등록) 가 처리해 결과를 assistant 메시지로 저장한다. 재시도는 `retryAfterSeconds: 60`, 3회 초과 시 failed 로 기록하고 ack. UI 는 3초 polling 으로 대화·job 상태를 갱신하고, 브라우저를 닫아도 완료된다.
- **키**: `trip_ai_key`(user_id, provider openai|anthropic|ollama, ciphertext, iv, tag, hint(끝 4자리), created_at, PK user×provider). 서버에서 `APP_ENCRYPTION_KEY`(base64 32바이트)로 AES-256-GCM 암복호화(`shared/lib/crypto.ts`, Node `crypto`). 원문은 저장·응답·로그 어디에도 남기지 않고, 설정 화면(`/settings/ai`)에는 힌트만 보여 주며 교체·삭제만 가능하다. 키가 없는 프로바이더는 선택 목록에서 비활성.
- **무료 한도 없음**: 서비스 키를 두지 않는다. 사용자 키가 없으면 AI 기능 자체가 닫혀 있다.
- **SDK**: `ai`(v7 최신) + `@ai-sdk/openai`·`@ai-sdk/anthropic`·`@ai-sdk/openai-compatible`(Ollama Cloud `https://ollama.com/v1`). 요청마다 사용자 키로 프로바이더 인스턴스를 만든다.
- **모델 목록**: 서버가 사용자 키로 각 공식 엔드포인트(OpenAI `GET /v1/models`, Anthropic `GET /v1/models`, Ollama `GET /v1/models`)를 조회하고 사용자·프로바이더별 10분 캐시한다. `models.dev` 금지. 클라이언트 선택값은 서버에서 목록 소속을 재검증한다.
- **추론 강도**: OpenAI 는 `providerOptions.openai.reasoningEffort`(지원 모델은 ID 접두 `o1`·`o3`·`o4`·`gpt-5` 로 판별), Anthropic 은 `/v1/models` 의 `capabilities.thinking`·`effort` 로 판별해 `providerOptions.anthropic.thinking`. Ollama 는 OpenAI 호환 경로에서 `think` 전달 방법이 `[미확인]` 이라 1차에서는 노출하지 않는다.
- **일정 수정**: 모델에 트립 구조(날짜·일정 항목)를 컨텍스트로 주고 `generateObject` 로 변경 제안(추가·수정·삭제 항목 목록, zod 스키마)을 받는다. 사용자가 diff 미리보기에서 승인하면 기존 `saveDayAction` 으로 적용한다. 자동 적용은 없다.
- **usage**: 메시지마다 프로바이더·모델·입출력 토큰을 저장하고 설정 화면에 월 합계를 보여 준다.

## 이유

사용자 답변 그대로. Queues 는 Pro 에서 이미 쓰고 있어 운영 부담이 없고, 자기 키만 쓰므로 서비스 비용이 없다. 암호화는 DB 유출 시 타인 과금 피해를 막는 최소 조치다.

## 기각된 대안

- `after()` + Cron sweep: Queues 가 재시도·지연을 대신한다.
- Vercel Workflows: 내부적으로 Queues 요금이 추가되고 학습 비용이 크다.
- 서비스 키 무료 한도: 사용자가 "존재할 수 없다" 고 결정.
- 평문 키 저장: 사용자가 위험 안내 후 암호화로 결정.

## 전제

- 로컬 개발에서 Queues 는 `vercel link` 와 `vercel env pull`(OIDC 토큰) 이 필요하다. Vercel CLI 를 최신으로 올리고 이 프로젝트를 링크하는 것은 사용자 작업.
- `APP_ENCRYPTION_KEY` 는 Vercel 환경변수에도 같은 값으로 등록해야 한다(사용자 작업, 값은 문서에 기록하지 않는다).
- 사용자 결정(세션 2 후반): **키 없이 먼저 구현**한다. `APP_ENCRYPTION_KEY` 가 없으면 `/settings/ai` 의 키 등록·AI 기능을 비활성화하고 "암호화 키 미설정" 안내를 보여 주며, 사용자가 `.env` 와 Vercel 에 키를 넣은 뒤 테스트한다. `.env.example` 에는 키 이름만 둔다.
