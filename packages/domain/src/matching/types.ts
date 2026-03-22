import type { AuditStamp, JsonObject, UUID } from "../shared/types";

export type GapAnalysis = AuditStamp & {
  id: UUID;
  jobPostingId: UUID;
  userId: UUID;
  matchedSkills: string[];
  missingSkills: string[];
  experienceGaps: string[];
  recommendations: string[];
  confidence?: number;
  metadata: JsonObject;
};

export type FitScoreBreakdown = {
  total: number;
  skills: number;
  domain: number;
  seniority: number;
  communication: number;
  location: number;
};

export type RecommendationBundle = {
  summary: string;
  actions: string[];
  notes?: string[];
};

