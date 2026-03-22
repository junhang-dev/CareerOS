import { onboardingChecklist } from "../features/onboarding/model";
import { searchProfileCapabilities } from "../features/search-profiles/model";
import { jobPostingCapabilities } from "../features/job-postings/model";
import { careerAssetCapabilities } from "../features/career-assets/model";
import { gapAnalysisCapabilities } from "../features/gap-analysis/model";
import { applicationAssistantCapabilities } from "../features/application-assistant/model";

export const moduleOverview = [
  {
    title: "온보딩과 사용자 설정",
    summary: "싱글유저 기준 초기 설정과 첫 데이터 입력 흐름",
    items: onboardingChecklist
  },
  {
    title: "맞춤 공고 탐색",
    summary: "검색 프로필 중심으로 소스 수집 전략을 관리",
    items: searchProfileCapabilities
  },
  {
    title: "공고 정규화와 변경 추적",
    summary: "상세 페이지를 구조화하고 버전 이력을 저장",
    items: jobPostingCapabilities
  },
  {
    title: "커리어 자산 관리",
    summary: "문서와 경험을 정규화해 분석 가능한 상태로 유지",
    items: careerAssetCapabilities
  },
  {
    title: "적합도 및 갭 분석",
    summary: "공고 분석 결과를 사용자 자산과 연결",
    items: gapAnalysisCapabilities
  },
  {
    title: "지원 준비 비서",
    summary: "제출 이전 준비와 승인 플로우를 담당",
    items: applicationAssistantCapabilities
  }
] as const;

export const nextMilestones = [
  "실제 Next.js 의존성 설치와 App Router 기동",
  "PostgreSQL 마이그레이션 적용과 seed 데이터 작성",
  "첫 채용 소스 어댑터 구현",
  "문서 업로드와 텍스트 추출 파이프라인 연결"
] as const;

export const recommendedPaths = [
  "packages/db/schema/careeros-schema.sql",
  "packages/domain/src/jobs/types.ts",
  "packages/domain/src/career/types.ts",
  "packages/workers/src/contracts.ts",
  "docs/architecture/system-overview.md"
] as const;

