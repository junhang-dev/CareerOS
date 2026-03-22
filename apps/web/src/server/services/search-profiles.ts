import { getMockDatabase, cloneMockDatabase } from "../data/mock-state";

type CreateSearchProfileInput = {
  name: string;
  scheduleRule: string;
  priority?: number;
  filters?: Record<string, unknown>;
};

export function listSearchProfiles() {
  return cloneMockDatabase().searchProfiles.sort((left, right) => left.priority - right.priority);
}

export function createSearchProfile(input: CreateSearchProfileInput) {
  const db = getMockDatabase();

  const searchProfile = {
    id: crypto.randomUUID(),
    userId: db.user.id,
    name: input.name,
    isActive: true,
    scheduleRule: input.scheduleRule,
    priority: input.priority ?? 100,
    filters: input.filters ?? {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.searchProfiles.push(searchProfile);
  return searchProfile;
}

