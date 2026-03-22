import type { ApplicationPreparation } from "@careeros/domain";
import { cloneMockDatabase, getMockDatabase } from "../../data/mock-state";
import type {
  ApplicationPreparationRecord,
  CareerAssetSnapshot,
  CareerOSRepository,
  CreateApplicationPreparationInput,
  CreateSearchProfileInput,
  JobPostingDetailRecord,
  JobPostingListItem,
  RepositorySnapshot,
  SearchProfileRecord
} from "../types";

export class InMemoryCareerOSRepository implements CareerOSRepository {
  getSnapshot(): RepositorySnapshot {
    const db = cloneMockDatabase();

    return {
      user: db.user,
      preferences: db.preferences,
      searchProfiles: db.searchProfiles,
      jobPostings: db.jobPostings,
      jobPostingVersions: db.jobPostingVersions,
      jobAnalyses: db.jobAnalyses,
      careerProfile: db.careerProfile,
      careerDocuments: db.careerDocuments,
      gapAnalyses: db.gapAnalyses,
      applicationPreparations: db.applicationPreparations
    };
  }

  listSearchProfiles(): SearchProfileRecord[] {
    return cloneMockDatabase().searchProfiles.sort((left, right) => left.priority - right.priority);
  }

  createSearchProfile(input: CreateSearchProfileInput): SearchProfileRecord {
    const db = getMockDatabase();

    const searchProfile = {
      id: crypto.randomUUID(),
      userId: db.user.id,
      name: input.name,
      isActive: true,
      scheduleRule: input.scheduleRule,
      priority: input.priority ?? 100,
      filters: input.filters ?? {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.searchProfiles.push(searchProfile);
    return searchProfile;
  }

  listJobPostings(): JobPostingListItem[] {
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

  getJobPostingDetail(jobPostingId: string): JobPostingDetailRecord | null {
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

  getCareerAssetSnapshot(): CareerAssetSnapshot {
    const db = cloneMockDatabase();

    return {
      user: db.user,
      profile: db.careerProfile,
      experiences: db.careerExperiences,
      projects: db.careerProjects,
      documents: db.careerDocuments,
      skills: db.userSkills.map((userSkill) => ({
        ...userSkill,
        skill: db.skills.find((skill) => skill.id === userSkill.skillId) ?? null
      })),
      externalAccounts: db.externalAccounts
    };
  }

  listApplicationPreparations(): ApplicationPreparationRecord[] {
    const db = cloneMockDatabase();

    return db.applicationPreparations.map((preparation) => ({
      ...preparation,
      jobPosting: db.jobPostings.find((item) => item.id === preparation.jobPostingId) ?? null,
      documents: db.applicationDocuments.filter(
        (document) => document.applicationPreparationId === preparation.id
      )
    }));
  }

  createApplicationPreparation(
    input: CreateApplicationPreparationInput
  ): ApplicationPreparationRecord | ApplicationPreparation {
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
}

