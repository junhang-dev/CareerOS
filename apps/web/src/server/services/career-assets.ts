import { getCareerOSRepository } from "../repositories";

export async function getCareerAssetSnapshot() {
  return await getCareerOSRepository().getCareerAssetSnapshot();
}
