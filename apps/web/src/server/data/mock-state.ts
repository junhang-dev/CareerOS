import type {
  ApplicationDocument,
  ApplicationPreparation,
  CareerDocument,
  CareerExperience,
  CareerProfile,
  CareerProject,
  ExternalAccount,
  GapAnalysis,
  JobAnalysis,
  JobPosting,
  JobPostingVersion,
  SearchProfile,
  Skill,
  User,
  UserPreferences,
  UserSkill
} from "@careeros/domain";

type MockDatabase = {
  user: User;
  preferences: UserPreferences;
  searchProfiles: SearchProfile[];
  jobPostings: JobPosting[];
  jobPostingVersions: JobPostingVersion[];
  jobAnalyses: JobAnalysis[];
  careerProfile: CareerProfile;
  careerExperiences: CareerExperience[];
  careerProjects: CareerProject[];
  skills: Skill[];
  userSkills: UserSkill[];
  careerDocuments: CareerDocument[];
  externalAccounts: ExternalAccount[];
  gapAnalyses: GapAnalysis[];
  applicationPreparations: ApplicationPreparation[];
  applicationDocuments: ApplicationDocument[];
};

const now = "2026-03-22T10:00:00.000Z";
const userId = "user-0001";
const profileId = "career-profile-0001";

