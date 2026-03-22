import { cloneMockDatabase } from "../data/mock-state";

export function getCareerAssetSnapshot() {
  const db = cloneMockDatabase();

  return {
    user: db.user,
    profile: db.careerProfile,
    experiences: db.careerExperiences,
    projects: db.careerProjects,
    documents: db.careerDocuments,
    skills: db.userSkills.map((userSkill) => ({
      ...userSkill,
      skill: db.skills.find((skill) => skill.id === userSkill.skillId) ?? null
    })),
    externalAccounts: db.externalAccounts
  };
}

