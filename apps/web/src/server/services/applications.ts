import { getMockDatabase, cloneMockDatabase } from "../data/mock-state";

type CreateApplicationPreparationInput = {
  jobPostingId: string;
  strategyNote?: string;
};

export function listApplicationPreparations() {
  const db = cloneMockDatabase();

  return db.applicationPreparations.map((preparation) => ({
    ...preparation,
    jobPosting: db.jobPostings.find((item) => item.id === preparation.jobPostingId) ?? null,
    documents: db.applicationDocuments.filter(
      (document) => document.applicationPreparationId === preparation.id
    )
  }));
}

export function createApplicationPreparation(input: CreateApplicationPreparationInput) {
  const db = getMockDatabase();

  const existing = db.applicationPreparations.find(
    (item) => item.jobPostingId === input.jobPostingId && item.userId === db.user.id
  );

  if (existing) {
    return existing;
  }

  const preparation = {
    id: crypto.randomUUID(),
    userId: db.user.id,
    jobPostingId: input.jobPostingId,
    status: "drafting" as const,
    strategyNote: input.strategyNote,
    targetResumeId: db.careerDocuments.find((item) => item.docType === "resume")?.id,
    targetCoverLetterId: undefined,
    approvalRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.applicationPreparations.push(preparation);
  return preparation;
}

