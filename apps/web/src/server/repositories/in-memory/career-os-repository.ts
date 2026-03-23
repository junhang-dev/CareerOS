import { createHash } from "node:crypto";
import type {
  ApplicationPreparationStatus,
  JobPostingStatus,
  JobPostingStructuredContent
} from "@careeros/domain";
import { cloneMockDatabase, getMockDatabase } from "../../data/mock-state";
import type {
  ApplicationPreparationRecord,
  CareerAssetSnapshot,
  CareerOSRepository,
  CreateApplicationPreparationInput,
  CreateJobPostingInput,
  CreateSearchProfileInput,
  JobPostingDetailRecord,
  JobPostingListItem,
  RepositorySnapshot,
  SearchProfileRecord,
  UpdateApplicationPreparationInput,
  UpdateJobPostingInput,
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
