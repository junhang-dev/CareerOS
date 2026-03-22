import type {
  ApplicationPreparationRecord,
  CareerAssetSnapshot,
  CareerOSRepository,
  CreateApplicationPreparationInput,
  CreateSearchProfileInput,
  JobPostingDetailRecord,
  JobPostingListItem,
  RepositorySnapshot,
  SearchProfileRecord
} from "../types";

function notImplemented(): never {
  throw new Error(
    "PostgreSQL repository is not wired yet. Implement the query layer before enabling CAREEROS_DATA_DRIVER=postgres."
  );
}

export class PostgresCareerOSRepository implements CareerOSRepository {
  getSnapshot(): RepositorySnapshot {
    return notImplemented();
  }

  listSearchProfiles(): SearchProfileRecord[] {
    return notImplemented();
  }

  createSearchProfile(_: CreateSearchProfileInput): SearchProfileRecord {
    return notImplemented();
  }

  listJobPostings(): JobPostingListItem[] {
    return notImplemented();
  }

  getJobPostingDetail(_: string): JobPostingDetailRecord | null {
    return notImplemented();
  }

  getCareerAssetSnapshot(): CareerAssetSnapshot {
    return notImplemented();
  }

  listApplicationPreparations(): ApplicationPreparationRecord[] {
    return notImplemented();
  }

  createApplicationPreparation(_: CreateApplicationPreparationInput): ApplicationPreparationRecord {
    return notImplemented();
  }
}

