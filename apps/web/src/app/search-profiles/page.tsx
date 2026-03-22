import { PageIntro } from "../../components/page-intro";
import { listSearchProfiles } from "../../server/services/search-profiles";

export default function SearchProfilesPage() {
  const searchProfiles = listSearchProfiles();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Discovery"
        title="탐색 프로필"
        description="사용자의 선호 조건을 프로필 단위로 나누어 채용 소스 수집 전략을 관리한다."
      />
      <section className="section">
        <div className="module-grid">
          {searchProfiles.map((profile) => (
            <article className="module-card" key={profile.id}>
              <h3>{profile.name}</h3>
              <p>스케줄: {profile.scheduleRule}</p>
              <div className="pill-row">
                <span className="pill">우선순위 {profile.priority}</span>
                <span className="pill">{profile.isActive ? "활성" : "비활성"}</span>
              </div>
              <pre className="code-block">{JSON.stringify(profile.filters, null, 2)}</pre>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

