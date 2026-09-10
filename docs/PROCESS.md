# PROCESS — trip

> 최종 갱신: 2026-09-10 · 대응 커밋: `0ce5c30`(세션 4, sanitize 창을 jsdom 26 으로 고정) + 세션 4 후반 UI 정정(미커밋 변경, 커밋 예정)
> 기준 문서: `~/.claude/convention/*.md`, `~/personal-llm/*.md`, `docs/HANDOFF.md`(세션 진입점), `docs/ARCHITECTURE.md`, `docs/acknowledge/README.md`, `docs/DESIGN.md`

## 완료 — 초기 구축 (2026-09-09, Phase 1~3)

- [x] 0. 분석·합의 — 원본 HTML·DESIGN.md·Calendar 레포 분석, 질문 11건 확정(ADR-0001~0006)
- [x] 1. 스캐폴딩 — bun, Next 16, Tailwind 4, shadcn 4 전 컴포넌트, git(dev/prod), 자동 커밋
- [x] 2. 기반 — DESIGN §16 토큰(globals.css, `.surface-public`), 프로바이더·루트 레이아웃, env, bun test
- [x] 3. DB — drizzle mysql `trip_` 스키마 22 테이블, 마이그레이션 0000·0001 적용
- [x] 4. 인증 — better-auth 이메일·사용자명, proxy 게이팅, 로그인·회원가입
- [x] 5. 데이터 계층 — entities/trip·user-state, API 라우트, 서버 프리페치
- [x] 6. 공개 표면 — 인트로(지구본)·404·앱 셸
- [x] 7. 목록·생성·삭제 — `/trips`, `/trips/new`
- [x] 8. 편집기 — 탭형 구조화 폼, dnd-kit 정렬, Cmd+S
- [x] 9. 뷰어 — 원본 재현, 사용자별 체크·메모, 인쇄 트리, 날짜 탭 오버플로 UX
- [x] 10. 공유 — 멤버 초대, 공개 `/s/[slug]`
- [x] 11. 모션·3D — motion 전역, 실제 지리 지구본, 모션 줄이기 토글
- [x] 12. 오사카 템플릿 — 전수 이식, 시드, 앱 내 생성
- [x] 13. Phase 3 — 목적지(나라)·즐겨찾기 레일·보더 없는 폼 컨트롤
- [x] 14. 검증 — typecheck·lint·182 tests·build 통과. 브라우저 확인 완료 항목: 인트로·회원가입·목록(별표·지구본)·새 트립(나라 콤보박스)·뷰어(체크·뷰 전환·날짜 탭·달력 점프·라이트/다크)·편집기(탭·목적지). 잔여는 `docs/quality-assurance/2026-09-09-viewer-editor-checklist.md`
- [x] 15. 문서 — ARCHITECTURE·data-model·ADR·history·feedback·QA·roadmap·HANDOFF

## 진행 — 세션 2 (2026-09-09)

- [x] 0. 컨텍스트 복원 — HANDOFF·ARCHITECTURE·ADR 16건·roadmap·QA 정독, HANDOFF 3번 코드 전수 대조(테이블 22개·고아 스켈레톤 2개·npm `cn` 미기록 발견)
- [x] 1. 문서 정정 — 테이블 수 22(HANDOFF·PROCESS·ARCHITECTURE), npm `cn` 기록(ARCHITECTURE §1·ADR-0012), 고아 `trip-create-skeleton`·`trip-list-skeleton` 삭제
- [x] 2. Vercel prod 확인 — `trip.gumyo.net` `/`·`/login`·`/signup` 200, `/trips` → `/login?next=` 307, 없는 slug 404
- [x] 3. QA 잔여 실측(라이트·다크) — `/s/[slug]`(공개 토글·404·태그 반영), 인쇄(미디어 규칙 주입 에뮬레이션), 편집기 저장·키보드 정렬·필수값 링 → 체크리스트 13건 체크. 발견·수정 6건은 `docs/bug/2026-09-09-editor-forms-and-print.md`(ADR-0018·0019). 모바일 Sheet 는 브라우저 창 고정으로 미실측
- [x] 4. ADR-0017 회원가입 "이름" 제거(ADR 작성 → Opus 에이전트 구현 → 검증) — `auth.validate`·`signup-form`·`signup-widget`·테스트, `name` 에 사용자명 저장, ARCHITECTURE §4·ADR-0003·roadmap 7 갱신
- [x] 5. 검증(typecheck → lint → prettier → test 183 → build) + 프로덕션 스모크(3001) + 브라우저 확인 + HANDOFF 갱신

## 진행 — 세션 2 후반: 로드맵 착수 (ADR-0022)

