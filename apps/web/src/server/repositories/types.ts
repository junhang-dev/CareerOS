import type {
  ApplicationDocument,
  ApplicationPreparation,
  ApplicationPreparationStatus,
  CareerDocument,
  CareerExperience,
  CareerProfile,
  CareerProject,
  ExternalAccount,
  GapAnalysis,
  JobAnalysis,
  JobPosting,
  JobPostingStatus,
  JobPostingVersion,
  SearchProfile,
  Skill,
  User,
  UserPreferences,
  UserSkill
} from "@careeros/domain";

export type SearchProfileRecord = SearchProfile;

export type JobPostingListItem = JobPosting & {
  latestVersion?: JobPostingVersion;
  analysis?: JobAnalysis;
  gapAnalysis?: GapAnalysis;
};

export type JobPostingDetailRecord = {
  jobPosting: JobPosting;
  versions: JobPostingVersion[];
  analysis: JobAnalysis | null;
  gapAnalysis: GapAnalysis | null;
  preparation: ApplicationPreparation | null;
};

export type CareerAssetSnapshot = {
  user: User;
  profile: CareerProfile;
  experiences: CareerExperience[];
  projects: CareerProject[];
  documents: CareerDocument[];
  skills: Array<
    UserSkill & {
      skill: Skill | null;
    }
  >;
  externalAccounts: ExternalAccount[];
};

export type ApplicationPreparationRecord = ApplicationPreparation & {
  jobPosting: JobPosting | null;
  documents: ApplicationDocument[];
};

export type RepositorySnapshot = {
  user: User;
  preferences: UserPreferences;
  searchProfiles: SearchProfileRecord[];
  jobPostings: JobPosting[];
  jobPostingVersions: JobPostingVersion[];
  jobAnalyses: JobAnalysis[];
  careerProfile: CareerProfile;
  careerDocuments: CareerDocument[];
  gapAnalyses: GapAnalysis[];
  applicationPreparations: ApplicationPreparation[];
};

export type CreateSearchProfileInput = {
  name: string;
  scheduleRule: string;
  priority?: number;
  filters?: Record<string, unknown>;
};

export type CreateApplicationPreparationInput = {
  jobPostingId: string;
  strategyNote?: string;
};

export type UpdateApplicationPreparationInput = {
  id: string;
  status: ApplicationPreparationStatus;
  strategyNote?: string;
  approvalRequired: boolean;
  targetResumeId?: string | null;
  targetCoverLetterId?: string | null;
};

export type CreateJobPostingInput = {
  companyName: string;
  title: string;
  url: string;
  locationText?: string;
  employmentType?: string;
  status?: JobPostingStatus;
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

export type UpdateJobPostingInput = {
  id: string;
  companyName: string;
  title: string;
  url: string;
  locationText?: string;
  employmentType?: string;
  status: JobPostingStatus;
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

export type UpdateSearchProfileInput = {
  id: string;
  name: string;
  scheduleRule: string;
  priority?: number;
  isActive: boolean;
  filters?: Record<string, unknown>;
};

export interface CareerOSRepository {
  getSnapshot(): Promise<RepositorySnapshot>;
  listSearchProfiles(): Promise<SearchProfileRecord[]>;
  createSearchProfile(input: CreateSearchProfileInput): Promise<SearchProfileRecord>;
  updateSearchProfile(input: UpdateSearchProfileInput): Promise<SearchProfileRecord | null>;
  deleteSearchProfile(searchProfileId: string): Promise<void>;
  listJobPostings(): Promise<JobPostingListItem[]>;
  createJobPosting(input: CreateJobPostingInput): Promise<JobPostingDetailRecord>;
  updateJobPosting(input: UpdateJobPostingInput): Promise<JobPostingDetailRecord | null>;
  getJobPostingDetail(jobPostingId: string): Promise<JobPostingDetailRecord | null>;
  getCareerAssetSnapshot(): Promise<CareerAssetSnapshot>;
  listApplicationPreparations(): Promise<ApplicationPreparationRecord[]>;
  createApplicationPreparation(input: CreateApplicationPreparationInput): Promise<ApplicationPreparationRecord>;
  updateApplicationPreparation(
    input: UpdateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord | null>;
  deleteApplicationPreparation(applicationPreparationId: string): Promise<boolean>;
}
