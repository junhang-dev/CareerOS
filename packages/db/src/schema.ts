import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const remotePreferenceEnum = pgEnum("remote_preference", [
  "onsite",
  "hybrid",
  "remote",
  "flexible"
]);

export const postingStatusEnum = pgEnum("posting_status", ["active", "closed", "unknown"]);
export const applicationStatusEnum = pgEnum("application_status", [
  "drafting",
  "ready_for_review",
  "approved",
  "rejected",
  "archived"
]);
export const applicationDocumentStatusEnum = pgEnum("application_document_status", [
  "draft",
  "reviewed",
  "approved",
  "superseded"
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Seoul"),
  locale: text("locale").notNull().default("ko-KR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  jobRegions: text("job_regions").array().notNull().default([]),
  jobTypes: text("job_types").array().notNull().default([]),
  industries: text("industries").array().notNull().default([]),
  seniorityLevels: text("seniority_levels").array().notNull().default([]),
  salaryMin: integer("salary_min"),
  remotePreference: remotePreferenceEnum("remote_preference"),
  visaSupportNeeded: boolean("visa_support_needed").notNull().default(false),
  keywordsInclude: text("keywords_include").array().notNull().default([]),
  keywordsExclude: text("keywords_exclude").array().notNull().default([]),
  companyTypes: text("company_types").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const searchProfiles = pgTable("search_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  scheduleRule: text("schedule_rule").notNull(),
  priority: integer("priority").notNull().default(100),
  filtersJson: jsonb("filters_json").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const jobPostings = pgTable(
  "job_postings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    canonicalKey: text("canonical_key").notNull(),
    sourceId: uuid("source_id").notNull(),
    sourceJobId: text("source_job_id"),
    url: text("url").notNull(),
    companyName: text("company_name").notNull(),
    title: text("title").notNull(),
    locationText: text("location_text"),
    employmentType: text("employment_type"),
    status: postingStatusEnum("status").notNull().default("unknown"),
    postedAt: timestamp("posted_at", { withTimezone: true }),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    canonicalKeyUnique: uniqueIndex("job_postings_canonical_key_unique").on(table.canonicalKey)
  })
);

export const jobPostingVersions = pgTable("job_posting_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobPostingId: uuid("job_posting_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" }),
  contentHash: text("content_hash").notNull(),
  rawHtmlPath: text("raw_html_path"),
  rawText: text("raw_text"),
  jdStructuredJson: jsonb("jd_structured_json").notNull().default({}),
  requirementsJson: jsonb("requirements_json").notNull().default({}),
  preferredJson: jsonb("preferred_json").notNull().default({}),
  compensationJson: jsonb("compensation_json").notNull().default({}),
  metadataJson: jsonb("metadata_json").notNull().default({}),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const jobAnalyses = pgTable("job_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobPostingId: uuid("job_posting_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" }),
  analysisVersion: text("analysis_version").notNull(),
  summary: text("summary").notNull(),
  keyRequirementsJson: jsonb("key_requirements_json").notNull().default({}),
  riskNotesJson: jsonb("risk_notes_json").notNull().default({}),
  fitScore: integer("fit_score"),
  fitReasonJson: jsonb("fit_reason_json").notNull().default({}),
  gapSummary: text("gap_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const careerProfiles = pgTable("career_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: text("headline"),
  bio: text("bio"),
  yearsExperience: integer("years_experience"),
  targetRolesJson: jsonb("target_roles_json").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const careerExperiences = pgTable("career_experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerProfileId: uuid("career_profile_id")
    .notNull()
    .references(() => careerProfiles.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  description: text("description"),
  achievementsJson: jsonb("achievements_json").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const careerProjects = pgTable("career_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  careerProfileId: uuid("career_profile_id")
    .notNull()
    .references(() => careerProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  description: text("description"),
  outcomesJson: jsonb("outcomes_json").notNull().default([]),
  technologiesJson: jsonb("technologies_json").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const careerDocuments = pgTable("career_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull(),
  title: text("title").notNull(),
  storagePath: text("storage_path"),
  sourceType: text("source_type").notNull(),
  parsedText: text("parsed_text"),
  structuredJson: jsonb("structured_json").notNull().default({}),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const userSkills = pgTable("user_skills", {
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
  proficiency: integer("proficiency"),
  evidenceCount: integer("evidence_count").notNull().default(0),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const externalAccounts = pgTable("external_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accountRef: text("account_ref").notNull(),
  status: text("status").notNull().default("pending"),
  metadataJson: jsonb("metadata_json").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const gapAnalyses = pgTable("gap_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  jobPostingId: uuid("job_posting_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  matchedSkillsJson: jsonb("matched_skills_json").notNull().default([]),
  missingSkillsJson: jsonb("missing_skills_json").notNull().default([]),
  experienceGapsJson: jsonb("experience_gaps_json").notNull().default([]),
  recommendationsJson: jsonb("recommendations_json").notNull().default([]),
  confidence: integer("confidence"),
  metadataJson: jsonb("metadata_json").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const applicationPreparations = pgTable("application_preparations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jobPostingId: uuid("job_posting_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").notNull().default("drafting"),
  strategyNote: text("strategy_note"),
  targetResumeId: uuid("target_resume_id"),
  targetCoverLetterId: uuid("target_cover_letter_id"),
  approvalRequired: boolean("approval_required").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const applicationDocuments = pgTable("application_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicationPreparationId: uuid("application_preparation_id")
    .notNull()
    .references(() => applicationPreparations.id, { onDelete: "cascade" }),
  docType: text("doc_type").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  status: applicationDocumentStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
