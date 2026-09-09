# HANDOFF — 2026-09-09 세션 2 스냅샷

> 대응 커밋: `95d1cc4`(로컬 dev). **origin/dev·origin/prod 는 `beb00c1` 이며 아직 push 하지 않았다**(사용자 지시 시 push + dev→prod fast-forward). 이 문서는 새 세션의 단일 진입점이며 매 핸드오프마다 덮어쓴다.
> 복기 신뢰도: 세션 2 전체 대화 기준. 서브에이전트(Opus 2건: motion 원인 분석, 회원가입 구현)는 최종 보고서 기준이며 결과는 메인이 브라우저·API 로 재검증했다.

## 1. 프로젝트 한 줄 정의

정적 오사카 일정 HTML(`docs/osaka-trip-interactive.html`)을 로그인 기반 다중 트립 여행 노트 앱(Next 16 + MySQL + better-auth + TanStack Query + motion + R3F 지구본)으로 재구현해 `trip.gumyo.net`(Vercel, 브랜치 `prod`)에 배포하는 프로젝트.

## 2. 현재 목표

- 최종 목표: 여행 일정·예매·정보를 구조화해 관리·공유하고(로드맵: 커뮤니티·AI·지도·에디터까지), DESIGN.md 의 "배경 계층·보더 없음" 디자인을 사용자의 해석대로 구현.
- 현재 마일스톤: 초기 구축 완료 + Vercel prod 배포 성공 확인(`beb00c1`). 세션 2 에서 QA 잔여 실측과 버그 6건 수정, 로드맵 7 의 첫 항목(회원가입 이름 제거) 완료. 다음은 push·prod 머지와 로드맵 다음 항목 선택.
- 직전 작업: 회원가입 이름 제거 구현·검증 → 문서 정리 → 이 핸드오프.

## 3. 완료 / 진행 중 / 미착수

### 완료 (세션 2, 커밋 순)

- `dfb481e` chore: 문서-코드 동기화(테이블 22개, npm `cn` 기록, `features/trips/trip-create-skeleton.tsx`·`trip-list-skeleton.tsx` 삭제).
- `6e26b29` fix(editor): RHF `register()` 컴포넌트 13개 `'use no memo'`(ADR-0018), `SortableRows` 의 `AnimatePresence`·`exit` 제거 + `DndContext id={useId()}`(ADR-0019).
- `37fad63` fix(viewer): `app/globals.css` 의 `.dark` 토큰·`.dark .surface-public`·`@custom-variant dark` 를 `@media screen` 한정(인쇄는 항상 라이트), 표 `break-inside-avoid`(`day-panel.tsx` 사실 표 래퍼, `day-summary-table.tsx`), dead `.print-hidden/.print-visible` 제거.
- `7b1fc34` docs: QA 체크리스트 결과, ADR-0018·0019, `docs/bug/2026-09-09-editor-forms-and-print.md`, PROCESS·ARCHITECTURE.
- `95d1cc4` feat(auth): `signupSchema` 에서 `name` 제거, `SignupForm` 이름 필드 제거, `SignupWidget` 이 `name: values.username`, `NAME_MAX_LENGTH` 삭제, 테스트 183(ADR-0017).
- 문서 커밋(이 문서 포함): ADR-0017, ADR-0003 메모, roadmap 7 이력 표시, history 세션 2, PROCESS.

### 세션 1 완료분(변경 없음)

스캐폴딩·DB 22 테이블·인증·데이터 계층·화면 전부·3D·모션·템플릿·문서. 상세는 `docs/ARCHITECTURE.md`, 이력은 `docs/history/2026-09-09-initial-build.md`.

### 진행 중

- 없음(코드 변경은 모두 커밋됨).

### 미착수

- push·prod 머지(사용자 지시 시).
- QA 잔여: 모바일 Sheet 닫힘 시 포커스 복귀(가려진 탭에서 애니메이션 정지로 미확정), JSON 가져오기(미구현), 편집기 검증 오류 문구 한국어화(`shared/lib/trip-template.ts` 의 `tripTemplate*Schema` 가 zod 기본 영어 메시지 "Too small: expected string to have >=1 characters" 를 그대로 노출). 체크리스트 §1~5·7·8·12 는 세션 1 확인분이며 세션 2 에서 재확인하지 않았다.
- 로드맵 나머지: 1~~6, 7 의 OAuth·이메일 인증·약관·후기 게시판·Tiptap 에디터, 8~~10. 순서는 사용자가 정한다.
- 알려진 개선 후보(코드 미변경): `saveDayAction` 이 하위 행 id 를 반환하지 않아 새 날짜를 연속 저장하면 하위 행이 재생성됨; 기본 정보 탭 저장 시 toast 2개(기본 정보 + 목적지); 날짜 정렬은 낙관적 아님; `shared/ui/input-group.tsx`·`alert.tsx`·`card.tsx` 보더; R3F `THREE.Clock` 경고(업스트림); 편집기 탭이 수평 스트립이라 QA §6 "탭 목록 수직 정렬" 문구와 어긋남(문구 정정 또는 디자인 판단 필요).

