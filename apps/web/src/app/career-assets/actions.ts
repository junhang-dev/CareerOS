"use server";

import { revalidatePath } from "next/cache";
import {
  createCareerDocument,
  createCareerExperience,
  createCareerProject,
  deleteCareerDocument,
  deleteCareerExperience,
  deleteCareerProject,
  updateCareerDocument,
  updateCareerExperience,
  updateCareerProfile,
  updateCareerProject
} from "../../server/services/career-assets";
import {
  parseCareerDocumentCreateFormData,
  parseCareerDocumentUpdateFormData,
  parseCareerExperienceCreateFormData,
  parseCareerExperienceUpdateFormData,
  parseCareerProfilePatchFormData,
  parseCareerProjectCreateFormData,
  parseCareerProjectUpdateFormData
} from "../../server/services/career-assets-inputs";

function revalidateCareerAssetViews() {
  revalidatePath("/career-assets");
  revalidatePath("/application-assistant");
}

export async function updateCareerProfileAction(formData: FormData) {
  await updateCareerProfile(parseCareerProfilePatchFormData(formData));

  revalidateCareerAssetViews();
}

export async function createCareerExperienceAction(formData: FormData) {
  await createCareerExperience(parseCareerExperienceCreateFormData(formData));

  revalidateCareerAssetViews();
}

export async function updateCareerExperienceAction(formData: FormData) {
  await updateCareerExperience(parseCareerExperienceUpdateFormData(formData));

  revalidateCareerAssetViews();
}

export async function deleteCareerExperienceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("career experience id가 필요하다.");
  }

  await deleteCareerExperience(id);
  revalidateCareerAssetViews();
}

export async function createCareerProjectAction(formData: FormData) {
  await createCareerProject(parseCareerProjectCreateFormData(formData));

  revalidateCareerAssetViews();
}

export async function updateCareerProjectAction(formData: FormData) {
  await updateCareerProject(parseCareerProjectUpdateFormData(formData));

  revalidateCareerAssetViews();
}

export async function deleteCareerProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("career project id가 필요하다.");
  }

  await deleteCareerProject(id);
  revalidateCareerAssetViews();
}

export async function createCareerDocumentAction(formData: FormData) {
  await createCareerDocument(parseCareerDocumentCreateFormData(formData));

  revalidateCareerAssetViews();
}

export async function updateCareerDocumentAction(formData: FormData) {
  await updateCareerDocument(parseCareerDocumentUpdateFormData(formData));

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
