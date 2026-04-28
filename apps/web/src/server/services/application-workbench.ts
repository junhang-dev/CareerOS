import type {
  CareerDocument,
  CareerExperience,
  CareerProfile,
  CareerProject,
  JobPosting,
  JobPostingVersion,
  Skill,
  UserSkill
} from "@careeros/domain";

export type MarketPerspective = "domestic" | "global";
export type TargetTrack = "data_analyst_transition";

export type ApplicationWorkbenchInput = {
  profile: CareerProfile;
  experiences: CareerExperience[];
  projects: CareerProject[];
  documents: CareerDocument[];
  skills: Array<
    UserSkill & {
      skill: Skill | null;
    }
  >;
  jobPosting?: JobPosting | null;
  latestVersion?: JobPostingVersion | null;
  rawText?: string;
  market?: MarketPerspective;
  targetTrack?: TargetTrack;
};

export type ApplicationWorkbenchResult = {
  targetTrack: TargetTrack;
  positioning: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  commonStrengths: string[];
  risks: string[];
  nextActions: string[];
  domesticStrategy: string[];
  globalStrategy: string[];
  koreanBullets: string[];
  englishBullets: string[];
};

const DATA_ANALYST_KEYWORDS = [
  "SQL",
  "Python",
  "데이터 정제",
  "대시보드",
  "지표 정의",
  "실험",
  "가설",
  "커뮤니케이션",
  "비즈니스 임팩트"
];