## 4. 의사결정 요약 (상세·기각 대안은 `docs/acknowledge/`)

| ADR  | 결정                                                                                       | 기각된 대안                                      |
| ---- | ------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 0001 | bun · Next 16 · shadcn 4 · drizzle mysql2 · better-auth · TanStack · motion · R3F · TS 5.9 | Turso, pnpm, GSAP 병용, Google Maps 임베드, TS 7 |
| 0002 | 데이터 전부 구조화(산문도 행)                                                              | Markdown 필드, JSON 문서                         |
| 0003 | 이메일·비밀번호 + 사용자명 로그인, 초대 자동 수락                                          | OAuth(로드맵 7 재도입), 사용자명 `-` 허용        |
| 0004 | 테이블 `trip_`·쿠키 `trip.` 프리픽스                                                       | 프리픽스 없음                                    |
| 0005 | owner/editor/viewer + 공개 링크, 체크·메모는 사용자별                                      | 소유자 전용, 트립 공유 체크, localStorage        |
| 0006 | 지도는 Google Maps 검색 링크만                                                             | 임베드 지도                                      |
| 0007 | 모션 항상 동작(OS reduce-motion 무시), 앱 내 토글                                          | `reducedMotion='user'`, 페이드만                 |
| 0008 | 지구본은 실제 지리, 정보 있는 곳에만                                                       | 와이어프레임, 장식용 미니 지구본                 |
| 0009 | `prod`(배포)/`dev`(작업), 자동 커밋, push·머지는 지시 시                                   | main 직접 커밋                                   |
| 0010 | cacheComponents 끔, 서버 프리페치 완성 HTML, 공유 페이지만 unstable_cache                  | PPR + `use cache`, SWR revalidateTag             |
| 0011 | 배경 계층·1px 심·보더 없음(표 예외)·셀형 버튼·dvh 채움                                     | 12px 인셋, bg-sidebar 재사용, 탭 밑줄            |
| 0012 | shadcn 55개 설치 후 우선 사용(`cn` 은 npm `cn` 패키지 재export)                            | 손으로 만든 UI                                   |
| 0013 | 락파일 v1 + `bun@1.3.14`                                                                   | Vercel Bun 버전 상향                             |
| 0014 | 오사카 템플릿 상수 + 시드 + 앱 내 버튼                                                     | 시드 전용, 링크 배열 스키마                      |
| 0015 | 날짜 탭: 화살표 셀·스크롤 표시·달력 점프                                                   | 그라데이션                                       |
| 0016 | `trip_destination`(나라·도시) + `trip_favorite` 레일                                       | 도시 지오코딩, 사이드바 추가와 즐겨찾기 분리     |
| 0017 | 회원가입은 사용자명·이메일·비밀번호만, `name` 에 사용자명 저장                             | 이름 선택 입력, `name` nullable, 이메일 로컬파트 |
| 0018 | RHF `register()` 폼 컴포넌트는 `'use no memo'` 로 React Compiler 제외                      | `keepFieldsRef`, `keepValues`, Controller 전환   |
| 0019 | 편집기 정렬 행은 진입 페이드만, `AnimatePresence`·exit 없음, `DndContext id`               | 안정 key 전환, children 안정화                   |

## 5. 사용자 방향성 & 작업 규칙

