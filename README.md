# CareerOS

CareerOS는 개인의 채용 탐색, 커리어 자산 관리, 지원 준비를 하나의 흐름으로 연결하는 웹 우선 개인 커리어 에이전트 플랫폼의 싱글유저 MVP 스캐폴드다.

## 현재 포함된 내용

- 모듈러 모놀리식 기준의 프로젝트 폴더 구조
- PostgreSQL 기준 DB 스키마 초안
- 도메인 타입 초안
- 웹 앱 홈/모듈 개요 화면 스켈레톤
- 워커, 외부 연동, 보안 경계 계약 파일
- 설계 문서와 ADR

## 아직 하지 않은 것

- 실제 Next.js 의존성 설치
- DB 마이그레이션 실행
- 외부 채용 소스 연동 구현
- 문서 파싱, LLM 분석, 자동 지원 제출

## 빠른 확인

```bash
npm run check
```

위 검사는 핵심 파일과 디렉터리 구조가 존재하는지 확인한다.

## 로컬 실행 준비

```bash
npm install
npm run dev:web
```

실행 후 확인할 주요 화면:

- `/`
- `/search-profiles`
- `/job-postings`
- `/career-assets`
- `/application-assistant`

현재는 DB 대신 인메모리 목업 저장소를 사용한다. 화면과 API 계약을 먼저 확인한 뒤 PostgreSQL로 교체하는 순서다.

## 데이터 드라이버

- 기본값: `memory`
- 후속 구현용 예약값: `postgres`

```bash
CAREEROS_DATA_DRIVER=memory npm run dev:web
```

`postgres` 드라이버는 기본 싱글유저 컨텍스트 생성, 대시보드/조회용 read path, `search profile`의 첫 CRUD까지 연결된 상태다.

## PostgreSQL 실행

PostgreSQL은 로컬에 직접 설치할 필요는 없다. 아래 둘 중 하나면 충분하다.

- Docker로 띄운 로컬 PostgreSQL
- 이미 준비된 원격 PostgreSQL

Docker를 쓸 경우:

```bash
cp .env.example .env
npm run db:up
CAREEROS_DATA_DRIVER=postgres npm run db:push
CAREEROS_DATA_DRIVER=postgres npm run dev:web
```

기본 연결 정보는 `.env.example`에 들어 있다.

## 설계 원칙

- 배포 단위는 단순하게, 코드 경계는 명확하게 유지한다.
- 자동 제출보다 사용자 승인 기반 보조를 우선한다.
- 비밀정보는 일반 도메인 데이터와 분리한다.
- 외부 연동은 어댑터 인터페이스 뒤로 숨긴다.
