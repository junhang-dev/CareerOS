CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE remote_preference AS ENUM ('onsite', 'hybrid', 'remote', 'flexible');
CREATE TYPE external_provider AS ENUM ('github', 'linkedin', 'notion');
CREATE TYPE source_type AS ENUM ('site', 'rss', 'api', 'manual');
CREATE TYPE posting_status AS ENUM ('active', 'closed', 'unknown');
CREATE TYPE asset_type AS ENUM ('pdf', 'doc', 'link', 'image');
CREATE TYPE account_status AS ENUM ('connected', 'disconnected', 'error', 'pending');
CREATE TYPE application_status AS ENUM ('drafting', 'ready_for_review', 'approved', 'rejected', 'archived');
CREATE TYPE application_document_status AS ENUM ('draft', 'reviewed', 'approved', 'superseded');
CREATE TYPE application_action_type AS ENUM ('create', 'review', 'approve', 'reject', 'submit_attempt');
CREATE TYPE actor_type AS ENUM ('user', 'agent', 'system');
CREATE TYPE agent_task_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TYPE run_status AS ENUM ('queued', 'running', 'completed', 'failed');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  locale TEXT NOT NULL DEFAULT 'ko-KR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  job_regions TEXT[] NOT NULL DEFAULT '{}',
  job_types TEXT[] NOT NULL DEFAULT '{}',
  industries TEXT[] NOT NULL DEFAULT '{}',
  seniority_levels TEXT[] NOT NULL DEFAULT '{}',
  salary_min INTEGER,
  remote_preference remote_preference,
  visa_support_needed BOOLEAN NOT NULL DEFAULT FALSE,
  keywords_include TEXT[] NOT NULL DEFAULT '{}',
  keywords_exclude TEXT[] NOT NULL DEFAULT '{}',
  company_types TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE search_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  schedule_rule TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  filters_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type source_type NOT NULL,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_source_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_source_id UUID NOT NULL REFERENCES job_sources(id) ON DELETE CASCADE,
  parser_version TEXT NOT NULL,
  access_policy_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  rate_limit_policy_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  country TEXT,
  industry TEXT,
  size_range TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_key TEXT NOT NULL UNIQUE,
  source_id UUID NOT NULL REFERENCES job_sources(id) ON DELETE RESTRICT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  source_job_id TEXT,
  url TEXT NOT NULL,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  location_text TEXT,
  employment_type TEXT,
  status posting_status NOT NULL DEFAULT 'unknown',
  posted_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX job_postings_source_unique
  ON job_postings(source_id, source_job_id)
  WHERE source_job_id IS NOT NULL;

CREATE TABLE job_posting_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  content_hash TEXT NOT NULL,
  raw_html_path TEXT,
  raw_text TEXT,
  jd_structured_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferred_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  compensation_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX job_posting_versions_unique_hash
  ON job_posting_versions(job_posting_id, content_hash);

CREATE TABLE job_posting_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  url TEXT NOT NULL,
  file_path TEXT,
  parsed_text TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_dedup_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedup_key TEXT NOT NULL UNIQUE,
  confidence NUMERIC(5, 4) NOT NULL,
  primary_job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_dedup_group_members (
  dedup_group_id UUID NOT NULL REFERENCES job_dedup_groups(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (dedup_group_id, job_posting_id)
);

CREATE TABLE job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  analysis_version TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_requirements_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_notes_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  fit_score NUMERIC(5, 2),
  fit_reason_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  gap_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_company_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  culture_notes TEXT,
  industry_context TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE career_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  years_experience INTEGER,
  target_roles_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE career_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_profile_id UUID NOT NULL REFERENCES career_profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  achievements_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE career_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_profile_id UUID NOT NULL REFERENCES career_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  description TEXT,
  outcomes_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_skills (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE career_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  storage_path TEXT,
  source_type TEXT NOT NULL,
  parsed_text TEXT,
  structured_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE external_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider external_provider NOT NULL,
  account_ref TEXT NOT NULL,
  status account_status NOT NULL DEFAULT 'pending',
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, provider, account_ref)
);

CREATE TABLE secret_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_account_id UUID NOT NULL REFERENCES external_accounts(id) ON DELETE CASCADE,
  secret_reference TEXT NOT NULL,
  secret_material_encrypted BYTEA,
  last_validated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_skills_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  missing_skills_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience_gaps_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence NUMERIC(5, 4),
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE application_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'drafting',
  strategy_note TEXT,
  target_resume_id UUID REFERENCES career_documents(id) ON DELETE SET NULL,
  target_cover_letter_id UUID REFERENCES career_documents(id) ON DELETE SET NULL,
  approval_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, job_posting_id)
);

CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_preparation_id UUID NOT NULL REFERENCES application_preparations(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status application_document_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_preparation_id, doc_type, version)
);

CREATE TABLE application_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_preparation_id UUID NOT NULL REFERENCES application_preparations(id) ON DELETE CASCADE,
  action_type application_action_type NOT NULL,
  actor_type actor_type NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_profile_id UUID REFERENCES search_profiles(id) ON DELETE SET NULL,
  status run_status NOT NULL DEFAULT 'queued',
  summary TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  status run_status NOT NULL DEFAULT 'queued',
  run_type TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL,
  queue_name TEXT NOT NULL,
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status agent_task_status NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type actor_type NOT NULL,
  actor_id UUID,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX search_profiles_user_idx ON search_profiles(user_id);
CREATE INDEX job_postings_source_idx ON job_postings(source_id);
CREATE INDEX job_postings_company_idx ON job_postings(company_id);
CREATE INDEX job_posting_versions_posting_idx ON job_posting_versions(job_posting_id, captured_at DESC);
CREATE INDEX job_posting_assets_posting_idx ON job_posting_assets(job_posting_id);
CREATE INDEX career_profiles_user_idx ON career_profiles(user_id);
CREATE INDEX career_documents_user_idx ON career_documents(user_id);
CREATE INDEX gap_analyses_job_user_idx ON gap_analyses(job_posting_id, user_id);
CREATE INDEX application_preparations_user_idx ON application_preparations(user_id);
CREATE INDEX application_actions_preparation_idx ON application_actions(application_preparation_id, created_at DESC);
CREATE INDEX audit_logs_resource_idx ON audit_logs(resource_type, resource_id, created_at DESC);

-- TODO:
-- 1. 다국어 원문/번역본 분리 컬럼 또는 별도 테이블 여부를 결정한다.
-- 2. secret_credentials는 추후 Vault/KMS 참조 방식으로 교체할 수 있다.
-- 3. source adapter별 세부 파싱 품질 로그 테이블 추가를 검토한다.

