# ADR-0040 — Phase 7 AI implementation and current provider API decisions (2026-09-12)

ADR-0029 remains the product decision: users supply their own provider key, keys are encrypted at rest, there is no service-owned free tier, jobs are durable, and itinerary changes require an explicit approval step. This record captures the implementation and current primary-source API checks performed before coding.

## Current primary-source checks

- [Vercel Queues](https://vercel.com/docs/queues) documents `send(topic, payload)` and push consumers with `handleCallback`, with queue triggers configured in `vercel.json`. The implementation keeps the topic `ai-job`, uses an idempotency key, and includes a local deterministic fallback only when the SDK/queue credentials are unavailable.
- [Vercel Queues API](https://vercel.com/docs/queues/api) documents the v3 topic endpoint and bearer OIDC authentication for publishing. The REST fallback uses `VERCEL_QUEUE_URL` and `VERCEL_QUEUE_TOKEN`; callback authentication stays with the SDK `handleCallback`/Vercel OIDC boundary and does not reuse the publish token.
- [OpenAI Models API](https://platform.openai.com/docs/api-reference/models) documents `GET https://api.openai.com/v1/models` with bearer authentication. Model membership is checked against this response before a job is created.
- [Anthropic Models API](https://docs.anthropic.com/en/api/models) is queried with `x-api-key` and `anthropic-version: 2023-06-01`. Current Anthropic guidance uses adaptive thinking and `output_config.effort`; the client exposes effort only for Claude model IDs and validates it server-side.
- [Ollama Cloud](https://docs.ollama.com/cloud) documents `GET https://ollama.com/api/tags` and bearer-authenticated `/api/chat`. Ollama reasoning controls are not exposed because the official API does not provide a stable per-model effort capability in the listing response.

## Implementation decisions

- `trip_ai_key` stores only ciphertext, IV, GCM tag, and the final-four hint. `APP_ENCRYPTION_KEY` is optional at application startup; key registration and AI jobs stay disabled until it is a valid base64 32-byte key.
- Provider model lists are cached in-process for ten minutes per user/provider and never keyed by or logged with the secret. The server revalidates provider/model membership and reasoning effort on every job request.
- Conversations, messages, jobs, usage, and typed proposals are persistent. Job failures are recorded with a bounded error string; provider prompts and secrets are never logged.
- Proposals are validated into a small change schema. The UI displays a human-readable preview; approval and application are separate authenticated operations. Application maps the typed diff through the existing `saveDay` reconciliation/validation domain operation.
- The SDK `handleCallback` route performs the Vercel queue callback parsing, receipt handling, acknowledgement, and retry protocol. `VERCEL_QUEUE_TOKEN` is only needed for the documented REST publish fallback; production deployments using the SDK should configure the queue trigger and Vercel OIDC runtime.
- `AI_PROVIDER_MOCK=1` is a test-only deterministic provider adapter. It must never be set in a production deployment; no service-owned key or free tier is introduced.

## Operational smoke steps

1. Set `APP_ENCRYPTION_KEY` with `openssl rand -base64 32` and one user-owned provider key.
2. Run migration 0011, open `/settings/ai`, and confirm only the provider hint is visible after saving.
3. Open a member trip, load models, ask a question, and verify polling reaches `done` after the browser is refreshed.
4. Submit a change proposal, verify the preview, reject it once, then submit another proposal and approve/apply it. Confirm the trip editor/viewer domain rules still validate the resulting schedule.
5. On Vercel, configure the `ai-job` trigger and queue region/token; verify a failed provider request increments `attempts` and reaches `failed` without exposing prompt content.
