"use server";

import { revalidatePath } from "next/cache";
import {
  createApplicationPreparation,
  deleteApplicationPreparation,
  updateApplicationPreparation
} from "../../server/services/applications";

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function normalizeOptionalId(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
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

  await createApplicationPreparation({
    jobPostingId,
    strategyNote: normalizeOptionalText(formData.get("strategyNote"))
  });

  revalidateApplicationViews(jobPostingId);
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
