import { PageIntro } from "../../components/page-intro";
import { listApplicationPreparations } from "../../server/services/applications";

export default function ApplicationAssistantPage() {
  const preparations = listApplicationPreparations();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Application"
        title="지원 준비 비서"
        description="공고별 전략 메모, 문서 초안, 승인 대기 상태를 관리한다."
      />
      <section className="section">
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
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

