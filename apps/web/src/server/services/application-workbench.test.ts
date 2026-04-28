import assert from "node:assert/strict";
import test from "node:test";
import type {
  CareerDocument,
  CareerExperience,
  CareerProfile,
  CareerProject,
  JobPosting,
  JobPostingVersion
} from "@careeros/domain";
import { buildApplicationWorkbenchResult } from "./application-workbench";

const now = "2026-04-28T00:00:00.000Z";

const profile: CareerProfile = {
  id: "profile-1",
  userId: "user-1",
  headline: "운영 데이터를 제품 의사결정으로 연결하는 전환형 데이터 분석가",
  bio: "SQL과 문서화를 활용해 반복 업무와 의사결정 흐름을 개선했다.",
  yearsExperience: 3,
  targetRoles: ["Data Analyst", "데이터 분석가"],
  createdAt: now,
  updatedAt: now
};

const experiences: CareerExperience[] = [
  {
    id: "experience-1",
    careerProfileId: "profile-1",
    company: "Demo Commerce",
    role: "Operations Analyst",
    startDate: "2024-01-01",
    achievements: ["SQL 쿼리로 운영 리포트 자동화", "핵심 지표 문서화"],
    description: "운영 데이터를 정리하고 이해관계자에게 의사결정 자료를 제공했다.",
    createdAt: now,
    updatedAt: now
  }
];

const projects: CareerProject[] = [
  {
    id: "project-1",
    careerProfileId: "profile-1",
    name: "Retention Dashboard",
    role: "Builder",
    description: "고객 유지율 대시보드와 가설 검증 리포트를 만들었다.",
    outcomes: ["대시보드 구축", "가설 기반 분석 정리"],
    technologies: ["SQL", "Python"],
    createdAt: now,
    updatedAt: now
  }
];

const resumeDocument: CareerDocument = {
  id: "document-1",
  userId: "user-1",
  docType: "resume",
  title: "Data Analyst Resume",
  sourceType: "manual",
  parsedText: "SQL Python dashboard stakeholder communication impact",
  structured: {},
  version: 1,
  createdAt: now,
  updatedAt: now
};

const jobPosting: JobPosting = {
  id: "job-1",
  canonicalKey: "demo-data-analyst",
  sourceId: "source-manual",
  url: "https://jobs.example.com/demo-data-analyst",
  companyName: "Demo Analytics",
  title: "Junior Data Analyst",
  locationText: "Seoul / Remote",
  employmentType: "full-time",
  status: "active",
  detectedAt: now,
  lastSeenAt: now,
  createdAt: now,
  updatedAt: now
};

const latestVersion: JobPostingVersion = {
  id: "version-1",
  jobPostingId: "job-1",
  contentHash: "hash",
  rawText: "SQL, Python, dashboard, experiment, KPI",
  jdStructured: {
    summary: "데이터 정제와 지표 정의를 담당할 데이터 분석가",
    qualifications: ["SQL", "Python", "지표 정의"],
    preferredQualifications: ["대시보드", "실험"],
    techStack: ["SQL", "Python"]
  },
  requirements: {},
  preferred: {},
  compensation: {},
  metadata: {},
  capturedAt: now,
  createdAt: now,
  updatedAt: now
};

test("builds domestic and global application guidance from matched analytics keywords", () => {
  const result = buildApplicationWorkbenchResult({
    profile,
    experiences,
    projects,
    documents: [resumeDocument],
    skills: [],
    jobPosting,
    latestVersion
  });

  assert.equal(result.targetTrack, "data_analyst_transition");
  assert.ok(result.matchedKeywords.includes("SQL"));
  assert.ok(result.matchedKeywords.includes("Python"));
  assert.ok(result.matchedKeywords.includes("대시보드"));
  assert.ok(result.domesticStrategy.length > 0);
  assert.ok(result.globalStrategy.length > 0);
  assert.ok(result.koreanBullets.some((item) => item.includes("SQL")));
  assert.ok(result.englishBullets.some((item) => item.includes("SQL")));
});

test("returns minimum preview and gap actions when only pasted JD is present", () => {
  const result = buildApplicationWorkbenchResult({
    profile: {
      ...profile,
      headline: undefined,
      bio: undefined,
      targetRoles: []
    },
    experiences: [],
    projects: [],
    documents: [],
    skills: [],
    rawText: "We need a data analyst who can clean data, build dashboards, and communicate insights."
  });

  assert.ok(result.positioning.includes("Data Analyst"));
  assert.ok(result.matchedKeywords.includes("대시보드"));
  assert.ok(result.risks.some((item) => item.includes("resume/경력기술서")));
  assert.ok(result.nextActions.length > 0);
  assert.equal(result.koreanBullets.length, 4);
  assert.equal(result.englishBullets.length, 4);
});
