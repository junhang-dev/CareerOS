import {
  createApplicationPreparationAction,
  createManualApplicationPreparationAction,
  deleteApplicationPreparationAction,
  updateApplicationPreparationAction
} from "./actions";
import { PageIntro } from "../../components/page-intro";
import { getCareerAssetSnapshot } from "../../server/services/career-assets";
import { listApplicationPreparations } from "../../server/services/applications";
import { getJobPostingDetail, listJobPostings } from "../../server/services/job-postings";
import { buildApplicationWorkbenchResult } from "../../server/services/application-workbench";

type ApplicationAssistantPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

function formatPreviewList(values: string[]) {
  return values.map((item) => `- ${item}`).join("\n");
}

function PreviewField({
  label,
  values,
  rows = 6
}: {
  label: string;
  values: string[];
  rows?: number;
}) {
  return (
    <label className="field field--full">
      <span>{label}</span>
      <textarea className="preview-textarea" readOnly rows={rows} value={formatPreviewList(values)} />
    </label>
  );
}

export default async function ApplicationAssistantPage({
  searchParams
}: ApplicationAssistantPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedPreparationId = getSearchParam(resolvedSearchParams, "preparationId");
  const [preparations, assets, jobPostings] = await Promise.all([
    listApplicationPreparations(),
    getCareerAssetSnapshot(),
    listJobPostings()
  ]);
  const activePreparation =
    preparations.find((item) => item.id === selectedPreparationId) ?? preparations[0] ?? null;
  const activeDetail = activePreparation
    ? await getJobPostingDetail(activePreparation.jobPostingId)
    : null;
  const latestVersion = activeDetail?.versions[0] ?? null;
  const workbenchResult =
    activeDetail && activePreparation
      ? buildApplicationWorkbenchResult({
          profile: assets.profile,
          experiences: assets.experiences,
          projects: assets.projects,
          documents: assets.documents,
          skills: assets.skills,
          jobPosting: activeDetail.jobPosting,
          latestVersion,
          rawText: latestVersion?.rawText,
          targetTrack: "data_analyst_transition"
        })
      : null;
  const resumeDocuments = assets.documents.filter((document) => document.docType === "resume");
  const coverLetterDocuments = assets.documents.filter((document) => document.docType === "cover_letter");

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Application Workbench"
        title="지원 맞춤 워크벤치"
        description="국내/해외 데이터분석가 주니어·전환 지원을 위한 전략과 문서 bullet 초안을 바로 만든다."
      />

      <section className="section">
        <div className="module-grid">
          <article className="module-card">
            <h3>기존 공고로 시작</h3>
            <p>등록된 공고를 선택하면 현재 커리어 자산을 기준으로 지원 전략을 계산한다.</p>
            <form action={createApplicationPreparationAction} className="stack-form">
              <label className="field">
                <span>공고 선택</span>
                <select name="jobPostingId" required defaultValue={activePreparation?.jobPostingId ?? ""}>
                  <option value="">공고를 선택한다</option>
                  {jobPostings.map((jobPosting) => (
                    <option key={jobPosting.id} value={jobPosting.id}>
                      {jobPosting.companyName} / {jobPosting.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field field--full">
                <span>전략 메모</span>
                <textarea
                  name="strategyNote"
                  placeholder="이 공고에서 강조하고 싶은 경험이나 우려 지점을 적는다."
                  rows={4}
                />
              </label>
              <div className="form-actions">
                <button className="button" type="submit">
                  워크벤치 열기
                </button>
              </div>
            </form>
          </article>

          <article className="module-card">
            <h3>새 JD 붙여넣기</h3>
            <p>아직 저장하지 않은 국내/해외 데이터분석가 공고를 바로 지원 준비로 만든다.</p>
            <form action={createManualApplicationPreparationAction} className="stack-form">
              <div className="field-grid">
                <label className="field">
                  <span>회사명</span>
                  <input name="companyName" placeholder="Company" required type="text" />
                </label>
                <label className="field">
                  <span>직무명</span>
                  <input name="title" placeholder="Junior Data Analyst" required type="text" />
                </label>
                <label className="field">
                  <span>시장</span>
                  <select defaultValue="domestic_global" name="market">
                    <option value="domestic_global">국내+해외</option>
                    <option value="domestic">국내</option>
                    <option value="global">해외</option>
                  </select>
                </label>
                <label className="field">
                  <span>근무 형태</span>
                  <input name="employmentType" placeholder="full-time / contract" type="text" />
                </label>
                <label className="field field--full">
                  <span>공고 URL</span>
                  <input name="url" placeholder="https://..." type="url" />
                </label>
                <label className="field field--full">
                  <span>JD 원문</span>
                  <textarea
                    name="rawText"
                    placeholder="공고 설명, 자격요건, 우대사항을 붙여넣는다."
                    required
                    rows={7}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button" type="submit">
                  공고 만들고 분석하기
                </button>
              </div>
            </form>
          </article>
        </div>

        {resumeDocuments.length === 0 ? (
          <article className="todo-card">
            <h3 className="warning">이력서 자산이 아직 없다</h3>
            <p>
              `/career-assets`에서 resume 문서를 추가하면 워크벤치가 기존 문서 근거까지 반영해 bullet을
              더 구체화한다.
            </p>
          </article>
        ) : null}

        {workbenchResult && activeDetail ? (
          <>
            <article className="module-card">
              <h3>이 공고에 맞춘 포지셔닝</h3>
              <p>{workbenchResult.positioning}</p>
              <div className="pill-row">
                <span className="pill">{activeDetail.jobPosting.companyName}</span>
                <span className="pill">{activeDetail.jobPosting.title}</span>
                <span className="pill">주니어/전환</span>
                <span className="pill">국문+영문</span>
              </div>
              <div className="pill-row">
                {workbenchResult.matchedKeywords.map((keyword) => (
                  <span className="pill pill--neutral" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </article>

            <div className="module-grid">
              <article className="module-card">
                <h3>공통 강점</h3>
                <ul>
                  {workbenchResult.commonStrengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="module-card">
                <h3>리스크</h3>
                <ul>
                  {workbenchResult.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="module-card">
                <h3>보완 액션</h3>
                <ul>
                  {workbenchResult.nextActions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="module-grid">
              <article className="module-card">
                <h3>국내 지원 전략</h3>
                <PreviewField label="복사용 전략" values={workbenchResult.domesticStrategy} />
              </article>
              <article className="module-card">
                <h3>Global resume strategy</h3>
                <PreviewField label="Copy-ready strategy" values={workbenchResult.globalStrategy} />
              </article>
            </div>

            <div className="module-grid">
              <article className="module-card">
                <h3>국문 경력기술서 bullet</h3>
                <PreviewField label="복사용 bullet" rows={7} values={workbenchResult.koreanBullets} />
              </article>
              <article className="module-card">
                <h3>English resume bullets</h3>
                <PreviewField label="Copy-ready bullets" rows={7} values={workbenchResult.englishBullets} />
              </article>
            </div>
          </>
        ) : (
          <article className="module-card">
            <h3>지원 준비를 시작한다</h3>
            <p>기존 공고를 선택하거나 새 JD를 붙여넣으면 국내/해외 지원 전략과 bullet 초안이 생성된다.</p>
          </article>
        )}

        <section className="section">
          <h2 className="section-title">진행 중인 지원</h2>
          <div className="module-grid">
            {preparations.map((item) => (
              <article className="module-card" key={item.id}>
                <h3>{item.jobPosting?.title ?? "연결되지 않은 공고"}</h3>
                <p>{item.strategyNote ?? "전략 메모 없음"}</p>
                <div className="pill-row">
                  <span className="pill">상태 {item.status}</span>
                  <span className="pill">{item.approvalRequired ? "승인 필요" : "승인 불필요"}</span>
                </div>
                <ul>
                  {item.documents.map((document) => (
                    <li key={document.id}>
                      {document.docType} v{document.version} / {document.status}
                    </li>
                  ))}
                </ul>
                <form action={updateApplicationPreparationAction} className="stack-form">
                  <input name="id" type="hidden" value={item.id} />
                  <input name="jobPostingId" type="hidden" value={item.jobPostingId} />
                  <div className="field-grid">
                    <label className="field">
                      <span>상태</span>
                      <select defaultValue={item.status} name="status">
                        <option value="drafting">drafting</option>
                        <option value="ready_for_review">ready_for_review</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                        <option value="archived">archived</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>기본 이력서</span>
                      <select defaultValue={item.targetResumeId ?? ""} name="targetResumeId">
                        <option value="">선택 안 함</option>
                        {resumeDocuments.map((document) => (
                          <option key={document.id} value={document.id}>
                            {document.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>커버레터 문서</span>
                      <select defaultValue={item.targetCoverLetterId ?? ""} name="targetCoverLetterId">
                        <option value="">선택 안 함</option>
                        {coverLetterDocuments.map((document) => (
                          <option key={document.id} value={document.id}>
                            {document.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field field--checkbox">
                      <input defaultChecked={item.approvalRequired} name="approvalRequired" type="checkbox" />
                      <span>승인 필요</span>
                    </label>
                    <label className="field field--full">
                      <span>전략 메모</span>
                      <textarea defaultValue={item.strategyNote ?? ""} name="strategyNote" rows={4} />
                    </label>
                  </div>
                  <div className="form-actions">
                    <button className="button" type="submit">
                      준비 저장
                    </button>
                    <a className="button button--ghost" href={`/application-assistant?preparationId=${item.id}`}>
                      워크벤치 보기
                    </a>
                  </div>
                </form>
                <form action={deleteApplicationPreparationAction} className="inline-form">
                  <input name="id" type="hidden" value={item.id} />
                  <input name="jobPostingId" type="hidden" value={item.jobPostingId} />
                  <button className="button button--ghost" type="submit">
                    삭제
                  </button>
                </form>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
