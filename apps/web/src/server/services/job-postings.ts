import { getCareerOSRepository } from "../repositories";

export function listJobPostings() {
  return getCareerOSRepository().listJobPostings();
}

export function getJobPostingDetail(jobPostingId: string) {
  return getCareerOSRepository().getJobPostingDetail(jobPostingId);
}
