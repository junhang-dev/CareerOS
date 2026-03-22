import {
  createSearchProfileAction,
  deleteSearchProfileAction,
  updateSearchProfileAction
} from "./actions";
import { PageIntro } from "../../components/page-intro";
import { formatSearchProfileFilters } from "../../lib/search-profile-filters";
import { listSearchProfiles } from "../../server/services/search-profiles";

function formatFilterInput(filters: Record<string, unknown>, key: string) {
  const value = filters[key];

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return typeof value === "string" ? value : "";
}

export default async function SearchProfilesPage() {
  const searchProfiles = await listSearchProfiles();

  return (
    <main className="shell">
      <PageIntro
        eyebrow="Discovery"
        title="탐색 프로필"
        description="사용자의 선호 조건을 프로필 단위로 나누어 채용 소스 수집 전략을 관리한다."
      />
      <section className="section">
        <article className="module-card">
          <h3>새 탐색 프로필 추가</h3>
          <form action={createSearchProfileAction} className="stack-form">
            <div className="field-grid">
              <label className="field">
                <span>이름</span>
                <input name="name" placeholder="Global AI Search" required type="text" />
              </label>
              <label className="field">
                <span>스케줄</span>
                <input name="scheduleRule" placeholder="0 8 * * *" required type="text" />
              </label>
              <label className="field">
                <span>우선순위</span>
                <input defaultValue={100} min={1} name="priority" type="number" />
              </label>
              <label className="field">
                <span>Remote</span>
                <select defaultValue="" name="remote">
                  <option value="">선택 안 함</option>
                  <option value="onsite">onsite</option>
                  <option value="hybrid">hybrid</option>
                  <option value="remote">remote</option>
                  <option value="flexible">flexible</option>
                </select>
              </label>
              <label className="field">
                <span>국가/지역</span>
                <input name="countries" placeholder="KR, SG, Remote" type="text" />
              </label>
              <label className="field">
                <span>포함 키워드</span>
                <input name="keywords" placeholder="TypeScript, AI, Backend" type="text" />
              </label>
              <label className="field field--full">
                <span>제외 키워드</span>
                <input name="excludeKeywords" placeholder="contract, freelance" type="text" />
              </label>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                프로필 생성
              </button>
            </div>
          </form>
        </article>
        <div className="module-grid">
          {searchProfiles.map((profile) => (
            <article className="module-card" key={profile.id}>
              <h3>{profile.name}</h3>
              <p>스케줄: {profile.scheduleRule}</p>
              <div className="pill-row">
                <span className="pill">우선순위 {profile.priority}</span>
                <span className="pill">{profile.isActive ? "활성" : "비활성"}</span>
              </div>
              <div className="filter-list">
                {formatSearchProfileFilters(profile.filters as Record<string, unknown>).map((item) => (
                  <div className="filter-group" key={`${profile.id}-${item.label}`}>
                    <strong>{item.label}</strong>
                    <div className="pill-row">
                      {item.values.map((value) => (
                        <span className="pill pill--neutral" key={`${item.label}-${value}`}>
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <form action={updateSearchProfileAction} className="stack-form">
                <input name="id" type="hidden" value={profile.id} />
                <div className="field-grid">
                  <label className="field">
                    <span>이름</span>
                    <input defaultValue={profile.name} name="name" required type="text" />
                  </label>
                  <label className="field">
                    <span>스케줄</span>
                    <input defaultValue={profile.scheduleRule} name="scheduleRule" required type="text" />
                  </label>
                  <label className="field">
                    <span>우선순위</span>
                    <input defaultValue={profile.priority} min={1} name="priority" type="number" />
                  </label>
                  <label className="field">
                    <span>Remote</span>
                    <select
                      defaultValue={formatFilterInput(
                        profile.filters as Record<string, unknown>,
                        "remote"
                      )}
                      name="remote"
                    >
                      <option value="">선택 안 함</option>
                      <option value="onsite">onsite</option>
                      <option value="hybrid">hybrid</option>
                      <option value="remote">remote</option>
                      <option value="flexible">flexible</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>국가/지역</span>
                    <input
                      defaultValue={formatFilterInput(profile.filters as Record<string, unknown>, "countries")}
                      name="countries"
                      type="text"
                    />
                  </label>
                  <label className="field">
                    <span>포함 키워드</span>
                    <input
                      defaultValue={formatFilterInput(profile.filters as Record<string, unknown>, "keywords")}
                      name="keywords"
                      type="text"
                    />
                  </label>
                  <label className="field field--full">
                    <span>제외 키워드</span>
                    <input
                      defaultValue={formatFilterInput(
                        profile.filters as Record<string, unknown>,
                        "excludeKeywords"
                      )}
                      name="excludeKeywords"
                      type="text"
                    />
                  </label>
                  <label className="field field--checkbox">
                    <input defaultChecked={profile.isActive} name="isActive" type="checkbox" />
                    <span>활성 상태 유지</span>
                  </label>
                </div>
                <div className="form-actions">
                  <button className="button" type="submit">
                    저장
                  </button>
                </div>
              </form>
              <form action={deleteSearchProfileAction} className="inline-form">
                <input name="id" type="hidden" value={profile.id} />
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
