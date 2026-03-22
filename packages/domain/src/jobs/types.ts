import type { AuditStamp, JsonObject, TimestampString, UUID } from "../shared/types";

export type JobSourceType = "site" | "rss" | "api" | "manual";
export type JobPostingStatus = "active" | "closed" | "unknown";
export type JobAssetType = "pdf" | "doc" | "link" | "image";

export type JobSource = AuditStamp & {
  id: UUID;
  name: string;
  sourceType: JobSourceType;
  baseUrl: string;
  country: string;
};

export type JobSourceConfig = AuditStamp & {
  id: UUID;
  jobSourceId: UUID;
  parserVersion: string;
  accessPolicy: JsonObject;
  rateLimitPolicy: JsonObject;
  isActive: boolean;
};

export type JobPosting = AuditStamp & {
  id: UUID;
  canonicalKey: string;
  sourceId: UUID;
  companyId?: UUID;
  sourceJobId?: string;
  url: string;
  companyName: string;
  title: string;
  locationText?: string;
  employmentType?: string;
  status: JobPostingStatus;
  postedAt?: TimestampString;
  detectedAt: TimestampString;
  lastSeenAt: TimestampString;
};

export type JobPostingStructuredContent = {
  summary?: string;
  responsibilities?: string[];
  qualifications?: string[];
  preferredQualifications?: string[];
  techStack?: string[];
  workflow?: string[];
  benefits?: string[];
  languages?: string[];
  rawSections?: Array<{
    heading: string;
    body: string;
  }>;
};

export type JobPostingVersion = AuditStamp & {
  id: UUID;
  jobPostingId: UUID;
  contentHash: string;
  rawHtmlPath?: string;
  rawText?: string;
  jdStructured: JobPostingStructuredContent;
  requirements: JsonObject;
  preferred: JsonObject;
  compensation: JsonObject;
  metadata: JsonObject;
  capturedAt: TimestampString;
};

export type JobPostingAsset = AuditStamp & {
  id: UUID;
  jobPostingId: UUID;
  assetType: JobAssetType;
  url: string;
  filePath?: string;
  parsedText?: string;
  metadata: JsonObject;
};

export type JobDedupGroup = AuditStamp & {
  id: UUID;
  dedupKey: string;
  confidence: number;
  primaryJobPostingId?: UUID;
};

export type Company = AuditStamp & {
  id: UUID;
  name: string;
  domain?: string;
  country?: string;
  industry?: string;
  sizeRange?: string;
  metadata: JsonObject;
};

export type JobAnalysis = AuditStamp & {
  id: UUID;
  jobPostingId: UUID;
  analysisVersion: string;
  summary: string;
  keyRequirements: JsonObject;
  riskNotes: JsonObject;
  fitScore?: number;
  fitReason: JsonObject;
  gapSummary?: string;
};

export type JobCompanyInsight = AuditStamp & {
  id: UUID;
  jobPostingId: UUID;
  companyId?: UUID;
  cultureNotes?: string;
  industryContext?: string;
  metadata: JsonObject;
};

/**
 * TODO:
 * - 다국어 원문/번역본 분리 전략을 명확히 정의한다.
 * - source adapter별로 생성 가능한 structured fields 계약을 고정한다.
 */

