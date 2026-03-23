import Link from "next/link";
import { createJobPostingAction } from "./actions";
import { PageIntro } from "../../components/page-intro";
import { formatDate } from "../../lib/format";
import { listJobPostings } from "../../server/services/job-postings";

export default async function JobPostingsPage() {
  const jobPostings = await listJobPostings();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Analysis"
        title="공고 분석"
        description="수집된 공고, 구조화 결과, 적합도와 갭 분석을 한 화면에서 본다."
      />
      <section className="section">
        <article className="module-card">
          <h3>새 수동 공고 추가</h3>
          <form action={createJobPostingAction} className="stack-form">
            <div className="field-grid">
              <label className="field">
                <span>회사명</span>
                <input name="companyName" placeholder="TechFlow" required type="text" />
              </label>
              <label className="field">
                <span>공고 제목</span>
                <input name="title" placeholder="Platform Engineer" required type="text" />
              </label>
              <label className="field field--full">
                <span>공고 URL</span>
                <input name="url" placeholder="https://jobs.example.com/..." required type="url" />
              </label>
              <label className="field">
                <span>근무 위치</span>
                <input name="locationText" placeholder="Seoul / Hybrid" type="text" />
              </label>
              <label className="field">
                <span>고용 형태</span>
                <input name="employmentType" placeholder="full-time" type="text" />
              </label>
              <label className="field">
                <span>상태</span>
                <select defaultValue="active" name="status">
                  <option value="active">active</option>
                  <option value="closed">closed</option>
                  <option value="unknown">unknown</option>
                </select>
              </label>
              <label className="field">
                <span>게시일</span>
                <input name="postedAt" type="date" />
              </label>
              <label className="field">
                <span>외부 공고 ID</span>
                <input name="sourceJobId" placeholder="wanted-1234" type="text" />
              </label>
              <label className="field field--full">
                <span>요약</span>
                <textarea name="summary" placeholder="JD 핵심 요약을 입력한다." rows={3} />
              </label>
              <label className="field field--full">
                <span>원문 텍스트</span>
                <textarea name="rawText" placeholder="원문 일부 또는 메모" rows={4} />
              </label>
              <label className="field">
                <span>핵심 자격요건</span>
                <input
                  name="qualifications"
                  placeholder="TypeScript, PostgreSQL, API 설계"
                  type="text"
                />
              </label>
              <label className="field">
                <span>우대사항</span>
                <input
                  name="preferredQualifications"
                  placeholder="Observability, SaaS, 영어 협업"
                  type="text"
                />
              </label>
              <label className="field">
                <span>기술 스택</span>
                <input name="techStack" placeholder="Node.js, React, Docker" type="text" />
              </label>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                공고 생성
              </button>
            </div>
          </form>
        </article>
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
                <span className="pill">
                  요건 {item.latestVersion?.jdStructured.qualifications?.length ?? 0}개
                </span>
              </div>
              <p>{item.latestVersion?.jdStructured.summary ?? item.analysis?.summary ?? "분석 대기 중"}</p>
              <p>우대 {item.latestVersion?.jdStructured.preferredQualifications?.length ?? 0}개</p>
              <p>
                스택{" "}
                {item.latestVersion?.jdStructured.techStack?.slice(0, 3).join(", ") ?? "미입력"}
              </p>
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
