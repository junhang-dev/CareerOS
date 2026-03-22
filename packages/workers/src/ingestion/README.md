# Ingestion Worker

역할:

- 검색 프로필 스케줄을 읽는다.
- 채용 소스 목록 수집을 실행한다.
- 공고 후보를 dedup 후보와 함께 저장 큐로 넘긴다.

TODO:

- Redis/BullMQ 또는 DB queue 선택
- source health와 재시도 정책 명세화

