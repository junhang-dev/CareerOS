# CareerOS Session Handoff

## 프로젝트 개요

CareerOS는 개인의 채용 탐색, 커리어 자산 관리, 지원 준비를 하나의 흐름으로 연결하는
웹 우선 싱글유저 MVP다. 다만 제품 방향은 "채용 플랫폼"이 아니라 LinkedIn, 리멤버,
GitHub, 포트폴리오, PDF 이력서에 보여줄 나를 내부에서 정리하는 Career Branding Studio로
재정의했다.

핵심 3축:

1. Career Evidence: 경력, 프로젝트, 자격증, 논문, 증빙 파일 축적
2. Career Narrative: 직무별 포지셔닝과 커리어 스토리 정리
3. Channel Output: 국문 경력기술서, 영문 Resume, LinkedIn/리멤버/GitHub/포트폴리오 문구 생성

설계 원칙:

- 웹 우선
- 모듈러 모놀리식
- 이후 모바일/멀티유저 확장 가능하도록 도메인 경계 유지
- 자동 제출보다 승인 기반 플로우 우선
- 민감정보는 일반 데이터와 분리
- 제출 자동화보다 내부 기록과 브랜딩 정리를 우선

## 현재 구현 범위

완료:

- `/application-assistant`를 지원 맞춤 워크벤치로 재구성
- 규칙 기반 `application-workbench` 서비스 추가
- 기존 공고 선택 또는 새 JD 붙여넣기 기반 지원 준비 생성
- 국내/해외 데이터분석가 주니어·전환 지원 전략과 국문/영문 bullet preview 생성
- `search_profiles` writable CRUD
- `job_postings` 수동 입력/수정
- `job_posting_versions` 최소 입력 경로
- `career_profiles`, `career_experiences`, `career_projects` writable CRUD
- `application_preparations` 생성/수정/삭제
- `career_documents` 메타데이터 CRUD
- `/job-postings/[jobPostingId]` 수동 분석 실행
- deterministic stub 기반 `job_analyses`, `gap_analyses` 생성/갱신
- `career-assets` 입력 검증/에러 계약 통합
- memory / postgres 두 드라이버 모두 같은 계약으로 동작

seed 데이터 메모:

- 공개 브랜치에는 개인 실명, 로컬 다운로드 경로, 실제 이력서/자격증/지원서 내용이 들어간 seed를 커밋하지 않는다.
- 실제 개인 자료를 반영해야 할 때는 로컬 전용 seed 또는 별도 비공개 저장소/환경 파일로 다룬다.
- 현재 공개 seed는 앱 동작 확인용 demo 데이터로 유지한다.

현재 사용자 플로우:

1. 탐색 프로필 관리
2. 수동 공고 입력
3. 커리어 프로필/경력/프로젝트 입력
4. 커리어 문서 자산 입력
5. 지원 맞춤 워크벤치에서 기존 공고 선택 또는 새 JD 붙여넣기
6. 국내/해외 지원 전략과 국문/영문 bullet preview 확인
7. 진행 중인 지원 준비의 전략 메모와 연결 문서 관리

## 이번까지 검증된 상태

정적 검증:

- `npm run check`
- `npm run build --workspace @careeros/web`

런타임 검증:

- `node --import tsx --test apps/web/src/server/services/application-workbench.test.ts apps/web/src/server/services/career-assets-contract.test.ts`
- `/career-assets`, `/application-assistant`, `/job-postings/[jobPostingId]`, `/` 반영 확인 완료
- `career profile / experience / project` CRUD 반영 확인 완료
- 문서 삭제 시 preparation의 `targetResumeId` 해제 확인 완료
- `/application-assistant`에서 지원 워크벤치 HTML 반영 확인 완료

현재 서버 상태:

- 마지막 작업 중 `npm run dev:web` 서버를 `http://127.0.0.1:3000`에서 실행했다.
- 마무리 시에는 실행 중인 dev 서버를 종료한다.
- 다시 시작하려면 `npm run dev:web`를 실행한다.

최신 주요 커밋:

- 이번 세션 커밋:
  - `feature: 커리어 자산 입력 계약을 정리하라`
  - `feature: 지원 맞춤 워크벤치를 추가하라`
  - `docs: 커리어 브랜딩 방향을 정리하라`
- `a17d7cd feature: 커리어 자산 CRUD를 확장하라`
- `1a7d770 docs: 다음 세션 인수인계를 정리하라`
- `23f48b9 feature: 자산 입력과 수동 분석을 추가하라`

## 현재 중요한 제약

- 실제 파일 업로드 없음
- PDF/DOC 파싱 없음
- 외부 채용 소스 adapter 없음
- 큐/워커 실행기 없음
- 분석은 deterministic stub이며 LLM 호출 없음
- 워크벤치 생성 결과는 preview이며 아직 `application_documents`로 자동 저장하지 않음
- 실제 개인 자료 seed는 공개 커밋에서 제외함

## 다음 세션 권장 우선순위

1. 로컬 개인 자료 import 방식을 비공개 경로로 설계하기
2. 실제 개인 자료 기반 `국문 경력기술서 v1` 생성 화면/문서 만들기
3. `영문 Resume v1` 생성 화면/문서 만들기
4. LinkedIn / 리멤버 / GitHub / 포트폴리오용 채널별 문구 생성
5. 워크벤치 preview를 `application_documents` 초안으로 저장하는 기능 추가
6. PDF/MD 파일 텍스트 추출을 앱 내부 import 기능으로 연결
7. `career-assets` 입력 검증 에러를 실제 사용자 메시지로 연결

## 다음 세션 시작 체크리스트

1. `git status`
2. `git pull --ff-only`
3. `git log -3 --oneline`
4. `npm run check`
5. 필요 시:
   - `CAREEROS_DATA_DRIVER=memory npm run dev:web`
   - `CAREEROS_DATA_DRIVER=postgres npm run db:push`
   - `CAREEROS_DATA_DRIVER=postgres npm run dev:web`

## 참고 파일

- `README.md`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/career-assets/page.tsx`
- `apps/web/src/app/job-postings/[jobPostingId]/page.tsx`
- `apps/web/src/app/application-assistant/page.tsx`
- `apps/web/src/server/repositories/types.ts`
- `apps/web/src/server/repositories/analysis-stub.ts`
- `apps/web/src/server/services/application-workbench.ts`
- `apps/web/src/server/data/mock-state.ts`
- `docs/architecture/system-overview.md`
- `docs/product/product-principles.md`
- `docs/product/career-branding-studio.md`
