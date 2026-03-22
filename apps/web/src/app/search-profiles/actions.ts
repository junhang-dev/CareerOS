"use server";

import { revalidatePath } from "next/cache";
import {
  createSearchProfile,
  deleteSearchProfile,
  updateSearchProfile
} from "../../server/services/search-profiles";

function parseCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFilters(formData: FormData) {
  const remote = String(formData.get("remote") ?? "").trim();
  const countries = parseCsv(formData.get("countries"));
  const keywords = parseCsv(formData.get("keywords"));
  const excludeKeywords = parseCsv(formData.get("excludeKeywords"));

  return {
    countries,
    keywords,
    excludeKeywords,
    ...(remote ? { remote } : {})
  };
}

function revalidateSearchProfileViews() {
  revalidatePath("/");
  revalidatePath("/search-profiles");
}

export async function createSearchProfileAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const scheduleRule = String(formData.get("scheduleRule") ?? "").trim();

  if (!name || !scheduleRule) {
    return;
  }

  await createSearchProfile({
    name,
    scheduleRule,
    priority: Number(formData.get("priority") ?? 100),
    filters: buildFilters(formData)
  });

  revalidateSearchProfileViews();
}

export async function updateSearchProfileAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const scheduleRule = String(formData.get("scheduleRule") ?? "").trim();

  if (!id || !name || !scheduleRule) {
    return;
  }

  await updateSearchProfile({
    id,
    name,
    scheduleRule,
    priority: Number(formData.get("priority") ?? 100),
    isActive: formData.get("isActive") === "on",
    filters: buildFilters(formData)
  });

  revalidateSearchProfileViews();
}

export async function deleteSearchProfileAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await deleteSearchProfile(id);
  revalidateSearchProfileViews();
}