- [x] 1단계. 버그 B1(saveDay 하위 id)·B2(기본 정보 toast 1회)·B3(날짜 정렬 낙관적)·B6(JSON 가져오기, ADR-0021)·B8(체크리스트 문구) + 로드맵 9(몇박 며칠, ADR-0020) — Opus 에이전트 2건 병렬 구현 → 3-way 적용 → 마이그레이션 0002 적용 → 브라우저 실측(하위 id 유지, 30ms 낙관적 정렬, JSON 왕복, toast 1회, 7박 5일 표기). B4(shared/ui card·alert·input-group 보더)는 사용처가 없어 보류, 사용 시점에 제거
- [x] 2단계. 로드맵 8 셀형 UI(ADR-0023, `bc18131`) → 1 사이드바 링크·소개 문구(ADR-0024, 마이그레이션 0003, `fddab44`, 브라우저 실측: URL 검증·저장·탭 배지·공개 페이지 링크) → 5 일정 종류(ADR-0025, 마이그레이션 0004 데이터 이관, `ffb5aee`, 실측: 종류 추가·범례·일정 구분 변경·삭제 다이얼로그)
- [x] 3단계. 로드맵 2 서버 경유 R2 업로드 + 예매 첨부(ADR-0026, 마이그레이션 0005, `aab891f`, 실측: R2 미설정 시 업로드 비활성·안내, 링크 첨부 저장·뷰어 표시). R2 키 설정 후 이미지 업로드 실측 필요
- [ ] 4단계. 로드맵 7 Tiptap·YouTube(ADR-0027) → 6 커뮤니티·프로필(대문·사진, ADR-0028). **세션 3 진행 중**
    - [x] 4-0. 컨텍스트 복원·문서-코드 대조(불일치 4건 보고: 문서 헤더 stale·auto-push false·dev 서버 PID 교체·Vercel CLI 구버전) → 질문 4건 추천안 승인 → ADR-0031, `llm-rules.auto-push true`
    - [x] 4-1. 의존성 고정: `@tiptap/{core,react,starter-kit,pm,extension-youtube,extension-link,extension-image,html}@3.31.3` + `isomorphic-dompurify@4.2.0`, `happy-dom` 을 dependencies 로(`npx bun@1.3.14 install`)
    - [x] 4-2. Workflow(ADR-0031, run `wf_896d6110-973`, 에이전트 8·51분, 리뷰 17건 → 적용 14·오탐 1·범위 밖 2): API 사실 확인(Sonnet, node_modules 1차 출처) → `shared/lib` 확장 목록·서버 렌더·sanitize·문서 검증 + 테스트(Opus max) → `features/editor` 에디터 UI + 테스트(Opus max) → 리뷰 3렌즈 보안·컨벤션·FSD(Opus high) → 확정 지적 수정(Opus max)
    - [x] 4-3. 메인 검증(typecheck·lint·prettier·test 305·build 통과, 범위 밖 지적 2건은 메인이 처리: `UPLOAD_DISABLED_HINT` shared 승격·ARCHITECTURE §2·§12) → ADR-0027 구현 메모 → 문서 헤더 갱신 → 커밋 → push·prod 머지(화면 미연결, ADR-0031)
    - [ ] 4-4. 로드맵 6(ADR-0028 + 구현 세부 ADR-0032)
        - [x] 4-4a. Workflow A(`wf_82e6e3fc-3bc`, 에이전트 5·49분, 리뷰 15건 → 적용 11·범위 밖 2·시그니처 유지 1) → 마이그레이션 0006 적용(이력 7행·테이블 32·게시판 3행) → `c152820`: 사실 확인(Sonnet) → 데이터 계층(스키마·마이그레이션 0006·entities·액션·쿼리·admin 플러그인·set-admin, Opus max) → 리뷰 2렌즈(Opus high) → 수정 → 메인: SQL 검토·`bun run db:migrate`·커밋
        - [x] 4-4b. Workflow B(`wf_4da023f7-876`, 3 에이전트 순차·52분, 워크트리 미사용) → `8640392`: UI-A(프레임·홈·인트로 섹션·탐색·`/s/[slug]` 이동·좋아요·셸·proxy, 메인 트리) ∥ UI-B(게시판·글·댓글·채택·에디터 연결·프로필, 워크트리) → 메인 patch 이식
        - [x] 4-4c-1. Workflow C(`wf_8d07ef83-242`, 리뷰 4렌즈 17건 + 메인 결정 10건: route group `(shell)` 통합·`aria-current`·`Route<T>` 제네릭·`React.cache`·`findLatestPostsByBoard`·작성자 조회수 제외 등) → 검증 통과 → 문서·커밋(`e0aa431` ADR-0033, `8640392` UI)
        - [x] 4-4c-2. 브라우저 실측 1차(`docs/quality-assurance/2026-09-10-community-editor-checklist.md`): 에디터·글 CRUD·댓글·좋아요·탐색·프로필·설정 확인, 버그 2건 수정(ProseMirror attrs `$T` 직렬화 → `toPlainDocument`, 다이얼로그 submit 버블링)
        - [x] 4-4c-3. 세션 4(2026-09-10) 마무리: 남은 실측(라이트 모드 상세·게시판·프로필, 질문 게시판 채택 +2/+10 원장, 댓글·글 삭제, 비로그인 인트로 하단·글 상세 라이트·다크) → 사용자 지적 댓글 UI 정리(`7adc2fa`) → 문서 정정 → push·prod 머지·배포 확인. QA 데이터는 전부 유지(사용자 결정, 나중에 일괄 삭제). 미실측: 공개 헤더 액션 셀(→ 4-4d 에서 확인), 관리자 삭제 UI(관리자 계정 없음, 역할 로직은 단위 테스트)
        - [x] 4-4c-4. prod 글 상세 500(jsdom `require(esm)`) → `isomorphic-dompurify` 대신 `dompurify` + `jsdom` 26.1 정확 고정(`0ce5c30`). happy-dom 창은 under-sanitize 로 기각. 원인·대안 비교는 `docs/bug/2026-09-10-post-detail-500-on-vercel.md`
        - [x] 4-4d. 세션 4 후반 UI 정정(ADR-0034, 미커밋 — `feat(app-shell)` + `fix(ui)` 커밋 예정): 레일 게시판 tree(`nav-sub-item`·`NavItemLink.children`·`isNavParentActive`, 활성 마커 1개 테스트 고정) · 편집기 행 셀형 정렬(`sortable-row` 셀 구조·`EDITOR_LABEL_LINE_CLASS`·날짜 탭 3열·여행 정보 섹션 헤더 셀 행·`DAY_TABLE_HINT`) · 트립 카드 배지 → 텍스트(`TRIP_STATUS_TEXT_CLASS`) · 모바일 1열(`grid-cols-1`·`min-w-0`·`break-keep`) · DESIGN §6-4·§10-11 개정. 브라우저 실측(A~F, 라이트·다크) 후 지적 4건 반영(`allowedDevOrigins`, 공개 헤더 셀 상시 렌더, 라이트 `--sidebar-border` 대비, 카드 `w-full`) → 재확인 통과. 검증 typecheck·lint·format·`bun test` 459
        - [ ] 4-4e. 지구본 확장(ADR-0035 예정): 트립별 출발 공항 컬럼 + 마이그레이션 0007, `/trips` 지구본 드래그 회전, 선 hover 툴팁(출발→도착 코드·도시 + 트립 제목·기간), 선 클릭 시 해당 트립만 필터(URL 쿼리, `/trips` 목록에 적용)
    - [ ] 4-5. 로드맵 6 확장(ADR-0036 예정, ADR-0033 §3): 마이그레이션(soft delete·신고·차단·원장 revoked), 채택 변경·취소(+포인트 회수), 댓글 수정, 신고·`/admin/reports`·밴, 사용자 간 차단, 사용자명 변경
