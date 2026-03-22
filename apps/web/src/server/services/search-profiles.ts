import { getCareerOSRepository } from "../repositories";

type CreateSearchProfileInput = {
  name: string;
  scheduleRule: string;
  priority?: number;
  filters?: Record<string, unknown>;
};

type UpdateSearchProfileInput = {
  id: string;
  name: string;
  scheduleRule: string;
  priority?: number;
  isActive: boolean;
  filters?: Record<string, unknown>;
};

export async function listSearchProfiles() {
  return await getCareerOSRepository().listSearchProfiles();
}

export async function createSearchProfile(input: CreateSearchProfileInput) {
  return await getCareerOSRepository().createSearchProfile(input);
}

export async function updateSearchProfile(input: UpdateSearchProfileInput) {
  return await getCareerOSRepository().updateSearchProfile(input);
}

export async function deleteSearchProfile(searchProfileId: string) {
  await getCareerOSRepository().deleteSearchProfile(searchProfileId);
}
