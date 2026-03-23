import { getCareerOSRepository } from "../repositories";

export async function listJobPostings() {
  return await getCareerOSRepository().listJobPostings();
}

type CreateJobPostingInput = {
  companyName: string;
  title: string;
  url: string;
  locationText?: string;
  employmentType?: string;
  status?: "active" | "closed" | "unknown";
  postedAt?: string;
  sourceJobId?: string;
  initialVersion: {
    summary?: string;
    rawText?: string;
    qualifications?: string[];
    preferredQualifications?: string[];
    techStack?: string[];
  };
};

type UpdateJobPostingInput = {
  id: string;
  companyName: string;
  title: string;
  url: string;
  locationText?: string;
  employmentType?: string;
  status: "active" | "closed" | "unknown";
  postedAt?: string;
  sourceJobId?: string;
  latestVersion: {
    summary?: string;
    rawText?: string;
    qualifications?: string[];
    preferredQualifications?: string[];
    techStack?: string[];
  };
};

export async function createJobPosting(input: CreateJobPostingInput) {
  return await getCareerOSRepository().createJobPosting(input);
}

export async function updateJobPosting(input: UpdateJobPostingInput) {
  return await getCareerOSRepository().updateJobPosting(input);
}

export async function getJobPostingDetail(jobPostingId: string) {
  return await getCareerOSRepository().getJobPostingDetail(jobPostingId);
}

export async function runJobPostingAnalysis(jobPostingId: string) {
  return await getCareerOSRepository().runJobPostingAnalysis({
    jobPostingId,
    mode: "parse_and_analyze"
  });
}
