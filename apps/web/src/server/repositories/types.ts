import type {
  ApplicationDocument,
  ApplicationPreparation,
  CareerDocument,
  CareerExperience,
  CareerProfile,
  CareerProject,
  ExternalAccount,
  GapAnalysis,
  JobAnalysis,
  JobPosting,
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

export interface CareerOSRepository {
  getSnapshot(): RepositorySnapshot;
  listSearchProfiles(): SearchProfileRecord[];
  createSearchProfile(input: CreateSearchProfileInput): SearchProfileRecord;
  listJobPostings(): JobPostingListItem[];
  getJobPostingDetail(jobPostingId: string): JobPostingDetailRecord | null;
  getCareerAssetSnapshot(): CareerAssetSnapshot;
  listApplicationPreparations(): ApplicationPreparationRecord[];
  createApplicationPreparation(
    input: CreateApplicationPreparationInput
  ): ApplicationPreparationRecord | ApplicationPreparation;
}

