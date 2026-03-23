"use server";

import { revalidatePath } from "next/cache";
import {
  createCareerExperience,
  createCareerDocument,
  createCareerProject,
  deleteCareerExperience,
  deleteCareerDocument,
  deleteCareerProject,
  updateCareerExperience,
  updateCareerDocument,
  updateCareerProfile,
  updateCareerProject
} from "../../server/services/career-assets";

function normalizeOptionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function parseCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeDateInput(value: FormDataEntryValue | null) {
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

export async function updateCareerProfileAction(formData: FormData) {
  await updateCareerProfile({
    headline: normalizeOptionalText(formData.get("headline")),
    bio: normalizeOptionalText(formData.get("bio")),
    yearsExperience: parseOptionalNumber(formData.get("yearsExperience")),
    targetRoles: parseCsv(formData.get("targetRoles"))
  });

  revalidateCareerAssetViews();
}

export async function createCareerExperienceAction(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();

  if (!company || !role || !startDate) {
    return;
  }

  await createCareerExperience({
    company,
    role,
    startDate,
    endDate: normalizeDateInput(formData.get("endDate")),
    description: normalizeOptionalText(formData.get("description")),
    achievements: parseCsv(formData.get("achievements"))
  });

  revalidateCareerAssetViews();
}

export async function updateCareerExperienceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();

  if (!id || !company || !role || !startDate) {
    return;
  }

  await updateCareerExperience({
    id,
    company,
    role,
    startDate,
    endDate: normalizeDateInput(formData.get("endDate")),
    description: normalizeOptionalText(formData.get("description")),
    achievements: parseCsv(formData.get("achievements"))
  });

  revalidateCareerAssetViews();
}

export async function deleteCareerExperienceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await deleteCareerExperience(id);
  revalidateCareerAssetViews();
}

export async function createCareerProjectAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return;
  }

  await createCareerProject({
    name,
    role: normalizeOptionalText(formData.get("role")),
    description: normalizeOptionalText(formData.get("description")),
    outcomes: parseCsv(formData.get("outcomes")),
    technologies: parseCsv(formData.get("technologies"))
  });

  revalidateCareerAssetViews();
}

export async function updateCareerProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !name) {
    return;
  }

  await updateCareerProject({
    id,
    name,
    role: normalizeOptionalText(formData.get("role")),
    description: normalizeOptionalText(formData.get("description")),
    outcomes: parseCsv(formData.get("outcomes")),
    technologies: parseCsv(formData.get("technologies"))
  });

  revalidateCareerAssetViews();
}

export async function deleteCareerProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await deleteCareerProject(id);
  revalidateCareerAssetViews();
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
