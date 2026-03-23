# CareerOS Session Handoff

## 프로젝트 개요

CareerOS는 개인의 채용 탐색, 커리어 자산 관리, 지원 준비를 하나의 흐름으로 연결하는
웹 우선 싱글유저 MVP다.

핵심 3축:

1. 맞춤 채용공고 탐색 및 분석
2. 개인 커리어 자산 관리 및 역량 갭 분석
3. 반자동 지원 비서 기능

설계 원칙:

- 웹 우선
- 모듈러 모놀리식
- 이후 모바일/멀티유저 확장 가능하도록 도메인 경계 유지
- 자동 제출보다 승인 기반 플로우 우선
- 민감정보는 일반 데이터와 분리

## 현재 구현 범위

완료:

- `search_profiles` writable CRUD
- `job_postings` 수동 입력/수정
- `job_posting_versions` 최소 입력 경로
- `career_profiles`, `career_experiences`, `career_projects` writable CRUD
- `application_preparations` 생성/수정/삭제
- `career_documents` 메타데이터 CRUD
- `/job-postings/[jobPostingId]` 수동 분석 실행
- deterministic stub 기반 `job_analyses`, `gap_analyses` 생성/갱신
- memory / postgres 두 드라이버 모두 같은 계약으로 동작

현재 사용자 플로우:

1. 탐색 프로필 관리
2. 수동 공고 입력
3. 커리어 프로필/경력/프로젝트 입력
4. 커리어 문서 자산 입력
5. 공고 상세에서 수동 분석 실행
6. 지원 준비 생성 및 문서 연결

## 이번까지 검증된 상태

정적 검증:

- `npm run check`
- `./node_modules/.bin/tsc --noEmit -p packages/db/tsconfig.json`
- `./node_modules/.bin/tsc --noEmit -p apps/web/tsconfig.json`

런타임 검증:

- memory 모드 API 검증 완료
- postgres 모드 API 검증 완료
- `/career-assets`, `/application-assistant`, `/job-postings/[jobPostingId]`, `/` 반영 확인 완료
- `career profile / experience / project` CRUD 반영 확인 완료
- 문서 삭제 시 preparation의 `targetResumeId` 해제 확인 완료

최신 주요 커밋:

- `23f48b9 feature: 자산 입력과 수동 분석을 추가하라`
- `3abe707 feat: add job posting and preparation management`
- `860cb90 Load root env for postgres workflows`

## 현재 중요한 제약

- 실제 파일 업로드 없음
- PDF/DOC 파싱 없음
- 외부 채용 소스 adapter 없음
- 큐/워커 실행기 없음
- 분석은 deterministic stub이며 LLM 호출 없음

## 다음 세션 권장 우선순위

1. 첫 `job source adapter`와 `manual import` 진입점 추가
2. 문서 업로드 + 텍스트 추출 파이프라인 연결
3. stub 분석을 실제 워커/LLM 기반 분석으로 교체
4. 지원 준비 문서 초안 생성과 리뷰 단계 확장

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
- `docs/architecture/system-overview.md`
