import Link from "next/link";
import { notFound } from "next/navigation";
import { createApplicationPreparationAction } from "../../application-assistant/actions";
import { updateJobPostingAction } from "../actions";
import { PageIntro } from "../../../components/page-intro";
import { formatDate } from "../../../lib/format";
import { getJobPostingDetail } from "../../../server/services/job-postings";

function formatCsv(values?: string[]) {
  return values?.join(", ") ?? "";
}

function formatDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

type JobPostingDetailPageProps = {
  params: Promise<{
    jobPostingId: string;
  }>;
};

export default async function JobPostingDetailPage({ params }: JobPostingDetailPageProps) {
  const { jobPostingId } = await params;
  const detail = await getJobPostingDetail(jobPostingId);

  if (!detail) {
    notFound();
  }

  const latestVersion = detail.versions[0];

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Job Detail"
        title={detail.jobPosting.title}
        description={`${detail.jobPosting.companyName} / ${detail.jobPosting.locationText ?? "위치 미정"}`}
      />
      <section className="section">
        <article className="module-card">
          <h3>공고 요약</h3>
          <p>{detail.analysis?.summary ?? "아직 분석이 없다."}</p>
          <div className="pill-row">
            <span className="pill">적합도 {detail.analysis?.fitScore ?? "-"}</span>
            <span className="pill">최근 캡처 {formatDate(latestVersion?.capturedAt)}</span>
            <span className="pill">준비 상태 {detail.preparation?.status ?? "미생성"}</span>
          </div>
          {detail.preparation ? (
            <Link className="nav__link nav__link--inline" href="/application-assistant">
              지원 준비 비서에서 보기
            </Link>
          ) : (
            <form action={createApplicationPreparationAction} className="inline-form">
              <input name="jobPostingId" type="hidden" value={detail.jobPosting.id} />
              <button className="button" type="submit">
                지원 준비 생성
              </button>
            </form>
          )}
        </article>
        <article className="module-card">
          <h3>공고 정보 수정</h3>
          <form action={updateJobPostingAction} className="stack-form">
            <input name="id" type="hidden" value={detail.jobPosting.id} />
            <div className="field-grid">
              <label className="field">
                <span>회사명</span>
                <input defaultValue={detail.jobPosting.companyName} name="companyName" required type="text" />
              </label>
              <label className="field">
                <span>공고 제목</span>
                <input defaultValue={detail.jobPosting.title} name="title" required type="text" />
              </label>
              <label className="field field--full">
                <span>공고 URL</span>
                <input defaultValue={detail.jobPosting.url} name="url" required type="url" />
              </label>
              <label className="field">
                <span>근무 위치</span>
                <input defaultValue={detail.jobPosting.locationText} name="locationText" type="text" />
              </label>
              <label className="field">
                <span>고용 형태</span>
                <input defaultValue={detail.jobPosting.employmentType} name="employmentType" type="text" />
              </label>
              <label className="field">
                <span>상태</span>
                <select defaultValue={detail.jobPosting.status} name="status">
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                  <option value="unknown">unknown</option>
                </select>
              </label>
              <label className="field">
                <span>게시일</span>
                <input defaultValue={formatDateInput(detail.jobPosting.postedAt)} name="postedAt" type="date" />
              </label>
              <label className="field">
                <span>외부 공고 ID</span>
                <input defaultValue={detail.jobPosting.sourceJobId} name="sourceJobId" type="text" />
              </label>
              <label className="field field--full">
                <span>요약</span>
                <textarea
                  defaultValue={latestVersion?.jdStructured.summary ?? ""}
                  name="summary"
                  rows={3}
                />
              </label>
              <label className="field field--full">
                <span>원문 텍스트</span>
                <textarea defaultValue={latestVersion?.rawText ?? ""} name="rawText" rows={4} />
              </label>
              <label className="field">
                <span>핵심 자격요건</span>
                <input
                  defaultValue={formatCsv(latestVersion?.jdStructured.qualifications)}
                  name="qualifications"
                  type="text"
                />
              </label>
              <label className="field">
                <span>우대사항</span>
                <input
                  defaultValue={formatCsv(latestVersion?.jdStructured.preferredQualifications)}
                  name="preferredQualifications"
                  type="text"
                />
              </label>
              <label className="field">
                <span>기술 스택</span>
                <input
                  defaultValue={formatCsv(latestVersion?.jdStructured.techStack)}
                  name="techStack"
                  type="text"
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                공고 저장
              </button>
            </div>
          </form>
        </article>
        <div className="module-grid">
          <article className="module-card">
            <h3>핵심 자격요건</h3>
            <ul>
              {(latestVersion?.jdStructured.qualifications ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>우대사항</h3>
            <ul>
              {(latestVersion?.jdStructured.preferredQualifications ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>누락 스킬</h3>
            <ul>
              {(detail.gapAnalysis?.missingSkills ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>추천 액션</h3>
            <ul>
              {(detail.gapAnalysis?.recommendations ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
