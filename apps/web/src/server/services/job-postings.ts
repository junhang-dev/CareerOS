import { cloneMockDatabase } from "../data/mock-state";

export function listJobPostings() {
  const db = cloneMockDatabase();

  return db.jobPostings.map((jobPosting) => {
    const latestVersion = db.jobPostingVersions.find((item) => item.jobPostingId === jobPosting.id);
    const analysis = db.jobAnalyses.find((item) => item.jobPostingId === jobPosting.id);
    const gapAnalysis = db.gapAnalyses.find((item) => item.jobPostingId === jobPosting.id);

    return {
      ...jobPosting,
      latestVersion,
      analysis,
      gapAnalysis
    };
  });
}

export function getJobPostingDetail(jobPostingId: string) {
  const db = cloneMockDatabase();
  const jobPosting = db.jobPostings.find((item) => item.id === jobPostingId);

  if (!jobPosting) {
    return null;
  }

  return {
    jobPosting,
    versions: db.jobPostingVersions.filter((item) => item.jobPostingId === jobPostingId),
    analysis: db.jobAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
    gapAnalysis: db.gapAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
    preparation:
      db.applicationPreparations.find((item) => item.jobPostingId === jobPostingId) ?? null
  };
}

