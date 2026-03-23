import { getCareerOSRepository } from "../repositories";

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
