import { createHash } from "node:crypto";
import type {
  ApplicationPreparationStatus,
  CareerDocument,
  CareerDocumentSource,
  CareerDocumentType,
  JobPostingStatus,
  JobPostingStructuredContent
} from "@careeros/domain";
import { cloneMockDatabase, getMockDatabase } from "../../data/mock-state";
import { buildStubAnalysis } from "../analysis-stub";
import type {
  ApplicationPreparationRecord,
  CareerAssetSnapshot,
  CareerOSRepository,
  CreateApplicationPreparationInput,
  CreateCareerExperienceInput,
  CreateCareerDocumentInput,
  CreateCareerProjectInput,
  CreateJobPostingInput,
  CreateSearchProfileInput,
  JobPostingDetailRecord,
  JobPostingListItem,
  RepositorySnapshot,
  RunJobPostingAnalysisInput,
  SearchProfileRecord,
  UpdateCareerExperienceInput,
  UpdateCareerDocumentInput,
  UpdateCareerProfileInput,
  UpdateApplicationPreparationInput,
  UpdateJobPostingInput,
  UpdateCareerProjectInput,
  UpdateSearchProfileInput
} from "../types";

function sortVersions<T extends { capturedAt: string; createdAt: string }>(versions: T[]) {
  return [...versions].sort(
    (left, right) =>
      new Date(right.capturedAt).getTime() -
        new Date(left.capturedAt).getTime() ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function slugifySegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildStructuredContent(input: {
  summary?: string;
  qualifications?: string[];
  preferredQualifications?: string[];
  techStack?: string[];
}): JobPostingStructuredContent {
  return {
    ...(input.summary ? { summary: input.summary } : {}),
    ...(input.qualifications?.length ? { qualifications: input.qualifications } : {}),
    ...(input.preferredQualifications?.length
      ? { preferredQualifications: input.preferredQualifications }
      : {}),
    ...(input.techStack?.length ? { techStack: input.techStack } : {})
  };
}

function buildContentHash(input: {
  summary?: string;
  rawText?: string;
  qualifications?: string[];
  preferredQualifications?: string[];
  techStack?: string[];
}) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        summary: input.summary ?? "",
        rawText: input.rawText ?? "",
        qualifications: input.qualifications ?? [],
        preferredQualifications: input.preferredQualifications ?? [],
        techStack: input.techStack ?? []
      })
    )
    .digest("hex");
}

function buildUniqueCanonicalKey(existingKeys: string[], companyName: string, title: string) {
  const base = [slugifySegment(companyName), slugifySegment(title)].filter(Boolean).join("-");
  const normalizedBase = base || "manual-job-posting";

  if (!existingKeys.includes(normalizedBase)) {
    return normalizedBase;
  }

  let index = 2;
  let candidate = `${normalizedBase}-${index}`;

  while (existingKeys.includes(candidate)) {
    index += 1;
    candidate = `${normalizedBase}-${index}`;
  }

  return candidate;
}

function mapApplicationPreparationRecord(
  preparation: ReturnType<typeof getMockDatabase>["applicationPreparations"][number],
  db: ReturnType<typeof getMockDatabase>
): ApplicationPreparationRecord {
  return {
    ...preparation,
    jobPosting: db.jobPostings.find((item) => item.id === preparation.jobPostingId) ?? null,
    documents: db.applicationDocuments.filter(
      (document) => document.applicationPreparationId === preparation.id
    )
  };
}

function normalizeOptionalId(value?: string | null) {
  return value?.trim() ? value.trim() : undefined;
}

