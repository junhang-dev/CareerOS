import { createHash } from "node:crypto";
import {
  applicationDocuments,
  applicationPreparations,
  careerDocuments,
  careerExperiences,
  careerProfiles,
  careerProjects,
  externalAccounts,
  gapAnalyses,
  getDatabaseClient,
  jobAnalyses,
  jobPostings,
  jobPostingVersions,
  jobSources,
  searchProfiles,
  skills,
  userPreferences,
  users,
  userSkills
} from "@careeros/db";
import type {
  ApplicationPreparation,
  CareerDocument,
  CareerDocumentSource,
  CareerDocumentType,
  CareerExperience,
  CareerProfile,
  CareerProject,
  JobPostingStructuredContent,
  JsonObject
} from "@careeros/domain";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
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
import { DEFAULT_SINGLE_USER } from "./defaults";

type UserContext = {
  user: typeof users.$inferSelect;
  profile: typeof careerProfiles.$inferSelect;
};

function asRecord<T>(value: unknown): T {
  return (value ?? {}) as T;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
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

function sortVersions<T extends { capturedAt: string; createdAt: string }>(versions: T[]) {
  return [...versions].sort(
    (left, right) =>
      new Date(right.capturedAt).getTime() -
        new Date(left.capturedAt).getTime() ||
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export class PostgresCareerOSRepository implements CareerOSRepository {
  private db = getDatabaseClient();

  private mapSearchProfile(row: typeof searchProfiles.$inferSelect): SearchProfileRecord {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      isActive: row.isActive,
      scheduleRule: row.scheduleRule,
      priority: row.priority,
      filters: asRecord<Record<string, unknown>>(row.filtersJson),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapJobPosting(row: typeof jobPostings.$inferSelect) {
    return {
      id: row.id,
      canonicalKey: row.canonicalKey,
      sourceId: row.sourceId,
      sourceJobId: row.sourceJobId ?? undefined,
      url: row.url,
      companyName: row.companyName,
      title: row.title,
      locationText: row.locationText ?? undefined,
      employmentType: row.employmentType ?? undefined,
      status: row.status,
      postedAt: row.postedAt?.toISOString(),
      detectedAt: row.detectedAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapJobPostingVersion(row: typeof jobPostingVersions.$inferSelect) {
    return {
      id: row.id,
      jobPostingId: row.jobPostingId,
      contentHash: row.contentHash,
      rawHtmlPath: row.rawHtmlPath ?? undefined,
      rawText: row.rawText ?? undefined,
      jdStructured: asRecord<JobPostingStructuredContent>(row.jdStructuredJson),
      requirements: asRecord<JsonObject>(row.requirementsJson),
      preferred: asRecord<JsonObject>(row.preferredJson),
      compensation: asRecord<JsonObject>(row.compensationJson),
      metadata: asRecord<JsonObject>(row.metadataJson),
      capturedAt: row.capturedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapJobAnalysis(row: typeof jobAnalyses.$inferSelect) {
    return {
      id: row.id,
      jobPostingId: row.jobPostingId,
      analysisVersion: row.analysisVersion,
      summary: row.summary,
      keyRequirements: asRecord<JsonObject>(row.keyRequirementsJson),
      riskNotes: asRecord<JsonObject>(row.riskNotesJson),
      fitScore: row.fitScore ?? undefined,
      fitReason: asRecord<JsonObject>(row.fitReasonJson),
      gapSummary: row.gapSummary ?? undefined,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapGapAnalysis(row: typeof gapAnalyses.$inferSelect) {
    return {
      id: row.id,
      jobPostingId: row.jobPostingId,
      userId: row.userId,
      matchedSkills: asArray<string>(row.matchedSkillsJson),
      missingSkills: asArray<string>(row.missingSkillsJson),
      experienceGaps: asArray<string>(row.experienceGapsJson),
      recommendations: asArray<string>(row.recommendationsJson),
      confidence: row.confidence === null ? undefined : row.confidence / 10000,
      metadata: asRecord<JsonObject>(row.metadataJson),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapApplicationPreparation(row: typeof applicationPreparations.$inferSelect): ApplicationPreparation {
    return {
      id: row.id,
      userId: row.userId,
      jobPostingId: row.jobPostingId,
      status: row.status,
      strategyNote: row.strategyNote ?? undefined,
      targetResumeId: row.targetResumeId ?? undefined,
      targetCoverLetterId: row.targetCoverLetterId ?? undefined,
      approvalRequired: row.approvalRequired,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapCareerDocument(row: typeof careerDocuments.$inferSelect): CareerDocument {
    return {
      id: row.id,
      userId: row.userId,
      docType: row.docType as CareerDocumentType,
      title: row.title,
      storagePath: row.storagePath ?? undefined,
      sourceType: row.sourceType as CareerDocumentSource,
      parsedText: row.parsedText ?? undefined,
      structured: asRecord<JsonObject>(row.structuredJson),
      version: row.version,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapCareerProfile(row: typeof careerProfiles.$inferSelect): CareerProfile {
    return {
      id: row.id,
      userId: row.userId,
      headline: row.headline ?? undefined,
      bio: row.bio ?? undefined,
      yearsExperience: row.yearsExperience ?? undefined,
      targetRoles: asArray<string>(row.targetRolesJson),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapCareerExperience(row: typeof careerExperiences.$inferSelect): CareerExperience {
    return {
      id: row.id,
      careerProfileId: row.careerProfileId,
      company: row.company,
      role: row.role,
      startDate: row.startDate.toISOString(),
      endDate: row.endDate?.toISOString(),
      description: row.description ?? undefined,
      achievements: asArray<string>(row.achievementsJson),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapCareerProject(row: typeof careerProjects.$inferSelect): CareerProject {
    return {
      id: row.id,
      careerProfileId: row.careerProfileId,
      name: row.name,
      role: row.role ?? undefined,
      description: row.description ?? undefined,
      outcomes: asArray<string>(row.outcomesJson),
      technologies: asArray<string>(row.technologiesJson),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private mapApplicationDocument(row: typeof applicationDocuments.$inferSelect) {
    return {
      id: row.id,
      applicationPreparationId: row.applicationPreparationId,
      docType: row.docType as "resume" | "cover_letter" | "email" | "note",
      content: row.content,
      version: row.version,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    };
  }

  private async ensureUserContext(): Promise<UserContext> {
    const existingUsers = await this.db.select().from(users).limit(1);
    let user = existingUsers[0];

    if (!user) {
      [user] = await this.db.insert(users).values(DEFAULT_SINGLE_USER).returning();
    }

    await this.db
      .insert(userPreferences)
      .values({
        userId: user.id
      })
      .onConflictDoNothing();

    let [profile] = await this.db
      .select()
      .from(careerProfiles)
      .where(eq(careerProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      [profile] = await this.db
        .insert(careerProfiles)
        .values({
          userId: user.id,
          headline: "CareerOS Single User",
          bio: "커리어 자산을 관리할 기본 프로필",
          targetRolesJson: []
        })
        .returning();
    }

    return { user, profile };
  }

  private async ensureManualJobSource() {
    const [existing] = await this.db.select().from(jobSources).where(eq(jobSources.name, "manual")).limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await this.db
      .insert(jobSources)
      .values({
        sourceType: "manual",
        name: "manual",
        baseUrl: "manual://job-postings",
        country: "global"
      })
      .returning();

    return created;
  }

  private async buildUniqueCanonicalKey(companyName: string, title: string, excludeId?: string) {
    const base = [slugifySegment(companyName), slugifySegment(title)].filter(Boolean).join("-");
    const normalizedBase = base || "manual-job-posting";
    let candidate = normalizedBase;
    let index = 2;

    while (true) {
      const [existing] = await this.db
        .select({ id: jobPostings.id })
        .from(jobPostings)
        .where(
          excludeId
            ? and(eq(jobPostings.canonicalKey, candidate), ne(jobPostings.id, excludeId))
            : eq(jobPostings.canonicalKey, candidate)
        )
        .limit(1);

      if (!existing) {
        return candidate;
      }

      candidate = `${normalizedBase}-${index}`;
      index += 1;
    }
  }

  private async loadApplicationPreparationRecords(
    rows: Array<typeof applicationPreparations.$inferSelect>
  ): Promise<ApplicationPreparationRecord[]> {
    if (rows.length === 0) {
      return [];
    }

    const jobPostingIds = rows.map((row) => row.jobPostingId);
    const preparationIds = rows.map((row) => row.id);

    const [jobPostingRows, documentRows] = await Promise.all([
      this.db.select().from(jobPostings).where(inArray(jobPostings.id, jobPostingIds)),
      this.db
        .select()
        .from(applicationDocuments)
        .where(inArray(applicationDocuments.applicationPreparationId, preparationIds))
    ]);

    return rows.map((row) => ({
      ...this.mapApplicationPreparation(row),
      jobPosting:
        jobPostingRows.find((jobPostingRow) => jobPostingRow.id === row.jobPostingId)
          ? this.mapJobPosting(jobPostingRows.find((jobPostingRow) => jobPostingRow.id === row.jobPostingId)!)
          : null,
      documents: documentRows
        .filter((documentRow) => documentRow.applicationPreparationId === row.id)
        .map((documentRow) => this.mapApplicationDocument(documentRow))
    }));
  }

  async getSnapshot(): Promise<RepositorySnapshot> {
    const { user, profile } = await this.ensureUserContext();

    const [
      [preference],
      searchProfileRows,
      jobPostingRows,
      jobPostingVersionRows,
      jobAnalysisRows,
      careerDocumentRows,
      gapAnalysisRows,
      applicationPreparationRows
    ] = await Promise.all([
      this.db.select().from(userPreferences).where(eq(userPreferences.userId, user.id)).limit(1),
      this.db
        .select()
        .from(searchProfiles)
        .where(eq(searchProfiles.userId, user.id))
        .orderBy(asc(searchProfiles.priority)),
      this.db.select().from(jobPostings).orderBy(desc(jobPostings.lastSeenAt)),
      this.db
        .select()
        .from(jobPostingVersions)
        .orderBy(desc(jobPostingVersions.capturedAt), desc(jobPostingVersions.createdAt)),
      this.db.select().from(jobAnalyses),
      this.db.select().from(careerDocuments).where(eq(careerDocuments.userId, user.id)),
      this.db.select().from(gapAnalyses).where(eq(gapAnalyses.userId, user.id)),
      this.db
        .select()
        .from(applicationPreparations)
        .where(eq(applicationPreparations.userId, user.id))
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        locale: user.locale,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      preferences: {
        userId: user.id,
        jobRegions: preference?.jobRegions ?? [],
        jobTypes: preference?.jobTypes ?? [],
        industries: preference?.industries ?? [],
        seniorityLevels: preference?.seniorityLevels ?? [],
        companyTypes: preference?.companyTypes ?? [],
        salaryMin: preference?.salaryMin ?? undefined,
        remotePreference: preference?.remotePreference ?? undefined,
        visaSupportNeeded: preference?.visaSupportNeeded ?? false,
        keywordsInclude: preference?.keywordsInclude ?? [],
        keywordsExclude: preference?.keywordsExclude ?? [],
        createdAt: preference?.createdAt.toISOString() ?? new Date().toISOString(),
        updatedAt: preference?.updatedAt.toISOString() ?? new Date().toISOString()
      },
      searchProfiles: searchProfileRows.map((row) => this.mapSearchProfile(row)),
      jobPostings: jobPostingRows.map((row) => this.mapJobPosting(row)),
      jobPostingVersions: jobPostingVersionRows.map((row) => this.mapJobPostingVersion(row)),
      jobAnalyses: jobAnalysisRows.map((row) => this.mapJobAnalysis(row)),
      careerProfile: {
        id: profile.id,
        userId: profile.userId,
        headline: profile.headline ?? undefined,
        bio: profile.bio ?? undefined,
        yearsExperience: profile.yearsExperience ?? undefined,
        targetRoles: asArray<string>(profile.targetRolesJson),
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      },
      careerDocuments: careerDocumentRows.map((row) => this.mapCareerDocument(row)),
      gapAnalyses: gapAnalysisRows.map((row) => this.mapGapAnalysis(row)),
      applicationPreparations: applicationPreparationRows.map((row) => this.mapApplicationPreparation(row))
    };
  }

  async listSearchProfiles(): Promise<SearchProfileRecord[]> {
    const { user } = await this.ensureUserContext();
    const rows = await this.db
      .select()
      .from(searchProfiles)
      .where(eq(searchProfiles.userId, user.id))
      .orderBy(asc(searchProfiles.priority));

    return rows.map((row) => this.mapSearchProfile(row));
  }

  async createSearchProfile(input: CreateSearchProfileInput): Promise<SearchProfileRecord> {
    const { user } = await this.ensureUserContext();

    const [row] = await this.db
      .insert(searchProfiles)
      .values({
        userId: user.id,
        name: input.name,
        scheduleRule: input.scheduleRule,
        priority: input.priority ?? 100,
        filtersJson: input.filters ?? {}
      })
      .returning();

    return this.mapSearchProfile(row);
  }

  async updateSearchProfile(input: UpdateSearchProfileInput): Promise<SearchProfileRecord | null> {
    const { user } = await this.ensureUserContext();

    const [row] = await this.db
      .update(searchProfiles)
      .set({
        name: input.name,
        scheduleRule: input.scheduleRule,
        priority: input.priority ?? 100,
        isActive: input.isActive,
        filtersJson: input.filters ?? {},
        updatedAt: new Date()
      })
      .where(and(eq(searchProfiles.id, input.id), eq(searchProfiles.userId, user.id)))
      .returning();

    return row ? this.mapSearchProfile(row) : null;
  }

  async deleteSearchProfile(searchProfileId: string): Promise<void> {
    const { user } = await this.ensureUserContext();

    await this.db
      .delete(searchProfiles)
      .where(and(eq(searchProfiles.id, searchProfileId), eq(searchProfiles.userId, user.id)));
  }

  async listJobPostings(): Promise<JobPostingListItem[]> {
    const snapshot = await this.getSnapshot();

    return snapshot.jobPostings.map((jobPosting) => ({
      ...jobPosting,
      latestVersion: sortVersions(
        snapshot.jobPostingVersions.filter((item) => item.jobPostingId === jobPosting.id)
      )[0],
      analysis: snapshot.jobAnalyses.find((item) => item.jobPostingId === jobPosting.id),
      gapAnalysis: snapshot.gapAnalyses.find((item) => item.jobPostingId === jobPosting.id)
    }));
  }

  async createJobPosting(input: CreateJobPostingInput): Promise<JobPostingDetailRecord> {
    await this.ensureUserContext();
    const manualSource = await this.ensureManualJobSource();
    const canonicalKey = await this.buildUniqueCanonicalKey(input.companyName, input.title);

    return await this.db.transaction(async (tx) => {
      const now = new Date();
      const [jobPostingRow] = await tx
        .insert(jobPostings)
        .values({
          canonicalKey,
          sourceId: manualSource.id,
          sourceJobId: input.sourceJobId,
          url: input.url,
          companyName: input.companyName,
          title: input.title,
          locationText: input.locationText,
          employmentType: input.employmentType,
          status: input.status ?? "unknown",
          postedAt: input.postedAt ? new Date(input.postedAt) : null,
          detectedAt: now,
          lastSeenAt: now,
          updatedAt: now
        })
        .returning();

      const [versionRow] = await tx
        .insert(jobPostingVersions)
        .values({
          jobPostingId: jobPostingRow.id,
          contentHash: buildContentHash(input.initialVersion),
          rawText: input.initialVersion.rawText,
          jdStructuredJson: buildStructuredContent(input.initialVersion),
          requirementsJson: {},
          preferredJson: {},
          compensationJson: {},
          metadataJson: {
            source: "manual"
          },
          capturedAt: now,
          updatedAt: now
        })
        .returning();

      return {
        jobPosting: this.mapJobPosting(jobPostingRow),
        versions: [this.mapJobPostingVersion(versionRow)],
        analysis: null,
        gapAnalysis: null,
        preparation: null
      };
    });
  }

  async updateJobPosting(input: UpdateJobPostingInput): Promise<JobPostingDetailRecord | null> {
    await this.ensureUserContext();
    const canonicalKey = await this.buildUniqueCanonicalKey(input.companyName, input.title, input.id);

    const updated = await this.db.transaction(async (tx) => {
      const now = new Date();
      const [jobPostingRow] = await tx
        .update(jobPostings)
        .set({
          canonicalKey,
          sourceJobId: input.sourceJobId,
          url: input.url,
          companyName: input.companyName,
          title: input.title,
          locationText: input.locationText,
          employmentType: input.employmentType,
          status: input.status,
          postedAt: input.postedAt ? new Date(input.postedAt) : null,
          lastSeenAt: now,
          updatedAt: now
        })
        .where(eq(jobPostings.id, input.id))
        .returning();

      if (!jobPostingRow) {
        return null;
      }

      const [latestVersionRow] = await tx
        .select()
        .from(jobPostingVersions)
        .where(eq(jobPostingVersions.jobPostingId, input.id))
        .orderBy(desc(jobPostingVersions.capturedAt), desc(jobPostingVersions.createdAt))
        .limit(1);

      if (latestVersionRow) {
        await tx
          .update(jobPostingVersions)
          .set({
            rawText: input.latestVersion.rawText,
            jdStructuredJson: buildStructuredContent(input.latestVersion),
            contentHash: buildContentHash(input.latestVersion),
            capturedAt: now,
            updatedAt: now
          })
          .where(eq(jobPostingVersions.id, latestVersionRow.id));
      } else {
        await tx.insert(jobPostingVersions).values({
          jobPostingId: input.id,
          contentHash: buildContentHash(input.latestVersion),
          rawText: input.latestVersion.rawText,
          jdStructuredJson: buildStructuredContent(input.latestVersion),
          requirementsJson: {},
          preferredJson: {},
          compensationJson: {},
          metadataJson: {
            source: "manual"
          },
          capturedAt: now,
          updatedAt: now
        });
      }

      return true;
    });

    if (!updated) {
      return null;
    }

    return await this.getJobPostingDetail(input.id);
  }

  async getJobPostingDetail(jobPostingId: string): Promise<JobPostingDetailRecord | null> {
    const snapshot = await this.getSnapshot();
    const jobPosting = snapshot.jobPostings.find((item) => item.id === jobPostingId);

    if (!jobPosting) {
      return null;
    }

    return {
      jobPosting,
      versions: sortVersions(
        snapshot.jobPostingVersions.filter((item) => item.jobPostingId === jobPostingId)
      ),
      analysis: snapshot.jobAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
      gapAnalysis: snapshot.gapAnalyses.find((item) => item.jobPostingId === jobPostingId) ?? null,
      preparation:
        snapshot.applicationPreparations.find((item) => item.jobPostingId === jobPostingId) ?? null
    };
  }

  async getCareerAssetSnapshot(): Promise<CareerAssetSnapshot> {
    const { user, profile } = await this.ensureUserContext();

    const [experienceRows, projectRows, documentRows, userSkillRows, skillRows, accountRows] =
      await Promise.all([
        this.db
          .select()
          .from(careerExperiences)
          .where(eq(careerExperiences.careerProfileId, profile.id))
          .orderBy(desc(careerExperiences.startDate), desc(careerExperiences.createdAt)),
        this.db
          .select()
          .from(careerProjects)
          .where(eq(careerProjects.careerProfileId, profile.id))
          .orderBy(desc(careerProjects.updatedAt), desc(careerProjects.createdAt)),
        this.db.select().from(careerDocuments).where(eq(careerDocuments.userId, user.id)),
        this.db.select().from(userSkills).where(eq(userSkills.userId, user.id)),
        this.db.select().from(skills),
        this.db.select().from(externalAccounts).where(eq(externalAccounts.userId, user.id))
      ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        timezone: user.timezone,
        locale: user.locale,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      profile: this.mapCareerProfile(profile),
      experiences: experienceRows.map((row) => this.mapCareerExperience(row)),
      projects: projectRows.map((row) => this.mapCareerProject(row)),
      documents: documentRows.map((row) => this.mapCareerDocument(row)),
      skills: userSkillRows.map((row) => {
        const skillRow = skillRows.find((candidate) => candidate.id === row.skillId);

        return {
          userId: row.userId,
          skillId: row.skillId,
          proficiency: row.proficiency ?? undefined,
          evidenceCount: row.evidenceCount,
          lastVerifiedAt: row.lastVerifiedAt?.toISOString(),
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          skill: skillRow
            ? {
                id: skillRow.id,
                name: skillRow.name,
                category: skillRow.category ?? undefined,
                createdAt: skillRow.createdAt.toISOString(),
                updatedAt: skillRow.updatedAt.toISOString()
              }
            : null
        };
      }),
      externalAccounts: accountRows.map((row) => ({
        id: row.id,
        userId: row.userId,
        provider: row.provider as "github" | "linkedin" | "notion",
        accountRef: row.accountRef,
        status: row.status as "connected" | "disconnected" | "error" | "pending",
        metadata: asRecord<JsonObject>(row.metadataJson),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      }))
    };
  }

  async updateCareerProfile(input: UpdateCareerProfileInput) {
    const { profile } = await this.ensureUserContext();
    const [row] = await this.db
      .update(careerProfiles)
      .set({
        headline: input.headline,
        bio: input.bio,
        yearsExperience: input.yearsExperience,
        targetRolesJson: input.targetRoles ?? [],
        updatedAt: new Date()
      })
      .where(eq(careerProfiles.id, profile.id))
      .returning();

    return this.mapCareerProfile(row);
  }

  async createCareerExperience(input: CreateCareerExperienceInput) {
    assertCareerExperienceDateRange(input.startDate, input.endDate);
    const { profile } = await this.ensureUserContext();
    const [row] = await this.db
      .insert(careerExperiences)
      .values({
        careerProfileId: profile.id,
        company: input.company,
        role: input.role,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        description: input.description,
        achievementsJson: input.achievements ?? []
      })
      .returning();

    return this.mapCareerExperience(row);
  }

  async updateCareerExperience(input: UpdateCareerExperienceInput) {
    assertCareerExperienceDateRange(input.startDate, input.endDate);
    const { profile } = await this.ensureUserContext();
    const [row] = await this.db
      .update(careerExperiences)
      .set({
        company: input.company,
        role: input.role,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        description: input.description,
        achievementsJson: input.achievements ?? [],
        updatedAt: new Date()
      })
      .where(
        and(
          eq(careerExperiences.id, input.id),
          eq(careerExperiences.careerProfileId, profile.id)
        )
      )
      .returning();

    return row ? this.mapCareerExperience(row) : null;
  }

  async deleteCareerExperience(experienceId: string) {
    const { profile } = await this.ensureUserContext();
    const rows = await this.db
      .delete(careerExperiences)
      .where(
        and(
          eq(careerExperiences.id, experienceId),
          eq(careerExperiences.careerProfileId, profile.id)
        )
      )
      .returning({ id: careerExperiences.id });

    return rows.length > 0;
  }

  async createCareerProject(input: CreateCareerProjectInput) {
    const { profile } = await this.ensureUserContext();
    const [row] = await this.db
      .insert(careerProjects)
      .values({
        careerProfileId: profile.id,
        name: input.name,
        role: input.role,
        description: input.description,
        outcomesJson: input.outcomes ?? [],
        technologiesJson: input.technologies ?? []
      })
      .returning();

    return this.mapCareerProject(row);
  }

  async updateCareerProject(input: UpdateCareerProjectInput) {
    const { profile } = await this.ensureUserContext();
    const [row] = await this.db
      .update(careerProjects)
      .set({
        name: input.name,
        role: input.role,
        description: input.description,
        outcomesJson: input.outcomes ?? [],
        technologiesJson: input.technologies ?? [],
        updatedAt: new Date()
      })
      .where(and(eq(careerProjects.id, input.id), eq(careerProjects.careerProfileId, profile.id)))
      .returning();

    return row ? this.mapCareerProject(row) : null;
  }

  async deleteCareerProject(projectId: string) {
    const { profile } = await this.ensureUserContext();
    const rows = await this.db
      .delete(careerProjects)
      .where(and(eq(careerProjects.id, projectId), eq(careerProjects.careerProfileId, profile.id)))
      .returning({ id: careerProjects.id });

    return rows.length > 0;
  }

  async listCareerDocuments() {
    const { user } = await this.ensureUserContext();
    const rows = await this.db
      .select()
      .from(careerDocuments)
      .where(eq(careerDocuments.userId, user.id))
      .orderBy(desc(careerDocuments.updatedAt), desc(careerDocuments.createdAt));

    return rows.map((row) => this.mapCareerDocument(row));
  }

  async createCareerDocument(input: CreateCareerDocumentInput) {
    const { user } = await this.ensureUserContext();
    const [row] = await this.db
      .insert(careerDocuments)
      .values({
        userId: user.id,
        docType: input.docType,
        title: input.title,
        storagePath: input.storagePath,
        sourceType: input.sourceType,
        parsedText: input.parsedText,
        structuredJson: input.structured ?? {}
      })
      .returning();

    return this.mapCareerDocument(row);
  }

  async updateCareerDocument(input: UpdateCareerDocumentInput) {
    const { user } = await this.ensureUserContext();
    const [row] = await this.db
      .update(careerDocuments)
      .set({
        docType: input.docType,
        title: input.title,
        sourceType: input.sourceType,
        storagePath: input.storagePath,
        parsedText: input.parsedText,
        structuredJson: input.structured ?? {},
        version: input.version,
        updatedAt: new Date()
      })
      .where(and(eq(careerDocuments.id, input.id), eq(careerDocuments.userId, user.id)))
      .returning();

    return row ? this.mapCareerDocument(row) : null;
  }

  async deleteCareerDocument(documentId: string) {
    const { user } = await this.ensureUserContext();

    await this.db
      .update(applicationPreparations)
      .set({
        targetResumeId: null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(applicationPreparations.userId, user.id),
          eq(applicationPreparations.targetResumeId, documentId)
        )
      );

    await this.db
      .update(applicationPreparations)
      .set({
        targetCoverLetterId: null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(applicationPreparations.userId, user.id),
          eq(applicationPreparations.targetCoverLetterId, documentId)
        )
      );

    const rows = await this.db
      .delete(careerDocuments)
      .where(and(eq(careerDocuments.id, documentId), eq(careerDocuments.userId, user.id)))
      .returning({ id: careerDocuments.id });

    return rows.length > 0;
  }

  async runJobPostingAnalysis(input: RunJobPostingAnalysisInput): Promise<JobPostingDetailRecord | null> {
    const { user, profile } = await this.ensureUserContext();
    const [jobPostingRow] = await this.db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, input.jobPostingId))
      .limit(1);

    if (!jobPostingRow) {
      return null;
    }

    let [latestVersionRow] = await this.db
      .select()
      .from(jobPostingVersions)
      .where(eq(jobPostingVersions.jobPostingId, input.jobPostingId))
      .orderBy(desc(jobPostingVersions.capturedAt), desc(jobPostingVersions.createdAt))
      .limit(1);

    if (!latestVersionRow) {
      const now = new Date();
      [latestVersionRow] = await this.db
        .insert(jobPostingVersions)
        .values({
          jobPostingId: input.jobPostingId,
          contentHash: buildContentHash({}),
          jdStructuredJson: {},
          requirementsJson: {},
          preferredJson: {},
          compensationJson: {},
          metadataJson: {
            source: "manual"
          },
          capturedAt: now,
          updatedAt: now
        })
        .returning();
    }

    const [documentRows, userSkillRows, skillRows] = await Promise.all([
      this.db.select().from(careerDocuments).where(eq(careerDocuments.userId, user.id)),
      this.db.select().from(userSkills).where(eq(userSkills.userId, user.id)),
      this.db.select().from(skills)
    ]);
    const analysis = buildStubAnalysis({
      jobPosting: this.mapJobPosting(jobPostingRow),
      latestVersion: this.mapJobPostingVersion(latestVersionRow),
      documents: documentRows.map((row) => this.mapCareerDocument(row)),
      profile: {
        id: profile.id,
        userId: profile.userId,
        headline: profile.headline ?? undefined,
        bio: profile.bio ?? undefined,
        yearsExperience: profile.yearsExperience ?? undefined,
        targetRoles: asArray<string>(profile.targetRolesJson),
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      },
      skills: userSkillRows.map((row) => {
        const skillRow = skillRows.find((candidate) => candidate.id === row.skillId);

        return {
          userId: row.userId,
          skillId: row.skillId,
          proficiency: row.proficiency ?? undefined,
          evidenceCount: row.evidenceCount,
          lastVerifiedAt: row.lastVerifiedAt?.toISOString(),
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          skill: skillRow
            ? {
                id: skillRow.id,
                name: skillRow.name,
                category: skillRow.category ?? undefined,
                createdAt: skillRow.createdAt.toISOString(),
                updatedAt: skillRow.updatedAt.toISOString()
              }
            : null
        };
      })
    });

    await this.db.transaction(async (tx) => {
      const now = new Date();
      const [existingJobAnalysis] = await tx
        .select()
        .from(jobAnalyses)
        .where(eq(jobAnalyses.jobPostingId, input.jobPostingId))
        .limit(1);

      if (existingJobAnalysis) {
        await tx
          .update(jobAnalyses)
          .set({
            analysisVersion: String(analysis.metadata.version),
            summary: analysis.summary,
            keyRequirementsJson: analysis.keyRequirements,
            riskNotesJson: analysis.riskNotes,
            fitScore: analysis.fitScore,
            fitReasonJson: analysis.fitReason,
            gapSummary: analysis.gapSummary,
            updatedAt: now
          })
          .where(eq(jobAnalyses.id, existingJobAnalysis.id));
      } else {
        await tx.insert(jobAnalyses).values({
          jobPostingId: input.jobPostingId,
          analysisVersion: String(analysis.metadata.version),
          summary: analysis.summary,
          keyRequirementsJson: analysis.keyRequirements,
          riskNotesJson: analysis.riskNotes,
          fitScore: analysis.fitScore,
          fitReasonJson: analysis.fitReason,
          gapSummary: analysis.gapSummary,
          updatedAt: now
        });
      }

      const [existingGapAnalysis] = await tx
        .select()
        .from(gapAnalyses)
        .where(and(eq(gapAnalyses.jobPostingId, input.jobPostingId), eq(gapAnalyses.userId, user.id)))
        .limit(1);

      if (existingGapAnalysis) {
        await tx
          .update(gapAnalyses)
          .set({
            matchedSkillsJson: analysis.matchedSkills,
            missingSkillsJson: analysis.missingSkills,
            experienceGapsJson: analysis.experienceGaps,
            recommendationsJson: analysis.recommendations,
            confidence: Math.round(analysis.confidence * 10000),
            metadataJson: analysis.metadata,
            updatedAt: now
          })
          .where(eq(gapAnalyses.id, existingGapAnalysis.id));
      } else {
        await tx.insert(gapAnalyses).values({
          jobPostingId: input.jobPostingId,
          userId: user.id,
          matchedSkillsJson: analysis.matchedSkills,
          missingSkillsJson: analysis.missingSkills,
          experienceGapsJson: analysis.experienceGaps,
          recommendationsJson: analysis.recommendations,
          confidence: Math.round(analysis.confidence * 10000),
          metadataJson: analysis.metadata,
          updatedAt: now
        });
      }
    });

    return await this.getJobPostingDetail(input.jobPostingId);
  }

  async listApplicationPreparations(): Promise<ApplicationPreparationRecord[]> {
    const { user } = await this.ensureUserContext();
    const preparationRows = await this.db
      .select()
      .from(applicationPreparations)
      .where(eq(applicationPreparations.userId, user.id))
      .orderBy(desc(applicationPreparations.updatedAt));

    return await this.loadApplicationPreparationRecords(preparationRows);
  }

  async createApplicationPreparation(
    input: CreateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord> {
    const { user } = await this.ensureUserContext();

    const [existing] = await this.db
      .select()
      .from(applicationPreparations)
      .where(
        and(
          eq(applicationPreparations.userId, user.id),
          eq(applicationPreparations.jobPostingId, input.jobPostingId)
        )
      )
      .limit(1);

    if (existing) {
      return (await this.loadApplicationPreparationRecords([existing]))[0];
    }

    const [document] = await this.db
      .select()
      .from(careerDocuments)
      .where(and(eq(careerDocuments.userId, user.id), eq(careerDocuments.docType, "resume")))
      .limit(1);

    const [row] = await this.db
      .insert(applicationPreparations)
      .values({
        userId: user.id,
        jobPostingId: input.jobPostingId,
        status: "drafting",
        strategyNote: normalizeStrategyNote(input.strategyNote),
        targetResumeId: document?.id
      })
      .returning();

    return (await this.loadApplicationPreparationRecords([row]))[0];
  }

  async updateApplicationPreparation(
    input: UpdateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord | null> {
    const { user } = await this.ensureUserContext();
    const resumeId = normalizeOptionalId(input.targetResumeId);
    const coverLetterId = normalizeOptionalId(input.targetCoverLetterId);
    const documentIds = [resumeId, coverLetterId].filter((value): value is string => Boolean(value));

    const documentRows =
      documentIds.length > 0
        ? await this.db
            .select()
            .from(careerDocuments)
            .where(and(eq(careerDocuments.userId, user.id), inArray(careerDocuments.id, documentIds)))
        : [];

    const validResumeId =
      resumeId && documentRows.some((row) => row.id === resumeId && row.docType === "resume")
        ? resumeId
        : null;
    const validCoverLetterId =
      coverLetterId &&
      documentRows.some((row) => row.id === coverLetterId && row.docType === "cover_letter")
        ? coverLetterId
        : null;

    const [row] = await this.db
      .update(applicationPreparations)
      .set({
        status: input.status,
        strategyNote: normalizeStrategyNote(input.strategyNote),
        approvalRequired: input.approvalRequired,
        targetResumeId: validResumeId,
        targetCoverLetterId: validCoverLetterId,
        updatedAt: new Date()
      })
      .where(and(eq(applicationPreparations.id, input.id), eq(applicationPreparations.userId, user.id)))
      .returning();

    if (!row) {
      return null;
    }

    return (await this.loadApplicationPreparationRecords([row]))[0];
  }

  async deleteApplicationPreparation(applicationPreparationId: string): Promise<boolean> {
    const { user } = await this.ensureUserContext();
    const rows = await this.db
      .delete(applicationPreparations)
      .where(
        and(
          eq(applicationPreparations.id, applicationPreparationId),
          eq(applicationPreparations.userId, user.id)
        )
      )
      .returning({ id: applicationPreparations.id });

    return rows.length > 0;
  }
}