function createMockDatabase(): MockDatabase {
  return {
    user: {
      id: userId,
      email: "jun@example.com",
      name: "Jun",
      timezone: "Asia/Seoul",
      locale: "ko-KR",
      createdAt: now,
      updatedAt: now
    },
    preferences: {
      userId,
      jobRegions: ["Seoul", "Remote", "Singapore"],
      jobTypes: ["full-time"],
      industries: ["AI", "SaaS", "Developer Tools"],
      seniorityLevels: ["junior", "mid"],
      companyTypes: ["startup", "enterprise"],
      salaryMin: 55000000,
      remotePreference: "hybrid",
      visaSupportNeeded: false,
      keywordsInclude: ["TypeScript", "Product Engineer", "AI"],
      keywordsExclude: ["freelance", "contract"],
      createdAt: now,
      updatedAt: now
    },
    searchProfiles: [
      {
        id: "search-profile-kr-product",
        userId,
        name: "KR Product Engineer",
        isActive: true,
        scheduleRule: "0 8 * * *",
        priority: 10,
        filters: {
          countries: ["KR"],
          keywords: ["TypeScript", "Backend", "Product Engineer"],
          remote: "hybrid"
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: "search-profile-global-ai",
        userId,
        name: "Global AI SaaS",
        isActive: true,
        scheduleRule: "0 20 * * 1,3,5",
        priority: 20,
        filters: {
          countries: ["US", "SG"],
          keywords: ["AI", "Platform", "Developer Experience"],
          remote: "remote"
        },
        createdAt: now,
        updatedAt: now
      }
    ],
    jobPostings: [
      {
        id: "job-0001",
        canonicalKey: "kr-techflow-platform-engineer",
        sourceId: "source-wanted",
        sourceJobId: "wanted-1001",
        url: "https://jobs.example.com/techflow/platform-engineer",
        companyName: "TechFlow",
        title: "Platform Engineer",
        locationText: "Seoul / Hybrid",
        employmentType: "full-time",
        status: "active",
        postedAt: "2026-03-18T09:00:00.000Z",
        detectedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "job-0002",
        canonicalKey: "global-orbitai-product-engineer",
        sourceId: "source-greenhouse",
        sourceJobId: "greenhouse-4242",
        url: "https://jobs.example.com/orbitai/product-engineer",
        companyName: "OrbitAI",
        title: "Product Engineer, AI Workflows",
        locationText: "Remote",
        employmentType: "full-time",
        status: "active",
        postedAt: "2026-03-20T03:00:00.000Z",
        detectedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "job-0003",
        canonicalKey: "kr-signalstack-backend-engineer",
        sourceId: "source-jumpit",
        sourceJobId: "jumpit-3399",
        url: "https://jobs.example.com/signalstack/backend-engineer",
        companyName: "SignalStack",
        title: "Backend Engineer",
        locationText: "Seoul",
        employmentType: "full-time",
        status: "active",
        postedAt: "2026-03-14T04:30:00.000Z",
        detectedAt: now,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now
      }
    ],
    jobPostingVersions: [
      {
        id: "job-version-0001",
        jobPostingId: "job-0001",
        contentHash: "hash-techflow-v2",
        rawHtmlPath: "s3://careeros/raw/job-0001-v2.html",
        rawText: "Platform, TypeScript, PostgreSQL, internal tooling, observability",
        jdStructured: {
          summary: "사내 플랫폼과 개발 생산성 도구를 담당할 플랫폼 엔지니어",
          responsibilities: ["내부 플랫폼 기능 개발", "개발자 경험 개선", "운영 자동화"],
          qualifications: ["TypeScript 실무 경험", "SQL/데이터 모델링 경험"],
          preferredQualifications: ["B2B SaaS 경험", "관측성 도구 경험"],
          techStack: ["TypeScript", "Node.js", "PostgreSQL", "OpenTelemetry"]
        },
        requirements: {
          requiredYears: 2
        },
        preferred: {
          startupExperience: true
        },
        compensation: {
          min: 60000000,
          max: 90000000,
          currency: "KRW"
        },
        metadata: {
          parserVersion: "v0"
        },
        capturedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "job-version-0002",
        jobPostingId: "job-0002",
        contentHash: "hash-orbitai-v1",
        rawHtmlPath: "s3://careeros/raw/job-0002-v1.html",
        rawText: "AI workflows, experimentation, frontend/backend, product collaboration",
        jdStructured: {
          summary: "AI 워크플로우 경험을 개선하는 제품 엔지니어",
          responsibilities: ["실험 기능 개발", "사용자 피드백 반영", "LLM 기능 연동"],
          qualifications: ["TypeScript 경험", "제품 감각", "API 설계 경험"],
          preferredQualifications: ["LLM 제품 경험", "영어 협업"],
          techStack: ["TypeScript", "React", "Node.js", "Python"]
        },
        requirements: {
          english: "working"
        },
        preferred: {
          aiExperience: true
        },
        compensation: {
          currency: "USD"
        },
        metadata: {
          parserVersion: "v0"
        },
        capturedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "job-version-0003",
        jobPostingId: "job-0003",
        contentHash: "hash-signalstack-v1",
        rawHtmlPath: "s3://careeros/raw/job-0003-v1.html",
        rawText: "backend apis, distributed jobs, data pipelines",
        jdStructured: {
          summary: "대규모 데이터 수집과 API를 다루는 백엔드 엔지니어",
          responsibilities: ["API 개발", "배치 파이프라인 운영", "데이터 모델 관리"],
          qualifications: ["백엔드 실무 경험", "RDB 설계 경험"],
          preferredQualifications: ["잡 크롤링 경험", "큐 시스템 경험"],
          techStack: ["Node.js", "PostgreSQL", "Redis", "BullMQ"]
        },
        requirements: {},
        preferred: {},
        compensation: {
          min: 50000000,
          max: 80000000,
          currency: "KRW"
        },
        metadata: {
          parserVersion: "v0"
        },
        capturedAt: now,
        createdAt: now,
        updatedAt: now
      }
    ],
    jobAnalyses: [
      {
        id: "job-analysis-0001",
        jobPostingId: "job-0001",
        analysisVersion: "mvp-v1",
        summary: "현재 자산과 가장 가까운 공고다. TypeScript와 데이터 모델링 강점을 직접 활용할 수 있다.",
        keyRequirements: {
          top: ["TypeScript", "플랫폼 경험", "SQL"]
        },
        riskNotes: {
          items: ["관측성 도구 경험은 보강 필요"]
        },
        fitScore: 82,
        fitReason: {
          strengths: ["백엔드/플랫폼 관심사 일치", "문서 기반 협업 강점"],
          risks: ["OpenTelemetry 경험 부족"]
        },
        gapSummary: "관측성/내부 플랫폼 운영 경험을 강조하거나 보강하면 경쟁력이 올라간다.",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "job-analysis-0002",
        jobPostingId: "job-0002",
        analysisVersion: "mvp-v1",
        summary: "AI 제품 방향성과 잘 맞지만 영어 협업과 사용자 facing 실험 경험이 상대적으로 약하다.",
        keyRequirements: {
          top: ["AI 워크플로우", "제품 감각", "영어 협업"]
        },
        riskNotes: {
          items: ["영문 커뮤니케이션 근거 부족"]
        },
        fitScore: 71,
        fitReason: {
          strengths: ["AI 관심사와 방향성 일치"],
          risks: ["영어 협업", "프론트엔드 포트폴리오 근거 부족"]
        },
        gapSummary: "실험 설계와 영어 협업 사례를 보강해야 한다.",
        createdAt: now,
        updatedAt: now
      }
    ],
    careerProfile: {
      id: profileId,
      userId,
      headline: "Product-minded Backend Engineer",
      bio: "TypeScript와 데이터 모델링 중심으로 제품과 운영을 함께 보는 백엔드 엔지니어를 지향한다.",
      yearsExperience: 3,
      targetRoles: ["Backend Engineer", "Platform Engineer", "Product Engineer"],
      createdAt: now,
      updatedAt: now
    },
    careerExperiences: [
      {
        id: "career-exp-0001",
        careerProfileId: profileId,
        company: "Demo Commerce",
        role: "Backend Engineer",
        startDate: "2023-01-01",
        endDate: "2025-12-31",
        description: "주문/정산 시스템 API와 운영 도구를 개발했다.",
        achievements: ["정산 배치 시간을 40% 단축", "문서화 템플릿을 정착"],
        createdAt: now,
        updatedAt: now
      }
    ],
    careerProjects: [
      {
        id: "career-project-0001",
        careerProfileId: profileId,
        name: "CareerOS Concept",
        role: "Builder",
        description: "개인 커리어 에이전트 MVP 설계와 프로토타입 작성",
        outcomes: ["도메인 모델 설계", "MVP 화면 스캐폴드 작성"],
        technologies: ["TypeScript", "Next.js", "PostgreSQL"],
        createdAt: now,
        updatedAt: now
      }
    ],
    skills: [
      {
        id: "skill-typescript",
        name: "TypeScript",
        category: "language",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "skill-postgresql",
        name: "PostgreSQL",
        category: "database",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "skill-react",
        name: "React",
        category: "frontend",
        createdAt: now,
        updatedAt: now
      }
    ],
    userSkills: [
      {
        userId,
        skillId: "skill-typescript",
        proficiency: 4,
        evidenceCount: 3,
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        userId,
        skillId: "skill-postgresql",
        proficiency: 3,
        evidenceCount: 2,
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now
      },
      {
        userId,
        skillId: "skill-react",
        proficiency: 2,
        evidenceCount: 1,
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now
      }
    ],
    careerDocuments: [
      {
        id: "career-doc-0001",
        userId,
        docType: "resume",
        title: "Resume 2026 Q1",
        storagePath: "s3://careeros/docs/resume-q1.pdf",
        sourceType: "upload",
        parsedText: "Backend engineer resume",
        structured: {
          sections: ["summary", "experience", "projects"]
        },
        version: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "career-doc-0002",
        userId,
        docType: "portfolio",
        title: "Portfolio Notion Import",
        storagePath: "notion://page/portfolio",
        sourceType: "notion",
        parsedText: "Selected projects and writeups",
        structured: {
          sections: ["projects", "essays"]
        },
        version: 3,
        createdAt: now,
        updatedAt: now
      }
    ],
    externalAccounts: [
      {
        id: "external-account-0001",
        userId,
        provider: "github",
        accountRef: "jun-dev",
        status: "connected",
        metadata: {
          importedAt: now
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: "external-account-0002",
        userId,
        provider: "notion",
        accountRef: "workspace-careeros",
        status: "pending",
        metadata: {},
        createdAt: now,
        updatedAt: now
      }
    ],
    gapAnalyses: [
      {
        id: "gap-analysis-0001",
        jobPostingId: "job-0001",
        userId,
        matchedSkills: ["TypeScript", "PostgreSQL"],
        missingSkills: ["OpenTelemetry", "Developer Experience tooling"],
        experienceGaps: ["내부 플랫폼 운영 사례를 더 구체적으로 제시할 필요"],
        recommendations: ["운영 개선 사례를 숫자로 정리", "관측성 실습 프로젝트 추가"],
        confidence: 0.81,
        metadata: {
          analysisVersion: "mvp-v1"
        },
        createdAt: now,
        updatedAt: now
      },
      {
        id: "gap-analysis-0002",
        jobPostingId: "job-0002",
        userId,
        matchedSkills: ["TypeScript"],
        missingSkills: ["Experiment design", "English collaboration", "React product shipping"],
        experienceGaps: ["사용자 피드백 루프 사례가 부족"],
        recommendations: ["영문 프로젝트 요약 작성", "프론트엔드 토이 프로젝트 공개"],
        confidence: 0.67,
        metadata: {
          analysisVersion: "mvp-v1"
        },
        createdAt: now,
        updatedAt: now
      }
    ],
    applicationPreparations: [
      {
        id: "app-prep-0001",
        userId,
        jobPostingId: "job-0001",
        status: "ready_for_review",
        strategyNote: "플랫폼 자동화와 문서화 경험을 전면에 배치한다.",
        targetResumeId: "career-doc-0001",
        targetCoverLetterId: undefined,
        approvalRequired: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    applicationDocuments: [
      {
        id: "app-doc-0001",
        applicationPreparationId: "app-prep-0001",
        docType: "resume",
        content: "TechFlow 맞춤 이력서 초안",
        version: 1,
        status: "reviewed",
        createdAt: now,
        updatedAt: now
      },
      {
        id: "app-doc-0002",
        applicationPreparationId: "app-prep-0001",
        docType: "cover_letter",
        content: "플랫폼 운영과 문서화 경험을 강조한 자기소개서 초안",
        version: 1,
        status: "draft",
        createdAt: now,
        updatedAt: now
      }
    ]
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __careerosMockDatabase: MockDatabase | undefined;
}

export function getMockDatabase(): MockDatabase {
  if (!globalThis.__careerosMockDatabase) {
    globalThis.__careerosMockDatabase = createMockDatabase();
  }

  return globalThis.__careerosMockDatabase;
}

export function cloneMockDatabase(): MockDatabase {
  return structuredClone(getMockDatabase());
}

export function resetMockDatabase() {
  globalThis.__careerosMockDatabase = createMockDatabase();
  return globalThis.__careerosMockDatabase;
}
