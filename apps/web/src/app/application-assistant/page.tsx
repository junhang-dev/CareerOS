import {
  deleteApplicationPreparationAction,
  updateApplicationPreparationAction
} from "./actions";
import { PageIntro } from "../../components/page-intro";
import { getCareerAssetSnapshot } from "../../server/services/career-assets";
import { listApplicationPreparations } from "../../server/services/applications";

export default async function ApplicationAssistantPage() {
  const [preparations, assets] = await Promise.all([
    listApplicationPreparations(),
    getCareerAssetSnapshot()
  ]);
  const resumeDocuments = assets.documents.filter((document) => document.docType === "resume");
  const coverLetterDocuments = assets.documents.filter((document) => document.docType === "cover_letter");

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Application"
        title="지원 준비 비서"
        description="공고별 전략 메모, 문서 초안, 승인 대기 상태를 관리한다."
      />
      <section className="section">
        {resumeDocuments.length === 0 && coverLetterDocuments.length === 0 ? (
          <article className="module-card">
            <h3>문서 연결 안내</h3>
            <p>현재 연결 가능한 resume / cover letter 문서가 없어 준비 문서 선택은 비활성 상태다.</p>
          </article>
        ) : null}
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
    </main>
  );
}
