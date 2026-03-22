import type { CareerOSRepository } from "./types";
import { InMemoryCareerOSRepository } from "./in-memory/career-os-repository";
import { PostgresCareerOSRepository } from "./postgres/career-os-repository";

const repositories = new Map<string, CareerOSRepository>();

export function getCareerOSRepository(): CareerOSRepository {
  const driver = process.env.CAREEROS_DATA_DRIVER ?? "memory";
  const existing = repositories.get(driver);

  if (existing) {
    return existing;
  }

  const repository =
    driver === "postgres" ? new PostgresCareerOSRepository() : new InMemoryCareerOSRepository();

  repositories.set(driver, repository);
  return repository;
}
