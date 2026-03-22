import { getCareerOSRepository } from "../repositories";

export async function getDashboardSnapshot() {
  const repository = getCareerOSRepository();
  const snapshot = await repository.getSnapshot();

  const recentJobPostings = snapshot.jobPostings
    .map((jobPosting) => {
      const analysis = snapshot.jobAnalyses.find((item) => item.jobPostingId === jobPosting.id);
      const gap = snapshot.gapAnalyses.find((item) => item.jobPostingId === jobPosting.id);
      const preparation = snapshot.applicationPreparations.find(
        (item) => item.jobPostingId === jobPosting.id
      );

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
    user: snapshot.user,
    preferences: snapshot.preferences,
    searchProfiles: snapshot.searchProfiles,
    careerProfile: snapshot.careerProfile,
    recentJobPostings,
    metrics: {
      searchProfileCount: snapshot.searchProfiles.length,
      activeJobPostingCount: snapshot.jobPostings.filter((item) => item.status === "active").length,
      careerDocumentCount: snapshot.careerDocuments.length,
      applicationPreparationCount: snapshot.applicationPreparations.length
    }
  };
}