const KEYWORD_ALIASES: Record<string, string[]> = {
  SQL: ["sql", "postgresql", "mysql", "query", "쿼리"],
  Python: ["python", "pandas", "numpy", "파이썬"],
  "데이터 정제": ["데이터 정제", "data cleaning", "etl", "pipeline", "파이프라인", "전처리"],
  대시보드: ["대시보드", "dashboard", "tableau", "looker", "power bi", "bi"],
  "지표 정의": ["지표", "metric", "kpi", "measurement"],
  실험: ["실험", "experiment", "a/b", "ab test", "테스트"],
  가설: ["가설", "hypothesis", "검증"],
  커뮤니케이션: ["커뮤니케이션", "communication", "stakeholder", "협업", "문서화"],
  "비즈니스 임팩트": ["비즈니스", "impact", "매출", "전환", "효율", "개선", "%"]
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function compact(values: Array<string | undefined | null>) {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function includesAny(corpus: string, values: string[]) {
  const normalizedCorpus = normalize(corpus);
  return values.some((value) => normalizedCorpus.includes(normalize(value)));
}

function getJobText(input: ApplicationWorkbenchInput) {
  const structured = input.latestVersion?.jdStructured;

  return compact([
    input.jobPosting?.companyName,
    input.jobPosting?.title,
    input.jobPosting?.locationText,
    structured?.summary,
    ...(structured?.qualifications ?? []),
    ...(structured?.preferredQualifications ?? []),
    ...(structured?.techStack ?? []),
    input.latestVersion?.rawText,
    input.rawText
  ]).join(" ");
}

function getAssetText(input: ApplicationWorkbenchInput) {
  return compact([
    input.profile.headline,
    input.profile.bio,
    ...input.profile.targetRoles,
    ...input.experiences.flatMap((item) => [
      item.company,
      item.role,
      item.description,
      ...item.achievements
    ]),
    ...input.projects.flatMap((item) => [
      item.name,
      item.role,
      item.description,
      ...item.outcomes,
      ...item.technologies
    ]),
    ...input.documents.flatMap((item) => [item.title, item.parsedText]),
    ...input.skills.map((item) => item.skill?.name)
  ]).join(" ");
}

function matchDataAnalystKeywords(corpus: string) {
  return DATA_ANALYST_KEYWORDS.filter((keyword) =>
    includesAny(corpus, [keyword, ...(KEYWORD_ALIASES[keyword] ?? [])])
  );
}

function pickPrimaryExperience(input: ApplicationWorkbenchInput) {
  return input.experiences[0];
}

function pickPrimaryProject(input: ApplicationWorkbenchInput) {
  return input.projects[0];
}

function buildRoleTitle(input: ApplicationWorkbenchInput) {
  return input.jobPosting?.title ?? "Data Analyst";
}

function buildCompanyName(input: ApplicationWorkbenchInput) {
  return input.jobPosting?.companyName ?? "지원 기업";
}

function buildStrengths(input: ApplicationWorkbenchInput, assetMatches: string[]) {
  const strengths = [
    input.profile.headline ? `${input.profile.headline} 포지셔닝` : undefined,
    assetMatches.includes("SQL") ? "SQL/데이터 모델링 관점으로 문제를 구조화할 수 있음" : undefined,
    assetMatches.includes("비즈니스 임팩트")
      ? "성과와 운영 개선을 비즈니스 임팩트로 설명할 수 있음"
      : undefined,
    input.documents.some((document) => document.docType === "resume")
      ? "기존 이력서 자산을 기반으로 빠르게 맞춤화 가능"
      : undefined,
    input.projects.length > 0 ? "프로젝트 경험을 분석 포트폴리오 근거로 전환 가능" : undefined,
    input.experiences.length > 0 ? "실무 경험을 데이터 분석 문제 해결 사례로 번역 가능" : undefined
  ];

  return unique(compact(strengths)).slice(0, 5);
}

function buildRisks(input: ApplicationWorkbenchInput, missingKeywords: string[]) {
  const risks = [
    ...missingKeywords.slice(0, 3).map((keyword) => `${keyword} 근거가 현재 자산에서 약하다.`),
    input.documents.some((document) => document.docType === "resume")
      ? undefined
      : "resume/경력기술서 문서 자산이 없어 문서 맞춤화 근거가 부족하다.",
    input.projects.length > 0 ? undefined : "데이터 분석 포트폴리오로 보여줄 프로젝트가 부족하다.",
    input.experiences.length > 0 ? undefined : "실무 경력 맥락이 부족해 bullet이 일반적으로 보일 수 있다."
  ];

  return unique(compact(risks)).slice(0, 5);
}

function buildNextActions(missingKeywords: string[]) {
  const keywordActions = missingKeywords.slice(0, 3).map((keyword) => {
    if (keyword === "SQL") {
      return "지원 전 SQL 쿼리 예시와 분석 문제 해결 사례를 1개 정리한다.";
    }

    if (keyword === "Python") {
      return "Python/Pandas 기반 데이터 정제 또는 EDA 미니 프로젝트를 포트폴리오에 추가한다.";
    }

    if (keyword === "대시보드") {
      return "핵심 지표를 보여주는 대시보드 캡처나 링크를 준비한다.";
    }

    return `${keyword}를 보여줄 수 있는 경험 문장 또는 보완 프로젝트를 추가한다.`;
  });

  return unique([
    ...keywordActions,
    "국문 경력기술서는 성과-행동-도구 순서로 bullet을 다듬는다.",
    "영문 resume는 action verb, metric, tool keyword가 보이도록 압축한다."
  ]).slice(0, 5);
}

function buildDomesticStrategy(input: ApplicationWorkbenchInput, matchedKeywords: string[]) {
  return [
    `${buildCompanyName(input)}의 ${buildRoleTitle(input)} 지원에서는 데이터분석가 전환 동기보다 문제 해결 경험을 먼저 배치한다.`,
    `국문 경력기술서는 ${matchedKeywords.slice(0, 3).join(", ") || "SQL, 지표, 커뮤니케이션"} 근거를 성과 중심으로 묶는다.`,
    "직무 경험이 직접 일치하지 않는 부분은 운영 개선, 자동화, 문서화, 의사결정 지원 경험으로 연결한다.",
    "각 bullet은 상황보다 결과를 먼저 쓰고, 가능하면 수치나 비교 기준을 붙인다."
  ];
}

function buildGlobalStrategy(input: ApplicationWorkbenchInput, matchedKeywords: string[]) {
  return [
    `For ${buildRoleTitle(input)}, lead with transferable analytics impact rather than a career-change explanation.`,
    `Prioritize ATS keywords such as ${matchedKeywords.slice(0, 4).join(", ") || "SQL, Python, metrics, dashboards"}.`,
    "Use concise bullets with action verb, data/tool keyword, business outcome, and collaboration context.",
    "Keep riskier transition context in the summary and let project/evidence bullets carry the proof."
  ];
}

function buildKoreanBullets(input: ApplicationWorkbenchInput, matchedKeywords: string[]) {
  const experience = pickPrimaryExperience(input);
  const project = pickPrimaryProject(input);
  const role = experience?.role ?? "실무 경험";
  const company = experience?.company ?? "이전 조직";
  const projectName = project?.name ?? "분석 포트폴리오";
  const tools = unique([
    ...matchedKeywords.filter((keyword) => ["SQL", "Python", "대시보드"].includes(keyword)),
    ...(project?.technologies ?? [])
  ]).slice(0, 4);

  return [
    `${company}에서 ${role}로 일하며 운영/제품 데이터를 구조화하고 의사결정에 필요한 핵심 지표를 정리했다.`,
    `${tools.join(", ") || "SQL, Python, 대시보드"}를 활용해 데이터 추출-정제-요약 흐름을 만들고 반복 업무의 재사용성을 높였다.`,
    `${projectName}에서 문제 정의, 가설 수립, 결과 요약까지 연결해 데이터 분석가 역할에 필요한 end-to-end 사고를 보여줬다.`,
    "비개발/비분석 이해관계자도 사용할 수 있도록 분석 결과를 문서와 시각 자료로 정리해 커뮤니케이션 비용을 낮췄다."
  ];
}

function buildEnglishBullets(input: ApplicationWorkbenchInput, matchedKeywords: string[]) {
  const experience = pickPrimaryExperience(input);
  const project = pickPrimaryProject(input);
  const company = experience?.company ?? "previous team";
  const tools = unique([
    ...matchedKeywords.filter((keyword) => ["sql", "python", "대시보드"].includes(normalize(keyword))),
    ...(project?.technologies ?? [])
  ]).slice(0, 4);

  return [
    `Translated operational and product context at ${company} into structured metrics and analysis-ready datasets.`,
    `Built reusable data workflows using ${tools.join(", ") || "SQL, Python, and dashboarding tools"} to support faster decision-making.`,
    "Framed ambiguous business questions into hypotheses, analysis steps, and concise recommendations for stakeholders.",
    "Documented findings and trade-offs clearly, improving cross-functional communication around data-informed decisions."
  ];
}

export function buildApplicationWorkbenchResult(
  input: ApplicationWorkbenchInput
): ApplicationWorkbenchResult {
  const targetTrack = input.targetTrack ?? "data_analyst_transition";
  const jobText = getJobText(input);
  const assetText = getAssetText(input);
  const jobMatches = matchDataAnalystKeywords(jobText);
  const assetMatches = matchDataAnalystKeywords(assetText);
  const matchedKeywords = unique([...jobMatches, ...assetMatches]);
  const missingKeywords = DATA_ANALYST_KEYWORDS.filter((keyword) => !assetMatches.includes(keyword));
  const commonStrengths = buildStrengths(input, assetMatches);
  const risks = buildRisks(input, missingKeywords);

  return {
    targetTrack,
    positioning: `${buildCompanyName(input)} ${buildRoleTitle(input)} 지원은 현재 경력의 문제 해결 경험을 데이터 분석가의 지표 정의, 데이터 정제, 커뮤니케이션 역량으로 번역하는 방향이 좋다.`,
    matchedKeywords,
    missingKeywords,
    commonStrengths,
    risks,
    nextActions: buildNextActions(missingKeywords),
    domesticStrategy: buildDomesticStrategy(input, matchedKeywords),
    globalStrategy: buildGlobalStrategy(input, matchedKeywords),
    koreanBullets: buildKoreanBullets(input, matchedKeywords),
    englishBullets: buildEnglishBullets(input, matchedKeywords)
  };
}
