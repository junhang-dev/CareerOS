"use server";

import { revalidatePath } from "next/cache";
import { createJobPosting, updateJobPosting } from "../../server/services/job-postings";

function parseCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizePostedAt(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? new Date(`${normalized}T00:00:00.000Z`).toISOString() : undefined;
}

function revalidateJobPostingViews(jobPostingId?: string) {
  revalidatePath("/");
  revalidatePath("/job-postings");

  if (jobPostingId) {
    revalidatePath(`/job-postings/${jobPostingId}`);
  }
}

export async function createJobPostingAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!companyName || !title || !url) {
    return;
  }

  const detail = await createJobPosting({
    companyName,
    title,
    url,
    locationText: normalizeOptionalText(formData.get("locationText")),
    employmentType: normalizeOptionalText(formData.get("employmentType")),
    status:
      (normalizeOptionalText(formData.get("status")) as "active" | "closed" | "unknown" | undefined) ??
      "unknown",
    postedAt: normalizePostedAt(formData.get("postedAt")),
    sourceJobId: normalizeOptionalText(formData.get("sourceJobId")),
    initialVersion: {
      summary: normalizeOptionalText(formData.get("summary")),
      rawText: normalizeOptionalText(formData.get("rawText")),
      qualifications: parseCsv(formData.get("qualifications")),
      preferredQualifications: parseCsv(formData.get("preferredQualifications")),
      techStack: parseCsv(formData.get("techStack"))
    }
  });

  revalidateJobPostingViews(detail.jobPosting.id);
}

export async function updateJobPostingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "active" | "closed" | "unknown";

  if (!id || !companyName || !title || !url || !status) {
    return;
  }

  await updateJobPosting({
    id,
    companyName,
    title,
    url,
    locationText: normalizeOptionalText(formData.get("locationText")),
    employmentType: normalizeOptionalText(formData.get("employmentType")),
    status,
    postedAt: normalizePostedAt(formData.get("postedAt")),
    sourceJobId: normalizeOptionalText(formData.get("sourceJobId")),
    latestVersion: {
      summary: normalizeOptionalText(formData.get("summary")),
      rawText: normalizeOptionalText(formData.get("rawText")),
      qualifications: parseCsv(formData.get("qualifications")),
      preferredQualifications: parseCsv(formData.get("preferredQualifications")),
      techStack: parseCsv(formData.get("techStack"))
    }
  });

  revalidateJobPostingViews(id);
}