function normalizeStrategyNote(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function assertCareerExperienceDateRange(startDate: string, endDate?: string) {
  if (endDate && new Date(endDate).getTime() < new Date(startDate).getTime()) {
    throw new Error("career experience endDate must not be earlier than startDate");
  }
}

function sortCareerExperiences<T extends { startDate: string; createdAt: string }>(experiences: T[]) {
  return [...experiences].sort(
    (left, right) =>
      new Date(right.startDate).getTime() -
        new Date(left.startDate).getTime() ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function sortCareerProjects<T extends { updatedAt: string; createdAt: string }>(projects: T[]) {
  return [...projects].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() -
        new Date(left.updatedAt).getTime() ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function mapCareerDocumentRecord(
  document: ReturnType<typeof getMockDatabase>["careerDocuments"][number]
): CareerDocument {
  return {
    ...document
  };
}

export class InMemoryCareerOSRepository implements CareerOSRepository {
  async getSnapshot(): Promise<RepositorySnapshot> {
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

  async listSearchProfiles(): Promise<SearchProfileRecord[]> {
    return cloneMockDatabase().searchProfiles.sort((left, right) => left.priority - right.priority);
  }

  async createSearchProfile(input: CreateSearchProfileInput): Promise<SearchProfileRecord> {
    const db = getMockDatabase();
    const now = new Date().toISOString();

    const searchProfile = {
      id: crypto.randomUUID(),
      userId: db.user.id,
      name: input.name,
      isActive: true,
      scheduleRule: input.scheduleRule,
      priority: input.priority ?? 100,
      filters: input.filters ?? {},
      createdAt: now,
      updatedAt: now
    };

    db.searchProfiles.push(searchProfile);
    return searchProfile;
  }

  async updateSearchProfile(input: UpdateSearchProfileInput): Promise<SearchProfileRecord | null> {
    const db = getMockDatabase();
    const current = db.searchProfiles.find((item) => item.id === input.id);

    if (!current) {
      return null;
    }

    current.name = input.name;
    current.scheduleRule = input.scheduleRule;
    current.priority = input.priority ?? current.priority;
    current.isActive = input.isActive;
    current.filters = input.filters ?? current.filters;
    current.updatedAt = new Date().toISOString();

    return current;
  }

  async deleteSearchProfile(searchProfileId: string): Promise<void> {
    const db = getMockDatabase();
    db.searchProfiles = db.searchProfiles.filter((item) => item.id !== searchProfileId);
  }

  async listJobPostings(): Promise<JobPostingListItem[]> {
    const db = cloneMockDatabase();

    return [...db.jobPostings]
      .sort(
        (left, right) =>
          new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime()
      )
      .map((jobPosting) => {
        const latestVersion = sortVersions(
          db.jobPostingVersions.filter((item) => item.jobPostingId === jobPosting.id)
        )[0];
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

  async createJobPosting(input: CreateJobPostingInput): Promise<JobPostingDetailRecord> {
    const db = getMockDatabase();
    const now = new Date().toISOString();
    const jobPostingId = crypto.randomUUID();

    const jobPosting = {
      id: jobPostingId,
      canonicalKey: buildUniqueCanonicalKey(
        db.jobPostings.map((item) => item.canonicalKey),
        input.companyName,
        input.title
      ),
      sourceId: "source-manual",
      sourceJobId: input.sourceJobId,
      url: input.url,
      companyName: input.companyName,
      title: input.title,
      locationText: input.locationText,
      employmentType: input.employmentType,
      status: (input.status ?? "unknown") as JobPostingStatus,
      postedAt: input.postedAt,
      detectedAt: now,
      lastSeenAt: now,
      createdAt: now,
      updatedAt: now
    };

    const version = {
      id: crypto.randomUUID(),
      jobPostingId,
      contentHash: buildContentHash(input.initialVersion),
      rawHtmlPath: undefined,
      rawText: input.initialVersion.rawText,
      jdStructured: buildStructuredContent(input.initialVersion),
      requirements: {},
      preferred: {},
      compensation: {},
      metadata: {
        source: "manual"
      },
      capturedAt: now,
      createdAt: now,
      updatedAt: now
    };

    db.jobPostings.push(jobPosting);
    db.jobPostingVersions.push(version);

    return {
      jobPosting,
      versions: [version],
      analysis: null,
      gapAnalysis: null,
      preparation: null
    };
  }

  async updateJobPosting(input: UpdateJobPostingInput): Promise<JobPostingDetailRecord | null> {
    const db = getMockDatabase();
    const jobPosting = db.jobPostings.find((item) => item.id === input.id);

    if (!jobPosting) {
      return null;
    }

    const now = new Date().toISOString();

    jobPosting.canonicalKey = buildUniqueCanonicalKey(
      db.jobPostings
        .filter((item) => item.id !== input.id)
        .map((item) => item.canonicalKey),
      input.companyName,
      input.title
    );
    jobPosting.companyName = input.companyName;
    jobPosting.title = input.title;
    jobPosting.url = input.url;
    jobPosting.locationText = input.locationText;
    jobPosting.employmentType = input.employmentType;
    jobPosting.status = input.status;
    jobPosting.postedAt = input.postedAt;
    jobPosting.sourceJobId = input.sourceJobId;
    jobPosting.updatedAt = now;
    jobPosting.lastSeenAt = now;

    const versions = sortVersions(
      db.jobPostingVersions.filter((item) => item.jobPostingId === input.id)
    );
    const latestVersion = versions[0];

    if (latestVersion) {
      latestVersion.rawText = input.latestVersion.rawText;
      latestVersion.jdStructured = buildStructuredContent(input.latestVersion);
      latestVersion.contentHash = buildContentHash(input.latestVersion);
      latestVersion.capturedAt = now;
      latestVersion.updatedAt = now;
    } else {
      db.jobPostingVersions.push({
        id: crypto.randomUUID(),
        jobPostingId: input.id,
        contentHash: buildContentHash(input.latestVersion),
        rawHtmlPath: undefined,
        rawText: input.latestVersion.rawText,
        jdStructured: buildStructuredContent(input.latestVersion),
        requirements: {},
        preferred: {},
        compensation: {},
        metadata: {
          source: "manual"
        },
        capturedAt: now,
        createdAt: now,
        updatedAt: now
      });
    }

    const detail = await this.getJobPostingDetail(input.id);
    return detail;
  }

  async getJobPostingDetail(jobPostingId: string): Promise<JobPostingDetailRecord | null> {
    const db = cloneMockDatabase();
    const jobPosting = db.jobPostings.find((item) => item.id === jobPostingId);

    if (!jobPosting) {
      return null;
    }

    return {
      jobPosting,
      versions: sortVersions(db.jobPostingVersions.filter((item) => item.jobPostingId === jobPostingId)),
      analysis: db.jobAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
      gapAnalysis: db.gapAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
      preparation:
        db.applicationPreparations.find((item) => item.jobPostingId === jobPostingId) ?? null
    };
  }

  async getCareerAssetSnapshot(): Promise<CareerAssetSnapshot> {
    const db = cloneMockDatabase();

    return {
      user: db.user,
      profile: db.careerProfile,
      experiences: sortCareerExperiences(db.careerExperiences),
      projects: sortCareerProjects(db.careerProjects),
      documents: db.careerDocuments,
      skills: db.userSkills.map((userSkill) => ({
        ...userSkill,
        skill: db.skills.find((skill) => skill.id === userSkill.skillId) ?? null
      })),
      externalAccounts: db.externalAccounts
    };
  }

  async updateCareerProfile(input: UpdateCareerProfileInput) {
    const db = getMockDatabase();

    db.careerProfile.headline = input.headline;
    db.careerProfile.bio = input.bio;
    db.careerProfile.yearsExperience = input.yearsExperience;
    db.careerProfile.targetRoles = input.targetRoles ?? [];
    db.careerProfile.updatedAt = new Date().toISOString();

    return {
      ...db.careerProfile
    };
  }

  async createCareerExperience(input: CreateCareerExperienceInput) {
    assertCareerExperienceDateRange(input.startDate, input.endDate);
    const db = getMockDatabase();
    const now = new Date().toISOString();
    const experience = {
      id: crypto.randomUUID(),
      careerProfileId: db.careerProfile.id,
      company: input.company,
      role: input.role,
      startDate: input.startDate,
      endDate: input.endDate,
      description: input.description,
      achievements: input.achievements ?? [],
      createdAt: now,
      updatedAt: now
    };

    db.careerExperiences.push(experience);
    return {
      ...experience
    };
  }

  async updateCareerExperience(input: UpdateCareerExperienceInput) {
    assertCareerExperienceDateRange(input.startDate, input.endDate);
    const db = getMockDatabase();
    const experience = db.careerExperiences.find((item) => item.id === input.id);

    if (!experience) {
      return null;
    }

    experience.company = input.company;
    experience.role = input.role;
    experience.startDate = input.startDate;
    experience.endDate = input.endDate;
    experience.description = input.description;
    experience.achievements = input.achievements ?? [];
    experience.updatedAt = new Date().toISOString();

    return {
      ...experience
    };
  }

  async deleteCareerExperience(experienceId: string) {
    const db = getMockDatabase();
    const previousLength = db.careerExperiences.length;

    db.careerExperiences = db.careerExperiences.filter((item) => item.id !== experienceId);

    return previousLength !== db.careerExperiences.length;
  }

  async createCareerProject(input: CreateCareerProjectInput) {
    const db = getMockDatabase();
    const now = new Date().toISOString();
    const project = {
      id: crypto.randomUUID(),
      careerProfileId: db.careerProfile.id,
      name: input.name,
      role: input.role,
      description: input.description,
      outcomes: input.outcomes ?? [],
      technologies: input.technologies ?? [],
      createdAt: now,
      updatedAt: now
    };

    db.careerProjects.push(project);
    return {
      ...project
    };
  }

  async updateCareerProject(input: UpdateCareerProjectInput) {
    const db = getMockDatabase();
    const project = db.careerProjects.find((item) => item.id === input.id);

    if (!project) {
      return null;
    }

    project.name = input.name;
    project.role = input.role;
    project.description = input.description;
    project.outcomes = input.outcomes ?? [];
    project.technologies = input.technologies ?? [];
    project.updatedAt = new Date().toISOString();

    return {
      ...project
    };
  }

  async deleteCareerProject(projectId: string) {
    const db = getMockDatabase();
    const previousLength = db.careerProjects.length;

    db.careerProjects = db.careerProjects.filter((item) => item.id !== projectId);

    return previousLength !== db.careerProjects.length;
  }

  async listCareerDocuments(): Promise<CareerDocument[]> {
    return cloneMockDatabase().careerDocuments
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      )
      .map((document) => mapCareerDocumentRecord(document));
  }

  async createCareerDocument(input: CreateCareerDocumentInput): Promise<CareerDocument> {
    const db = getMockDatabase();
    const now = new Date().toISOString();
    const document = {
      id: crypto.randomUUID(),
      userId: db.user.id,
      docType: input.docType as CareerDocumentType,
      title: input.title,
      storagePath: input.storagePath,
      sourceType: input.sourceType as CareerDocumentSource,
      parsedText: input.parsedText,
      structured: input.structured ?? {},
      version: 1,
      createdAt: now,
      updatedAt: now
    };

    db.careerDocuments.push(document);
    return mapCareerDocumentRecord(document);
  }

  async updateCareerDocument(input: UpdateCareerDocumentInput): Promise<CareerDocument | null> {
    const db = getMockDatabase();
    const document = db.careerDocuments.find((item) => item.id === input.id);

    if (!document) {
      return null;
    }

    document.docType = input.docType;
    document.title = input.title;
    document.sourceType = input.sourceType;
    document.storagePath = input.storagePath;
    document.parsedText = input.parsedText;
    document.structured = input.structured ?? {};
    document.version = input.version ?? document.version;
    document.updatedAt = new Date().toISOString();

    return mapCareerDocumentRecord(document);
  }

  async deleteCareerDocument(documentId: string): Promise<boolean> {
    const db = getMockDatabase();
    const previousLength = db.careerDocuments.length;

    db.careerDocuments = db.careerDocuments.filter((item) => item.id !== documentId);
    db.applicationPreparations = db.applicationPreparations.map((item) => ({
      ...item,
      targetResumeId: item.targetResumeId === documentId ? undefined : item.targetResumeId,
      targetCoverLetterId:
        item.targetCoverLetterId === documentId ? undefined : item.targetCoverLetterId
    }));

    return previousLength !== db.careerDocuments.length;
  }

  async runJobPostingAnalysis(
    input: RunJobPostingAnalysisInput
  ): Promise<JobPostingDetailRecord | null> {
    const db = getMockDatabase();
    const jobPosting = db.jobPostings.find((item) => item.id === input.jobPostingId);

    if (!jobPosting) {
      return null;
    }

    const now = new Date().toISOString();
    let latestVersion = sortVersions(
      db.jobPostingVersions.filter((item) => item.jobPostingId === input.jobPostingId)
    )[0];

    if (!latestVersion) {
      latestVersion = {
        id: crypto.randomUUID(),
        jobPostingId: input.jobPostingId,
        contentHash: buildContentHash({}),
        rawHtmlPath: undefined,
        rawText: undefined,
        jdStructured: {},
        requirements: {},
        preferred: {},
        compensation: {},
        metadata: {
          source: "manual"
        },
        capturedAt: now,
        createdAt: now,
        updatedAt: now
      };
      db.jobPostingVersions.push(latestVersion);
    }

    const analysis = buildStubAnalysis({
      jobPosting,
      latestVersion,
      documents: db.careerDocuments,
      profile: db.careerProfile,
      skills: db.userSkills.map((userSkill) => ({
        ...userSkill,
        skill: db.skills.find((skill) => skill.id === userSkill.skillId) ?? null
      }))
    });
    const existingJobAnalysis = db.jobAnalyses.find((item) => item.jobPostingId === input.jobPostingId);

    if (existingJobAnalysis) {
      existingJobAnalysis.analysisVersion = String(analysis.metadata.version);
      existingJobAnalysis.summary = analysis.summary;
      existingJobAnalysis.keyRequirements = analysis.keyRequirements;
      existingJobAnalysis.riskNotes = analysis.riskNotes;
      existingJobAnalysis.fitScore = analysis.fitScore;
      existingJobAnalysis.fitReason = analysis.fitReason;
      existingJobAnalysis.gapSummary = analysis.gapSummary;
      existingJobAnalysis.updatedAt = now;
    } else {
      db.jobAnalyses.push({
        id: crypto.randomUUID(),
        jobPostingId: input.jobPostingId,
        analysisVersion: String(analysis.metadata.version),
        summary: analysis.summary,
        keyRequirements: analysis.keyRequirements,
        riskNotes: analysis.riskNotes,
        fitScore: analysis.fitScore,
        fitReason: analysis.fitReason,
        gapSummary: analysis.gapSummary,
        createdAt: now,
        updatedAt: now
      });
    }

    const existingGapAnalysis = db.gapAnalyses.find(
      (item) => item.jobPostingId === input.jobPostingId && item.userId === db.user.id
    );

    if (existingGapAnalysis) {
      existingGapAnalysis.matchedSkills = analysis.matchedSkills;
      existingGapAnalysis.missingSkills = analysis.missingSkills;
      existingGapAnalysis.experienceGaps = analysis.experienceGaps;
      existingGapAnalysis.recommendations = analysis.recommendations;
      existingGapAnalysis.confidence = analysis.confidence;
      existingGapAnalysis.metadata = analysis.metadata;
      existingGapAnalysis.updatedAt = now;
    } else {
      db.gapAnalyses.push({
        id: crypto.randomUUID(),
        jobPostingId: input.jobPostingId,
        userId: db.user.id,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        experienceGaps: analysis.experienceGaps,
        recommendations: analysis.recommendations,
        confidence: analysis.confidence,
        metadata: analysis.metadata,
        createdAt: now,
        updatedAt: now
      });
    }

    return await this.getJobPostingDetail(input.jobPostingId);
  }

  async listApplicationPreparations(): Promise<ApplicationPreparationRecord[]> {
    const db = cloneMockDatabase();

    return [...db.applicationPreparations]
      .sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
      )
      .map((preparation) => mapApplicationPreparationRecord(preparation, db));
  }

  async createApplicationPreparation(
    input: CreateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord> {
    const db = getMockDatabase();
    const existing = db.applicationPreparations.find(
      (item) => item.jobPostingId === input.jobPostingId && item.userId === db.user.id
    );

    if (existing) {
      return mapApplicationPreparationRecord(existing, db);
    }

    const now = new Date().toISOString();
    const preparation = {
      id: crypto.randomUUID(),
      userId: db.user.id,
      jobPostingId: input.jobPostingId,
      status: "drafting" as ApplicationPreparationStatus,
      strategyNote: normalizeStrategyNote(input.strategyNote),
      targetResumeId: db.careerDocuments.find((item) => item.docType === "resume")?.id,
      targetCoverLetterId: undefined,
      approvalRequired: true,
      createdAt: now,
      updatedAt: now
    };

    db.applicationPreparations.push(preparation);
    return mapApplicationPreparationRecord(preparation, db);
  }

  async updateApplicationPreparation(
    input: UpdateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord | null> {
    const db = getMockDatabase();
    const preparation = db.applicationPreparations.find((item) => item.id === input.id);

    if (!preparation) {
      return null;
    }

    const resumeId = normalizeOptionalId(input.targetResumeId);
    const coverLetterId = normalizeOptionalId(input.targetCoverLetterId);

    preparation.status = input.status;
    preparation.strategyNote = normalizeStrategyNote(input.strategyNote);
    preparation.approvalRequired = input.approvalRequired;
    preparation.targetResumeId =
      resumeId && db.careerDocuments.some((item) => item.id === resumeId && item.docType === "resume")
        ? resumeId
        : undefined;
    preparation.targetCoverLetterId =
      coverLetterId &&
      db.careerDocuments.some((item) => item.id === coverLetterId && item.docType === "cover_letter")
        ? coverLetterId
        : undefined;
    preparation.updatedAt = new Date().toISOString();

    return mapApplicationPreparationRecord(preparation, db);
  }

  async deleteApplicationPreparation(applicationPreparationId: string): Promise<boolean> {
    const db = getMockDatabase();
    const previousLength = db.applicationPreparations.length;

    db.applicationPreparations = db.applicationPreparations.filter(
      (item) => item.id !== applicationPreparationId
    );
    db.applicationDocuments = db.applicationDocuments.filter(
      (item) => item.applicationPreparationId !== applicationPreparationId
    );

    return previousLength !== db.applicationPreparations.length;
  }
}
