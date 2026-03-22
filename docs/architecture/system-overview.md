# CareerOS 시스템 아키텍처 초안

## 구조 요약

CareerOS는 초기에는 모듈러 모놀리식으로 시작한다.

- `apps/web`: 웹 UI와 BFF 성격의 엔드포인트
- `packages/domain`: 도메인 타입과 상태 모델
- `packages/db`: PostgreSQL DDL과 마이그레이션 초안
- `packages/integrations`: 외부 채용 소스/계정 연동 어댑터
- `packages/workers`: 비동기 작업 계약과 워커 문서
- `packages/security`: 비밀정보, 암호화, 감사 로깅 경계

## 핵심 흐름

1. 사용자가 검색 프로필과 커리어 자산을 등록한다.
2. 스케줄 또는 수동 실행이 `ingestion` 작업을 만든다.
3. 수집 결과가 공고 상세 파싱으로 넘어간다.
4. 정규화된 공고와 버전 이력이 저장된다.
5. 분석 워커가 요약, 적합도, 갭 분석을 생성한다.
6. 사용자가 지원 준비 단위를 만들고 초안을 검토한다.

## 모듈 경계 메모

- `Identity & Security`
  - 토큰과 세션은 도메인 서비스가 직접 읽지 않는다.
- `Job Discovery`
  - 어떤 소스에서 공고를 찾았는지와 수집 정책을 관리한다.
- `Job Parsing & Normalization`
  - 원문과 구조화 결과를 모두 보존한다.
- `Career Asset Management`
  - 문서 원본과 구조화 산출물을 함께 다룬다.
- `Matching & Analysis`
  - 분석 결과는 항상 보조 정보로 취급한다.
- `Application Assistant`
  - 제출이 아니라 준비 단위를 관리한다.

## TODO

- DB queue와 Redis/BullMQ 중 어떤 큐를 사용할지 결정
- 외부 파일 파싱 파이프라인의 실패 fallback 정의
- 실제 인증 방식과 세션 저장 위치 결정

