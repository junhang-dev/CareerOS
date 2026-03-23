import { getCareerOSRepository } from "../repositories";

type CreateApplicationPreparationInput = {
  jobPostingId: string;
  strategyNote?: string;
};

type UpdateApplicationPreparationInput = {
  id: string;
  status: "drafting" | "ready_for_review" | "approved" | "rejected" | "archived";
  strategyNote?: string;
  approvalRequired: boolean;
  targetResumeId?: string | null;
  targetCoverLetterId?: string | null;
};

export async function listApplicationPreparations() {
  return await getCareerOSRepository().listApplicationPreparations();
}

export async function createApplicationPreparation(input: CreateApplicationPreparationInput) {
  return await getCareerOSRepository().createApplicationPreparation(input);
}

export async function updateApplicationPreparation(input: UpdateApplicationPreparationInput) {
  return await getCareerOSRepository().updateApplicationPreparation(input);
}

export async function deleteApplicationPreparation(applicationPreparationId: string) {
  return await getCareerOSRepository().deleteApplicationPreparation(applicationPreparationId);
}