- [ ] 5단계. i18n ko·ja·en(ADR-0033 §4): next-intl, 프리픽스 as-needed, 쿠키, 언어 전환 셀, 전 문구·검증·toast·메타데이터 카탈로그화, 날짜·숫자 locale 포맷
- [ ] 6단계. 인증 확장(ADR-0033 §2): Naver·GitHub OAuth, 이메일 인증(Cloudflare mail worker, 리서치 후), 약관·동의(`docs/legal/` ko→ja·en, korean-law-mcp)
- [ ] 7단계. 로드맵 4 AI(ADR-0029: Vercel Queues, 자기 키만, AES-GCM, `APP_ENCRYPTION_KEY` 없이 구현 후 키 등록 시 테스트)
- [ ] 8단계. 로드맵 10 SEO·GEO·JSON-LD·Analytics·Speed Insights(ADR-0030, hreflang·locale 별 sitemap 포함)

## 미착수

- [ ] QA 잔여: 모바일 Sheet 닫힘 포커스 복귀, 편집기 검증 오류 문구 한국어화(사용자가 직접 본 뒤 결정), 일정 종류 `key` 입력란 노출 여부, R2 설정 후 이미지 업로드
- [x] 로드맵 3 OSM 은 제거(ADR-0033 §1), 7 의 OAuth·이메일 인증·약관은 6단계로 착수(ADR-0033 §2)
- [ ] 사용자 작업: `.env`·Vercel 환경변수에 `APP_ENCRYPTION_KEY`·`R2_ACCOUNT_ID`·`R2_ACCESS_KEY_ID`·`R2_SECRET_ACCESS_KEY`·`R2_BUCKET`·`R2_PUBLIC_BASE_URL` 추가, `.env.example` 에 이름 추가(AI 는 `.env*` 접근 불가), R2 커스텀 도메인 연결, Vercel CLI 링크(`vercel link`, Queues 로컬 개발용)

