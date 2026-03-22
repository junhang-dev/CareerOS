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
  searchProfiles,
  skills,
  userPreferences,
  users,
  userSkills
} from "@careeros/db";
import type {
  ApplicationPreparation,
  CareerDocumentSource,
  CareerDocumentType,
  JobPostingStructuredContent,
  JsonObject
} from "@careeros/domain";
import { and, asc, eq, inArray } from "drizzle-orm";
import type {
  ApplicationPreparationRecord,
  CareerAssetSnapshot,
  CareerOSRepository,
  CreateApplicationPreparationInput,
  CreateSearchProfileInput,
  JobPostingDetailRecord,
  JobPostingListItem,
  RepositorySnapshot,
  SearchProfileRecord,
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

  private mapCareerDocument(row: typeof careerDocuments.$inferSelect) {
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

  private async ensureUserContext(): Promise<UserContext> {
    const existingUsers = await this.db.select().from(users).limit(1);
    let user = existingUsers[0];

    if (!user) {
      [user] = await this.db
        .insert(users)
        .values(DEFAULT_SINGLE_USER)
        .returning();
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
      this.db.select().from(jobPostings),
      this.db.select().from(jobPostingVersions),
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
      latestVersion: snapshot.jobPostingVersions.find((item) => item.jobPostingId === jobPosting.id),
      analysis: snapshot.jobAnalyses.find((item) => item.jobPostingId === jobPosting.id),
      gapAnalysis: snapshot.gapAnalyses.find((item) => item.jobPostingId === jobPosting.id)
    }));
  }

  async getJobPostingDetail(jobPostingId: string): Promise<JobPostingDetailRecord | null> {
    const snapshot = await this.getSnapshot();
    const jobPosting = snapshot.jobPostings.find((item) => item.id === jobPostingId);

    if (!jobPosting) {
      return null;
    }

    return {
      jobPosting,
      versions: snapshot.jobPostingVersions.filter((item) => item.jobPostingId === jobPostingId),
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
          .where(eq(careerExperiences.careerProfileId, profile.id)),
        this.db
          .select()
          .from(careerProjects)
          .where(eq(careerProjects.careerProfileId, profile.id)),
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
      experiences: experienceRows.map((row) => ({
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
      })),
      projects: projectRows.map((row) => ({
        id: row.id,
        careerProfileId: row.careerProfileId,
        name: row.name,
        role: row.role ?? undefined,
        description: row.description ?? undefined,
        outcomes: asArray<string>(row.outcomesJson),
        technologies: asArray<string>(row.technologiesJson),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString()
      })),
      documents: documentRows.map((row) => this.mapCareerDocument(row)),
      skills: userSkillRows.map((row) => ({
        userId: row.userId,
        skillId: row.skillId,
        proficiency: row.proficiency ?? undefined,
        evidenceCount: row.evidenceCount,
        lastVerifiedAt: row.lastVerifiedAt?.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        skill:
          skillRows.find((skillRow) => skillRow.id === row.skillId)
            ? {
                id: skillRows.find((skillRow) => skillRow.id === row.skillId)!.id,
                name: skillRows.find((skillRow) => skillRow.id === row.skillId)!.name,
                category: skillRows.find((skillRow) => skillRow.id === row.skillId)!.category ?? undefined,
                createdAt: skillRows.find((skillRow) => skillRow.id === row.skillId)!.createdAt.toISOString(),
                updatedAt: skillRows.find((skillRow) => skillRow.id === row.skillId)!.updatedAt.toISOString()
              }
            : null
      })),
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

  async listApplicationPreparations(): Promise<ApplicationPreparationRecord[]> {
    const { user } = await this.ensureUserContext();
    const preparationRows = await this.db
      .select()
      .from(applicationPreparations)
      .where(eq(applicationPreparations.userId, user.id));

    const jobPostingIds = preparationRows.map((row) => row.jobPostingId);
    const preparationIds = preparationRows.map((row) => row.id);

    const [jobPostingRows, documentRows] = await Promise.all([
      jobPostingIds.length > 0
        ? this.db.select().from(jobPostings).where(inArray(jobPostings.id, jobPostingIds))
        : Promise.resolve([]),
      preparationIds.length > 0
        ? this.db
            .select()
            .from(applicationDocuments)
            .where(inArray(applicationDocuments.applicationPreparationId, preparationIds))
        : Promise.resolve([])
    ]);

    return preparationRows.map((row) => ({
      ...this.mapApplicationPreparation(row),
      jobPosting:
        jobPostingRows.find((jobPostingRow) => jobPostingRow.id === row.jobPostingId)
          ? this.mapJobPosting(jobPostingRows.find((jobPostingRow) => jobPostingRow.id === row.jobPostingId)!)
          : null,
      documents: documentRows
        .filter((documentRow) => documentRow.applicationPreparationId === row.id)
        .map((documentRow) => ({
          id: documentRow.id,
          applicationPreparationId: documentRow.applicationPreparationId,
          docType: documentRow.docType as "resume" | "cover_letter" | "email" | "note",
          content: documentRow.content,
          version: documentRow.version,
          status: documentRow.status,
          createdAt: documentRow.createdAt.toISOString(),
          updatedAt: documentRow.updatedAt.toISOString()
        }))
    }));
  }

  async createApplicationPreparation(
    input: CreateApplicationPreparationInput
  ): Promise<ApplicationPreparationRecord | ApplicationPreparation> {
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
      return this.mapApplicationPreparation(existing);
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
        strategyNote: input.strategyNote,
        targetResumeId: document?.id
      })
      .returning();

    return this.mapApplicationPreparation(row);
  }
}
