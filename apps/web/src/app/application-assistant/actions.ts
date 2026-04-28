"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createApplicationPreparation,
  deleteApplicationPreparation,
  updateApplicationPreparation
} from "../../server/services/applications";
import { createJobPosting } from "../../server/services/job-postings";

const DATA_ANALYST_TERMS = [
  "SQL",
  "Python",
  "데이터 정제",
  "대시보드",
  "지표 정의",
  "실험",
  "가설",
  "커뮤니케이션",
  "비즈니스 임팩트"
];

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizeOptionalId(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeRequiredText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    throw new Error("필수 입력값이 비어 있다.");
  }

  return normalized;
}

function buildManualUrl(companyName: string, title: string) {
  const slug = `${companyName}-${title}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `https://manual.careeros.local/jobs/${encodeURIComponent(slug || "data-analyst")}`;
}

function extractTerms(rawText: string) {
  const normalized = rawText.toLowerCase();
  return DATA_ANALYST_TERMS.filter((term) => normalized.includes(term.toLowerCase()));
}

function revalidateApplicationViews(jobPostingId?: string) {
  revalidatePath("/application-assistant");

  if (jobPostingId) {
    revalidatePath(`/job-postings/${jobPostingId}`);
  }
}

export async function createApplicationPreparationAction(formData: FormData) {
  const jobPostingId = String(formData.get("jobPostingId") ?? "").trim();

  if (!jobPostingId) {
    return;
  }

  const preparation = await createApplicationPreparation({
    jobPostingId,
    strategyNote: normalizeOptionalText(formData.get("strategyNote"))
  });

  revalidateApplicationViews(jobPostingId);
  redirect(`/application-assistant?preparationId=${preparation.id}`);
}

export async function createManualApplicationPreparationAction(formData: FormData) {
  const companyName = normalizeRequiredText(formData.get("companyName"));
  const title = normalizeRequiredText(formData.get("title"));
  const rawText = normalizeRequiredText(formData.get("rawText"));
  const market = normalizeOptionalText(formData.get("market"));
  const matchedTerms = extractTerms(rawText);
  const detail = await createJobPosting({
    companyName,
    title,
    url: normalizeOptionalText(formData.get("url")) ?? buildManualUrl(companyName, title),
    locationText: normalizeOptionalText(formData.get("locationText")) ?? market,
    employmentType: normalizeOptionalText(formData.get("employmentType")),
    status: "active",
    sourceJobId: normalizeOptionalText(formData.get("sourceJobId")),
    initialVersion: {
      summary: `${market ? `${market} ` : ""}${title} JD 붙여넣기 기반 수동 공고`,
      rawText,
      qualifications: matchedTerms,
      preferredQualifications: [],
      techStack: matchedTerms.filter((term) => term === "SQL" || term === "Python")
    }
  });
  const preparation = await createApplicationPreparation({
    jobPostingId: detail.jobPosting.id,
    strategyNote: normalizeOptionalText(formData.get("strategyNote"))
  });

  revalidateApplicationViews(detail.jobPosting.id);
  revalidatePath("/job-postings");
  redirect(`/application-assistant?preparationId=${preparation.id}`);
}

export async function updateApplicationPreparationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as
    | "drafting"
    | "ready_for_review"
    | "approved"
    | "rejected"
    | "archived";
  const jobPostingId = String(formData.get("jobPostingId") ?? "").trim();

  if (!id || !status) {
    return;
  }

  await updateApplicationPreparation({
    id,
    status,
    strategyNote: normalizeOptionalText(formData.get("strategyNote")),
    approvalRequired: formData.get("approvalRequired") === "on",
    targetResumeId: normalizeOptionalId(formData.get("targetResumeId")),
    targetCoverLetterId: normalizeOptionalId(formData.get("targetCoverLetterId"))
  });

  revalidateApplicationViews(jobPostingId || undefined);
}

export async function deleteApplicationPreparationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const jobPostingId = String(formData.get("jobPostingId") ?? "").trim();

  if (!id) {
    return;
  }

  await deleteApplicationPreparation(id);
  revalidateApplicationViews(jobPostingId || undefined);
}
