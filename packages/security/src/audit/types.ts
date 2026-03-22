export type AuditEvent = {
  actorType: "user" | "agent" | "system";
  actorId?: string;
  eventType: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
};

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>;
}

