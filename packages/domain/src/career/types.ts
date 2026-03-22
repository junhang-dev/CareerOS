import type { AuditStamp, JsonObject, UUID } from "../shared/types";

export type CareerProfile = AuditStamp & {
  id: UUID;
  userId: UUID;
  headline?: string;
  bio?: string;
  yearsExperience?: number;
  targetRoles: string[];
};

export type CareerExperience = AuditStamp & {
  id: UUID;
  careerProfileId: UUID;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements: string[];
};

export type CareerProject = AuditStamp & {
  id: UUID;
  careerProfileId: UUID;
  name: string;
  role?: string;
  description?: string;
  outcomes: string[];
  technologies: string[];
};

export type Skill = AuditStamp & {
  id: UUID;
  name: string;
  category?: string;
};

export type UserSkill = AuditStamp & {
  userId: UUID;
  skillId: UUID;
  proficiency?: number;
  evidenceCount: number;
  lastVerifiedAt?: string;
};

export type CareerDocumentType = "resume" | "cover_letter" | "portfolio" | "note";
export type CareerDocumentSource = "upload" | "notion" | "linkedin" | "github" | "manual";

export type CareerDocument = AuditStamp & {
  id: UUID;
  userId: UUID;
  docType: CareerDocumentType;
  title: string;
  storagePath?: string;
  sourceType: CareerDocumentSource;
  parsedText?: string;
  structured: JsonObject;
  version: number;
};

export type CareerAssetBulkImport = {
  id: UUID;
  userId: UUID;
  sourceType: CareerDocumentSource;
  status: "queued" | "processing" | "completed" | "failed";
  metadata: JsonObject;
};

