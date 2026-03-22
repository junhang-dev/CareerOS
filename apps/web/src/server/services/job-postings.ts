import { getCareerOSRepository } from "../repositories";

export async function listJobPostings() {
  return await getCareerOSRepository().listJobPostings();
}

export async function getJobPostingDetail(jobPostingId: string) {
  return await getCareerOSRepository().getJobPostingDetail(jobPostingId);
}
