import {
  createCareerDocumentAction,
  deleteCareerDocumentAction,
  updateCareerDocumentAction
} from "./actions";
import { PageIntro } from "../../components/page-intro";
import { getCareerAssetSnapshot } from "../../server/services/career-assets";

function stringifyStructured(value: Record<string, unknown>) {
  return Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "";
}

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
        <article className="module-card">
          <h3>새 문서 자산 추가</h3>
          <form action={createCareerDocumentAction} className="stack-form">
            <div className="field-grid">
              <label className="field">
                <span>문서 제목</span>
                <input name="title" placeholder="Resume 2026 Q2" required type="text" />
              </label>
              <label className="field">
                <span>문서 타입</span>
                <select defaultValue="resume" name="docType">
                  <option value="resume">resume</option>
                  <option value="cover_letter">cover_letter</option>
                  <option value="portfolio">portfolio</option>
                  <option value="note">note</option>
                </select>
              </label>
              <label className="field">
                <span>소스 타입</span>
                <select defaultValue="manual" name="sourceType">
                  <option value="manual">manual</option>
                  <option value="upload">upload</option>
                  <option value="notion">notion</option>
                  <option value="linkedin">linkedin</option>
                  <option value="github">github</option>
                </select>
              </label>
              <label className="field field--full">
                <span>저장 경로</span>
                <input name="storagePath" placeholder="s3://..., notion://..., local path" type="text" />
              </label>
              <label className="field field--full">
                <span>추출 텍스트</span>
                <textarea name="parsedText" placeholder="문서 본문 또는 핵심 요약" rows={4} />
              </label>
              <label className="field field--full">
                <span>구조화 JSON</span>
                <textarea
                  name="structuredJson"
                  placeholder='{"sections":["summary","experience"]}'
                  rows={5}
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                문서 추가
              </button>
            </div>
          </form>
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
            <div className="stack-form">
              {snapshot.documents.map((item) => (
                <article className="module-card" key={item.id}>
                  <h4>{item.title}</h4>
                  <div className="pill-row">
                    <span className="pill">{item.docType}</span>
                    <span className="pill">{item.sourceType}</span>
                    <span className="pill">v{item.version}</span>
                  </div>
                  <form action={updateCareerDocumentAction} className="stack-form">
                    <input name="id" type="hidden" value={item.id} />
                    <div className="field-grid">
                      <label className="field">
                        <span>문서 제목</span>
                        <input defaultValue={item.title} name="title" required type="text" />
                      </label>
                      <label className="field">
                        <span>문서 타입</span>
                        <select defaultValue={item.docType} name="docType">
                          <option value="resume">resume</option>
                          <option value="cover_letter">cover_letter</option>
                          <option value="portfolio">portfolio</option>
                          <option value="note">note</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>소스 타입</span>
                        <select defaultValue={item.sourceType} name="sourceType">
                          <option value="manual">manual</option>
                          <option value="upload">upload</option>
                          <option value="notion">notion</option>
                          <option value="linkedin">linkedin</option>
                          <option value="github">github</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>버전</span>
                        <input defaultValue={item.version} min={1} name="version" type="number" />
                      </label>
                      <label className="field field--full">
                        <span>저장 경로</span>
                        <input defaultValue={item.storagePath} name="storagePath" type="text" />
                      </label>
                      <label className="field field--full">
                        <span>추출 텍스트</span>
                        <textarea defaultValue={item.parsedText ?? ""} name="parsedText" rows={4} />
                      </label>
                      <label className="field field--full">
                        <span>구조화 JSON</span>
                        <textarea
                          defaultValue={stringifyStructured(item.structured)}
                          name="structuredJson"
                          rows={5}
                        />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="button" type="submit">
                        문서 저장
                      </button>
                    </div>
                  </form>
                  <form action={deleteCareerDocumentAction} className="inline-form">
                    <input name="id" type="hidden" value={item.id} />
                    <button className="button button--ghost" type="submit">
                      삭제
                    </button>
                  </form>
                </article>
              ))}
            </div>
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