### 진행 메모

- Vercel: 브랜치 `prod`(Pro 플랜), 환경변수 `DATABASE_URL`·`BETTER_AUTH_SECRET`·`BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL`(+선택 `SEED_OWNER_EMAIL`). 락파일 v1(ADR-0013, 의존성 추가 시 `npx bun@1.3.14 install`).
- DB: 공용 MySQL(로컬·prod 동일). 마이그레이션 0000~0006 적용됨. 마이그레이션이 컬럼을 지우면 이전 배포 코드가 깨지므로 적용과 push·배포를 연달아 한다.
- 공개 페이지 캐시: `PublicTrip` 형태(컬럼·관계)가 바뀌면 `entities/trip/trip.cache.ts` 의 `PUBLIC_TRIP_CACHE_VERSION` 을 올린다. 로컬 `updateTag` 는 prod 데이터 캐시를 비우지 못하고, Vercel 데이터 캐시는 배포를 넘어 유지된다.
- 검증 계정: tester@example.com / 사용자명 tester(오사카 예시 트립, 공개 slug `osaka-qa`), throwaway `qa_session2_204103@example.com`(세션 4 채택 실측으로 포인트 12).
- dev 서버(세션 4 결정): trip 은 **:7777**(`bun run dev -p 7777`). :3000 은 다른 프로젝트(gumba)가 쓴다. `.env` 의 `BETTER_AUTH_URL`·`NEXT_PUBLIC_APP_URL` 도 7777 로 맞춰야 로그인·로그아웃·공개 헤더 `useSession` 이 동작한다(사용자 작업, AI 는 `.env` 접근 불가).
- QA 데이터(세션 4 결정): 공용 DB 의 QA 흔적(자유게시판 글 `050aa2f0`·댓글·좋아요, 질문 글 `ce90f6b2`·채택 댓글·원장 +2/+10, 오사카 트립 좋아요, tester 소개)은 전부 유지하고 나중에 한 번에 삭제한다.
- 브라우저 캡처(세션 4): 백그라운드 탭에서는 motion 의 페이지 fade·reveal 이 늦게 끝나 옅게 찍힌다 → 캡처 전 `[style*="opacity"]{opacity:1!important;transform:none!important}` 스타일을 주입한다(측정용, 코드 아님). 비로그인 표면은 `http://[::1]:7777`(쿠키 분리, 확장 권한 허용)로 본다. 127.0.0.1 은 확장 권한이 없다.
- 에이전트 운용(ADR-0031, 세션 3): `Agent` 도구 금지, 위임은 `Workflow` 의 `agent()` 로만. 구현 Opus max·리뷰 Opus high·리서치/사실 확인 Sonnet. 파일을 동시에 바꾸는 에이전트가 2개 이상일 때만 `isolation: 'worktree'`. 워크트리 결과는 `git -C <wt> diff HEAD` patch 를 `git apply --3way` 로 이식하고 신규 파일은 복사, 마이그레이션은 메인에서 `bun run db:generate` 로 다시 생성. 끝난 워크트리는 `git worktree remove --force`(push 와 같은 명령에 두면 가드 훅이 `-f`·"fast-forward" 문자열을 force push 로 오인해 차단하므로 분리).
- 에이전트 운용(세션 4 지시, ADR-0031 운용 메모 추기): **메인(Fable)은 사용자 대화와 Workflow 지시·취합 등 orchestration 만** 한다. 구현·리뷰·검증·브라우저 실측·문서 편집·커밋·push·마이그레이션 적용·배포 확인은 전부 Workflow 에이전트가 수행한다. 모델 배분과 `Agent` 도구 금지는 그대로.
- 게시판 목록 계약(ADR-0034): `shared/constant/community.ts` 의 `DEFAULT_BOARDS` 는 마이그레이션 0006 시드와 레일 하위 메뉴가 함께 참조한다. 게시판을 추가·변경하면 **두 곳을 같이** 고친다.
- dev 오리진(ADR-0034): `next.config.ts` 의 `allowedDevOrigins` 에 `localhost`·`127.0.0.1`·`[::1]` 을 둔다. 없으면 Next 16 의 크로스 사이트 dev 차단이 `[::1]` 오리진의 `/_next/*` 를 403 으로 막아 비로그인 검증용 루프백 호스트가 하이드레이션되지 않는다(프로덕션 빌드에는 영향 없음).
- 문서 드리프트(알고 있음): 라이트 `--sidebar-border` 를 `--palette-neutral-708` 로 올려 `docs/DESIGN.md` 139·235 행(`neutral-900` = sidebar-border light)과 어긋난다. DESIGN 은 외부 원본이라 팔레트 표는 고치지 않는다(ADR-0034 §6).
