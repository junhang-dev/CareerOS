# `job_posting_versions.jd_structured_json` 초안

```json
{
  "summary": "백엔드 엔지니어 채용",
  "responsibilities": ["API 설계", "데이터 모델링"],
  "qualifications": ["TypeScript 3년 이상"],
  "preferredQualifications": ["스타트업 경험"],
  "techStack": ["TypeScript", "PostgreSQL", "AWS"],
  "workflow": ["코드 리뷰", "협업 문화"],
  "benefits": ["원격 근무", "교육비 지원"],
  "languages": ["Korean", "English"],
  "rawSections": [
    {
      "heading": "자격요건",
      "body": "..."
    }
  ]
}
```

설계 메모:

- 파서 실패 시 `rawSections`만 저장하는 fallback이 필요하다.
- 원문 언어와 번역 언어를 분리 저장할지 추후 결정한다.

