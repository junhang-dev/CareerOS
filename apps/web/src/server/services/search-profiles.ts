import { getCareerOSRepository } from "../repositories";

type CreateSearchProfileInput = {
  name: string;
  scheduleRule: string;
  priority?: number;
  filters?: Record<string, unknown>;
};

export function listSearchProfiles() {
  return getCareerOSRepository().listSearchProfiles();
}

export function createSearchProfile(input: CreateSearchProfileInput) {
  return getCareerOSRepository().createSearchProfile(input);
}
