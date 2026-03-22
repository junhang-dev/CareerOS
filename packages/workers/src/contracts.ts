export type QueueName = "ingestion" | "parsing" | "analysis" | "drafting";

export type IngestionTaskPayload = {
  searchProfileId: string;
  initiatedBy: "schedule" | "manual";
};

export type ParsingTaskPayload = {
  jobPostingId: string;
  versionId?: string;
  sourceName: string;
};

export type AnalysisTaskPayload = {
  jobPostingId: string;
  userId: string;
  analysisType: "summary" | "fit_analysis" | "gap_analysis";
};

export type DraftingTaskPayload = {
  applicationPreparationId: string;
  documentType: "resume" | "cover_letter" | "email";
};

