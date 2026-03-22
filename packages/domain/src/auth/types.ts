import type { AuditStamp, JsonObject, UUID } from "../shared/types";

export type User = AuditStamp & {
  id: UUID;
  email: string;
  name: string;
  timezone: string;
  locale: string;
};

export type UserPreferences = AuditStamp & {
  userId: UUID;
  jobRegions: string[];
  jobTypes: string[];
  industries: string[];
  seniorityLevels: string[];
  companyTypes: string[];
  salaryMin?: number;
  remotePreference?: "onsite" | "hybrid" | "remote" | "flexible";
  visaSupportNeeded: boolean;
  keywordsInclude: string[];
  keywordsExclude: string[];
};

export type SearchProfile = AuditStamp & {
  id: UUID;
  userId: UUID;
  name: string;
  isActive: boolean;
  scheduleRule: string;
  priority: number;
  filters: JsonObject;
};

export type ExternalAccount = AuditStamp & {
  id: UUID;
  userId: UUID;
  provider: "github" | "linkedin" | "notion";
  accountRef: string;
  status: "connected" | "disconnected" | "error" | "pending";
  metadata: JsonObject;
};

export type ExternalAccountCredentialRef = AuditStamp & {
  id: UUID;
  externalAccountId: UUID;
  secretReference: string;
  lastValidatedAt?: string;
  status: "active" | "revoked" | "expired";
};

