import { getCareerOSRepository } from "../repositories";

type CreateApplicationPreparationInput = {
  jobPostingId: string;
  strategyNote?: string;
};

export async function listApplicationPreparations() {
  return await getCareerOSRepository().listApplicationPreparations();
}

export async function createApplicationPreparation(input: CreateApplicationPreparationInput) {
  return await getCareerOSRepository().createApplicationPreparation(input);
}
