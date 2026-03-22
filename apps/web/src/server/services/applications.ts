import { getCareerOSRepository } from "../repositories";

type CreateApplicationPreparationInput = {
  jobPostingId: string;
  strategyNote?: string;
};

export function listApplicationPreparations() {
  return getCareerOSRepository().listApplicationPreparations();
}

export function createApplicationPreparation(input: CreateApplicationPreparationInput) {
  return getCareerOSRepository().createApplicationPreparation(input);
}
