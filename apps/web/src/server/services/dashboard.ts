import { cloneMockDatabase } from "../data/mock-state";

export function getDashboardSnapshot() {
  const db = cloneMockDatabase();
  const recentJobPostings = db.jobPostings
    .map((jobPosting) => {
      const analysis = db.jobAnalyses.find((item) => item.jobPostingId === jobPosting.id);
      const gap = db.gapAnalyses.find((item) => item.jobPostingId === jobPosting.id);
      const preparation = db.applicationPreparations.find((item) => item.jobPostingId === jobPosting.id);

      return {
        ...jobPosting,
        fitScore: analysis?.fitScore ?? null,
        gapCount: gap?.missingSkills.length ?? 0,
        preparationStatus: preparation?.status ?? null,
        analysisSummary: analysis?.summary ?? null
      };
    })
    .sort((left, right) => right.detectedAt.localeCompare(left.detectedAt));

  return {
    user: db.user,
    preferences: db.preferences,
    searchProfiles: db.searchProfiles,
    careerProfile: db.careerProfile,
    recentJobPostings,
    metrics: {
      searchProfileCount: db.searchProfiles.length,
      activeJobPostingCount: db.jobPostings.filter((item) => item.status === "active").length,
      careerDocumentCount: db.careerDocuments.length,
      applicationPreparationCount: db.applicationPreparations.length
    }
  };
}

