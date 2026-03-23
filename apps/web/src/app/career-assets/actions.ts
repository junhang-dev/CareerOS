"use server";

import { revalidatePath } from "next/cache";
import {
  createCareerDocument,
  deleteCareerDocument,
  updateCareerDocument
} from "../../server/services/career-assets";

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function parseStructuredJson(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return {};
  }

  const parsed = JSON.parse(normalized);
  return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
}

function revalidateCareerAssetViews() {
  revalidatePath("/career-assets");
  revalidatePath("/application-assistant");
}

export async function createCareerDocumentAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const docType = String(formData.get("docType") ?? "").trim() as
    | "resume"
    | "cover_letter"
    | "portfolio"
    | "note";
  const sourceType = String(formData.get("sourceType") ?? "").trim() as
    | "manual"
    | "upload"
    | "notion"
    | "linkedin"
    | "github";

  if (!title || !docType || !sourceType) {
    return;
  }

  let structured: Record<string, unknown>;

  try {
    structured = parseStructuredJson(formData.get("structuredJson"));
  } catch {
    return;
  }

  await createCareerDocument({
    title,
    docType,
    sourceType,
    storagePath: normalizeOptionalText(formData.get("storagePath")),
    parsedText: normalizeOptionalText(formData.get("parsedText")),
    structured
  });

  revalidateCareerAssetViews();
}

export async function updateCareerDocumentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const docType = String(formData.get("docType") ?? "").trim() as
    | "resume"
    | "cover_letter"
    | "portfolio"
    | "note";
  const sourceType = String(formData.get("sourceType") ?? "").trim() as
    | "manual"
    | "upload"
    | "notion"
    | "linkedin"
    | "github";

  if (!id || !title || !docType || !sourceType) {
    return;
  }

  let structured: Record<string, unknown>;

  try {
    structured = parseStructuredJson(formData.get("structuredJson"));
  } catch {
    return;
  }

  const versionValue = String(formData.get("version") ?? "").trim();

  await updateCareerDocument({
    id,
    title,
    docType,
    sourceType,
    storagePath: normalizeOptionalText(formData.get("storagePath")),
    parsedText: normalizeOptionalText(formData.get("parsedText")),
    structured,
    version: versionValue ? Number(versionValue) : undefined
  });

  revalidateCareerAssetViews();
}

export async function deleteCareerDocumentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await deleteCareerDocument(id);
  revalidateCareerAssetViews();
}
