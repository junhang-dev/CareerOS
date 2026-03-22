import type { AuditStamp, JsonObject, UUID } from "../shared/types";

export type IngestionRun = AuditStamp & {
  id: UUID;
  searchProfileId?: UUID;
  status: "queued" | "running" | "completed" | "failed";
  summary?: string;
  metadata: JsonObject;
};

export type AnalysisRun = AuditStamp & {
  id: UUID;
  jobPostingId?: UUID;
  status: "queued" | "running" | "completed" | "failed";
  runType: "summary" | "fit_analysis" | "gap_analysis" | "draft_generation";
  metadata: JsonObject;
};

export type AgentTask = AuditStamp & {
  id: UUID;
  taskType: "fetch_postings" | "parse_posting" | "analyze_posting" | "draft_application";
  queueName: string;
  payload: JsonObject;
  status: "queued" | "processing" | "completed" | "failed";
  attempts: number;
  lastError?: string;
};

export type AuditLog = AuditStamp & {
  id: UUID;
  actorType: "user" | "agent" | "system";
  actorId?: UUID;
  eventType: string;
  resourceType: string;
  resourceId?: UUID;
  metadata: JsonObject;
};

