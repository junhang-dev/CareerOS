import type { AuditStamp, JsonObject, UUID } from "../shared/types";

export type ApplicationPreparationStatus =
  | "drafting"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "archived";

export type ApplicationPreparation = AuditStamp & {
  id: UUID;
  userId: UUID;
  jobPostingId: UUID;
  status: ApplicationPreparationStatus;
  strategyNote?: string;
  targetResumeId?: UUID;
  targetCoverLetterId?: UUID;
  approvalRequired: boolean;
};

export type ApplicationDocument = AuditStamp & {
  id: UUID;
  applicationPreparationId: UUID;
  docType: "resume" | "cover_letter" | "email" | "note";
  content: string;
  version: number;
  status: "draft" | "reviewed" | "approved" | "superseded";
};

export type ApplicationAction = AuditStamp & {
  id: UUID;
  applicationPreparationId: UUID;
  actionType: "create" | "review" | "approve" | "reject" | "submit_attempt";
  actorType: "user" | "agent" | "system";
  metadata: JsonObject;
};

