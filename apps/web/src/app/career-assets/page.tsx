import { PageIntro } from "../../components/page-intro";
import { getCareerAssetSnapshot } from "../../server/services/career-assets";

export default async function CareerAssetsPage() {
  const snapshot = await getCareerAssetSnapshot();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Assets"
        title="커리어 자산"
        description="프로필, 경력, 프로젝트, 문서, 외부 계정 연결 상태를 한 곳에서 관리한다."
      />
      <section className="section">
        <article className="module-card">
          <h3>{snapshot.profile.headline}</h3>
          <p>{snapshot.profile.bio}</p>
          <div className="pill-row">
            {snapshot.profile.targetRoles.map((role) => (
              <span className="pill" key={role}>
                {role}
              </span>
            ))}
          </div>
        </article>
        <div className="module-grid">
          <article className="module-card">
            <h3>경력</h3>
            <ul>
              {snapshot.experiences.map((item) => (
                <li key={item.id}>
                  {item.company} / {item.role}
                </li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>프로젝트</h3>
            <ul>
              {snapshot.projects.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>문서</h3>
            <ul>
              {snapshot.documents.map((item) => (
                <li key={item.id}>
                  {item.title} / {item.docType}
                </li>
              ))}
            </ul>
          </article>
          <article className="module-card">
            <h3>외부 계정</h3>
            <ul>
              {snapshot.externalAccounts.map((item) => (
                <li key={item.id}>
                  {item.provider} / {item.status}
                </li>
              ))}
            </ul>
          </article>
        </div>
        <article className="module-card">
          <h3>스킬 근거</h3>
          <div className="pill-row">
            {snapshot.skills.map((item) => (
              <span className="pill" key={item.skillId}>
                {item.skill?.name ?? item.skillId} / evidence {item.evidenceCount}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