- 답변: 한국어 존댓말, 간결, 자축·"완벽" 단언 금지, 검증 안 된 것은 안 됐다고 말한다. 모호하면 1줄 객관식으로 묻되 한 번에 모아서. 세션 2 에서 사용자는 제안(문서 정정·기존 dev 서버 사용·로드맵 7 우선)을 "추천대로" 승인하고 "끝까지 다 해봐" 로 위임했다.
- 코드: `~/.claude/convention` + `~/personal-llm` 전부 적용(arrow only, 주석 금지, any/enum 금지, FC<Props>, useCallback/useMemo 금지, FSD 위→아래, barrel 금지, zod v4, RHF+zodResolver, 토큰 색만, 이모지 금지, 매직넘버 상수화). effect 안 setState 금지 → `useSyncExternalStore`·observer 콜백. **예외**: RHF `register()` 컴포넌트는 `'use no memo'`(ADR-0018) — 새 폼도 같은 규칙.
- 디자인(반복 지적): 보더 대신 배경색 계층과 1px 심, 표만 보더 허용. 레일/콘텐츠 사이드바/탭/콘텐츠가 서로 다른 톤. 콘텐츠 사이드바는 콘텐츠 영역 전체 높이, 콘텐츠는 min-height dvh. 탭·버튼은 셀처럼. 텍스트가 가장자리에 붙지 않게. 3D 는 정보 있는 곳에만. 모션은 적극적으로, 항상 동작. 인쇄는 항상 라이트 토큰.
- 성능: 초기 화면에 스켈레톤 금지 — 서버 프리페치로 완성 HTML.
- 도구: shadcn 컴포넌트 우선. 서브에이전트는 Opus, 메인은 지휘·정본·재검증. Workflow 사용은 상시 opt-in.
- Git: Conventional Commits(영어 소문자), author 사용자 단독, `Co-Authored-By`·Claude 트레일러 금지, `git add -A` 금지, force push 금지. 자동 커밋 ON(dev). push 와 dev→prod fast-forward 머지는 사용자가 지시할 때.
- 문서: 결정은 `docs/acknowledge`(ADR 1건 1파일), 진행은 `docs/PROCESS.md`, 버그는 `docs/bug`, 추후 계획은 `docs/roadmap.md` 에만 적고 구현하지 않는다. README.md 는 지시 전까지 손대지 않는다. personal-llm 은 갱신하지 않는다.
- `.env`: 값을 읽거나 출력하지 않는다(키 추가는 `echo >>`). 키: `DATABASE_URL`·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`·`SEED_OWNER_EMAIL`.

## 6. 미해결 질문 / 사용자 확인 필요

- push + dev→prod 머지 시점(세션 2 커밋 6건 미push).
- 로드맵 다음 항목 순서(1~~6, 7 나머지, 8~~10).
- QA §6 "탭 목록 수직 정렬" — 현재 구현은 수평 탭 스트립. 문구 정정인지 디자인 변경인지.
- 편집기 검증 오류 문구 한국어화 범위(템플릿 스키마 전체 메시지).

## 7. 환경 & 전제

- Node 22 / Bun 1.4.0 로컬(락파일 v1, `packageManager bun@1.3.14`), pnpm 미사용. Vercel CLI 미링크(`.vercel` 없음), 배포 확인은 curl.
- 실행: `bun run dev`(:3000, 세션 2 종료 시점에 이전 세션의 `next-server` PID 79590 이 계속 떠 있음) · `bun run build`(세션 2 에서 `.next/` 에 프로덕션 산출물 생성됨, dev 는 `.next/dev`) · `bun run start -p 3001`(프로덕션 스모크에 사용, 종료함).
- DB: MySQL 9.6, 스키마 `trip`, 테이블 22개 + `trip___drizzle_migrations`. 로컬 계정: tester@example.com(사용자명 tester, 오사카 예시 트립 1개, 공개 slug `osaka-qa` 켜짐), 세션 2 검증용 throwaway `qa_session2_204103@example.com`(트립 없음, 비밀번호 미기록 — 삭제해도 됨).
- 브라우저 자동화 메모: 가려진 탭(`document.visibilityState === 'hidden'`)에는 클릭·키 입력이 전달되지 않고 motion 애니메이션이 정지한다 → 페이지 내 스크립트(native setter + `input` 이벤트, `execCommand('insertText')`, 창 `keydown`, `fetch` 가로채기)로 검증했고 스크린샷·JS 는 정상. localhost:3000 은 이전 탭에서 줌 50% 였고, `tabs_context_mcp(createIfEmpty)` 가 만든 새 창은 폭 500px(모바일 레이아웃). 인쇄는 스타일시트의 `@media print` 규칙(레이어 포함)을 `<style>` 로 주입하고 `@media screen` 규칙을 끄는 방식으로 에뮬레이션했다.
- 참조 원본: `docs/DESIGN.md`, `docs/osaka-trip-interactive.html`. Google Maps API 키·메일 서버 없음.

## 8. 다음 세션 TODO (우선순위 순)

1. 사용자 지시 시 `git push origin dev` → `prod` fast-forward → Vercel 재배포 후 `/`·`/login`·`/signup`·`/trips` 응답 확인.
2. 로드맵 다음 항목을 사용자에게 확인 → ADR-0020 부터 → 구현.
3. QA 잔여: 창을 앞으로 가져온 상태에서 모바일 Sheet 닫힘 포커스 복귀 확인, 편집기 검증 문구 한국어화 여부 결정.
4. 알려진 개선: `saveDayAction` 하위 id 반환(`entities/trip/trip.repository.days.ts`·`trip.action.ts`), 기본 정보 탭 toast 중복(`widgets/trip-editor/basics-tab.tsx`), 남은 보더(`shared/ui/input-group.tsx`·`alert.tsx`·`card.tsx`).

## 9. 문서 지도

- `docs/HANDOFF.md` — 이 문서(세션 진입점)
- `docs/ARCHITECTURE.md` — 스택·폴더·라우트·인증·데이터 계층·인가·계층/모션·3D·템플릿·검증(정본)
- `docs/memory/data-model.md` — 22 테이블 요약과 원본 HTML 대응
- `docs/acknowledge/README.md` + `ADR-0001~0019` — 결정·이유·기각 대안
- `docs/roadmap.md` — 다음 페이즈 계획 10건(7 의 이름 제거만 완료)
- `docs/PROCESS.md` — 체크리스트·진행 메모
- `docs/history/2026-09-09-initial-build.md`, `docs/history/2026-09-09-session-2.md` — 세션 이력
- `docs/bug/2026-09-09-editor-forms-and-print.md` — 세션 2 버그 6건
- `docs/feedback/2026-09-09-viewer-visual-feedback.md` — 사용자 시각 지적과 교정
- `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md` — 브라우저 검증 체크리스트(세션 2 주석 포함)
- `docs/DESIGN.md`, `docs/osaka-trip-interactive.html` — 외부 원본(수정 금지)
