import type {
  CareerDocument,
  CareerProfile,
  JobPosting,
  JobPostingVersion,
  Skill,
  UserSkill
} from "@careeros/domain";

type AnalysisStubInput = {
  jobPosting: JobPosting;
  latestVersion: JobPostingVersion;
  documents: CareerDocument[];
  profile: CareerProfile;
  skills: Array<
    UserSkill & {
      skill: Skill | null;
    }
  >;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function includesToken(haystack: string, needle: string) {
  const normalizedHaystack = normalize(haystack);
  const normalizedNeedle = normalize(needle);

  return Boolean(normalizedNeedle) && normalizedHaystack.includes(normalizedNeedle);
}

export function buildStubAnalysis(input: AnalysisStubInput) {
  const qualifications = unique(input.latestVersion.jdStructured.qualifications ?? []);
  const techStack = unique(input.latestVersion.jdStructured.techStack ?? []);
  const preferredQualifications = unique(input.latestVersion.jdStructured.preferredQualifications ?? []);
  const requiredTerms = unique([...qualifications, ...techStack]);
  const userSkillNames = unique(input.skills.map((item) => item.skill?.name ?? "").filter(Boolean));
  const documentCorpus = normalize(
    input.documents
      .map((document) => `${document.title} ${document.parsedText ?? ""}`)
      .join(" ")
  );
  const targetRoleCorpus = normalize(input.profile.targetRoles.join(" "));
  const matchedSkills = requiredTerms.filter(
    (term) =>
      userSkillNames.some((skillName) => normalize(skillName) === normalize(term)) ||
      includesToken(documentCorpus, term)
  );
  const missingSkills = requiredTerms.filter((term) => !matchedSkills.includes(term));
  const resumeDocumentCount = input.documents.filter((document) => document.docType === "resume").length;
  const coverLetterDocumentCount = input.documents.filter(
    (document) => document.docType === "cover_letter"
  ).length;
  const titleMatchesTargetRole = input.profile.targetRoles.some((role) =>
    includesToken(input.jobPosting.title, role) || includesToken(role, input.jobPosting.title)
  );
  const requirementCount = requiredTerms.length || Math.max(1, preferredQualifications.length);
  const matchRatio = requirementCount > 0 ? matchedSkills.length / requirementCount : 0;
  const fitScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        35 +
          matchRatio * 45 +
          (resumeDocumentCount > 0 ? 10 : 0) +
          (coverLetterDocumentCount > 0 ? 5 : 0) +
          (titleMatchesTargetRole || includesToken(targetRoleCorpus, input.jobPosting.title) ? 5 : 0)
      )
    )
  );
  const riskNotes = missingSkills.slice(0, 3).map((skill) => `${skill} 근거가 현재 자산에 부족하다.`);

  if (resumeDocumentCount === 0) {
    riskNotes.push("이력서 자산이 아직 없다.");
  }

  if (coverLetterDocumentCount === 0) {
    riskNotes.push("커버레터 자산이 아직 없다.");
  }

  const experienceGaps = [];

  if (resumeDocumentCount === 0) {
    experienceGaps.push("이력서 자산이 아직 없다");
  }

  if (coverLetterDocumentCount === 0) {
    experienceGaps.push("커버레터 자산이 아직 없다");
  }

  if (!titleMatchesTargetRole) {
    experienceGaps.push("목표 역할과 공고 제목의 직접적인 연결 근거를 더 보강할 필요가 있다");
  }

  const recommendations = [
    ...missingSkills.slice(0, 2).map((skill) => `${skill} 관련 경험 근거를 자산에 추가한다.`),
    ...(resumeDocumentCount === 0 ? ["resume 문서를 먼저 추가한다."] : []),
    ...(coverLetterDocumentCount === 0 ? ["cover letter 문서를 준비한다."] : [])
  ];

  if (recommendations.length === 0) {
    recommendations.push("현재 자산을 기반으로 지원 준비 초안을 생성한다.");
  }

  const confidence = Math.max(
    0.55,
    Math.min(0.85, Number((0.55 + matchRatio * 0.2 + (resumeDocumentCount > 0 ? 0.05 : 0)).toFixed(2)))
  );
  const summary = `${input.jobPosting.companyName}의 ${input.jobPosting.title} 공고는 핵심 요건 ${requirementCount}개 중 ${matchedSkills.length}개가 현재 자산과 직접 연결된다.`;

  return {
    summary,
    fitScore,
    keyRequirements: {
      top: qualifications.slice(0, 3)
    },
    riskNotes: {
      items: riskNotes
    },
    fitReason: {
      matchedSkills,
      evidenceSources: input.documents.map((document) => document.title).slice(0, 5),
      targetRoles: input.profile.targetRoles
    },
    gapSummary:
      missingSkills.length > 0
        ? `${missingSkills.slice(0, 2).join(", ")} 보강이 우선이다.`
        : "현재 자산과 공고 요건이 비교적 잘 맞는다.",
    matchedSkills,
    missingSkills,
    experienceGaps,
    recommendations,
    confidence,
    metadata: {
      source: "stub",
      triggeredBy: "manual",
      version: "mvp-stub-v1"
    }
  };
}
