import { notFound } from "next/navigation";
import { PageIntro } from "../../../components/page-intro";
import { formatDate } from "../../../lib/format";
import { getJobPostingDetail } from "../../../server/services/job-postings";

type JobPostingDetailPageProps = {
  params: Promise<{
    jobPostingId: string;
  }>;
};

export default async function JobPostingDetailPage({ params }: JobPostingDetailPageProps) {
  const { jobPostingId } = await params;
  const detail = getJobPostingDetail(jobPostingId);

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

