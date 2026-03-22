import { getCareerOSRepository } from "../repositories";

export function getCareerAssetSnapshot() {
  return getCareerOSRepository().getCareerAssetSnapshot();
}
