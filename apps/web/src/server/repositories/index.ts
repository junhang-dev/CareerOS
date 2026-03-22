import type { CareerOSRepository } from "./types";
import { InMemoryCareerOSRepository } from "./in-memory/career-os-repository";
import { PostgresCareerOSRepository } from "./postgres/career-os-repository";

let repository: CareerOSRepository | null = null;

export function getCareerOSRepository(): CareerOSRepository {
  if (repository) {
    return repository;
  }

  const driver = process.env.CAREEROS_DATA_DRIVER ?? "memory";

  repository =
    driver === "postgres" ? new PostgresCareerOSRepository() : new InMemoryCareerOSRepository();

  return repository;
}

