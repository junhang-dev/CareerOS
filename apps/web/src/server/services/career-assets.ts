import { getCareerOSRepository } from "../repositories";

type UpdateCareerProfileInput = {
  headline?: string;
  bio?: string;
  yearsExperience?: number;
  targetRoles?: string[];
};

type CreateCareerExperienceInput = {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
};

type UpdateCareerExperienceInput = CreateCareerExperienceInput & {
  id: string;
};

type CreateCareerProjectInput = {
  name: string;
  role?: string;
  description?: string;
  outcomes?: string[];
  technologies?: string[];
};

type UpdateCareerProjectInput = CreateCareerProjectInput & {
  id: string;
};

type CreateCareerDocumentInput = {
  docType: "resume" | "cover_letter" | "portfolio" | "note";
  title: string;
  sourceType: "manual" | "upload" | "notion" | "linkedin" | "github";
  storagePath?: string;
  parsedText?: string;
  structured?: Record<string, unknown>;
};

type UpdateCareerDocumentInput = CreateCareerDocumentInput & {
  id: string;
  version?: number;
};

export async function getCareerAssetSnapshot() {
  return await getCareerOSRepository().getCareerAssetSnapshot();
}

export async function updateCareerProfile(input: UpdateCareerProfileInput) {
  return await getCareerOSRepository().updateCareerProfile(input);
}

export async function createCareerExperience(input: CreateCareerExperienceInput) {
  return await getCareerOSRepository().createCareerExperience(input);
}

export async function updateCareerExperience(input: UpdateCareerExperienceInput) {
  return await getCareerOSRepository().updateCareerExperience(input);
}

export async function deleteCareerExperience(experienceId: string) {
  return await getCareerOSRepository().deleteCareerExperience(experienceId);
}

export async function createCareerProject(input: CreateCareerProjectInput) {
  return await getCareerOSRepository().createCareerProject(input);
}

export async function updateCareerProject(input: UpdateCareerProjectInput) {
  return await getCareerOSRepository().updateCareerProject(input);
}

export async function deleteCareerProject(projectId: string) {
  return await getCareerOSRepository().deleteCareerProject(projectId);
}

export async function listCareerDocuments() {
  return await getCareerOSRepository().listCareerDocuments();
}

export async function createCareerDocument(input: CreateCareerDocumentInput) {
  return await getCareerOSRepository().createCareerDocument(input);
}

export async function updateCareerDocument(input: UpdateCareerDocumentInput) {
  return await getCareerOSRepository().updateCareerDocument(input);
}

export async function deleteCareerDocument(documentId: string) {
  return await getCareerOSRepository().deleteCareerDocument(documentId);
}
