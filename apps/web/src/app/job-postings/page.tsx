import Link from "next/link";
import { PageIntro } from "../../components/page-intro";
import { formatDate } from "../../lib/format";
import { listJobPostings } from "../../server/services/job-postings";

export default function JobPostingsPage() {
  const jobPostings = listJobPostings();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Analysis"
        title="공고 분석"
        description="수집된 공고, 구조화 결과, 적합도와 갭 분석을 한 화면에서 본다."
      />
      <section className="section">
        <div className="module-grid">
          {jobPostings.map((item) => (
            <article className="module-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.companyName} / {item.locationText ?? "위치 미정"}
              </p>
              <p>최근 탐지일: {formatDate(item.lastSeenAt)}</p>
              <div className="pill-row">
                <span className="pill">상태 {item.status}</span>
                <span className="pill">적합도 {item.analysis?.fitScore ?? "-"}</span>
                <span className="pill">갭 {item.gapAnalysis?.missingSkills.length ?? 0}개</span>
              </div>
              <p>{item.analysis?.summary ?? "분석 대기 중"}</p>
              <Link className="nav__link nav__link--inline" href={`/job-postings/${item.id}`}>
                상세 보기
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

