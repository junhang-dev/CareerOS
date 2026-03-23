import {
  createCareerDocumentAction,
  createCareerExperienceAction,
  createCareerProjectAction,
  deleteCareerDocumentAction,
  deleteCareerExperienceAction,
  deleteCareerProjectAction,
  updateCareerDocumentAction,
  updateCareerExperienceAction,
  updateCareerProfileAction,
  updateCareerProjectAction
} from "./actions";
import { PageIntro } from "../../components/page-intro";
import { getCareerAssetSnapshot } from "../../server/services/career-assets";

function stringifyStructured(value: Record<string, unknown>) {
  return Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : "";
}

function stringifyCsv(values?: string[]) {
  return values?.join(", ") ?? "";
}

function formatDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
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
          <h3>프로필 편집</h3>
          <form action={updateCareerProfileAction} className="stack-form">
            <div className="field-grid">
              <label className="field">
                <span>헤드라인</span>
                <input
                  defaultValue={snapshot.profile.headline ?? ""}
                  name="headline"
                  placeholder="Product-minded Backend Engineer"
                  type="text"
                />
              </label>
              <label className="field">
                <span>총 경력 연차</span>
                <input
                  defaultValue={snapshot.profile.yearsExperience ?? ""}
                  min={0}
                  name="yearsExperience"
                  type="number"
                />
              </label>
              <label className="field field--full">
                <span>타깃 역할</span>
                <input
                  defaultValue={stringifyCsv(snapshot.profile.targetRoles)}
                  name="targetRoles"
                  placeholder="Backend Engineer, Platform Engineer, Product Engineer"
                  type="text"
                />
              </label>
              <label className="field field--full">
                <span>소개</span>
                <textarea
                  defaultValue={snapshot.profile.bio ?? ""}
                  name="bio"
                  placeholder="핵심 강점과 지향점을 간단히 정리한다."
                  rows={4}
                />
              </label>
            </div>
            <div className="form-actions">
              <button className="button" type="submit">
                프로필 저장
              </button>
            </div>
          </form>
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
            <h3>새 경력 추가</h3>
            <form action={createCareerExperienceAction} className="stack-form">
              <div className="field-grid">
                <label className="field">
                  <span>회사명</span>
                  <input name="company" placeholder="Demo Commerce" required type="text" />
                </label>
                <label className="field">
                  <span>역할</span>
                  <input name="role" placeholder="Backend Engineer" required type="text" />
                </label>
                <label className="field">
                  <span>시작일</span>
                  <input name="startDate" required type="date" />
                </label>
                <label className="field">
                  <span>종료일</span>
                  <input name="endDate" type="date" />
                </label>
                <label className="field field--full">
                  <span>주요 성과</span>
                  <input
                    name="achievements"
                    placeholder="정산 배치 40% 단축, 운영 문서 템플릿 정착"
                    type="text"
                  />
                </label>
                <label className="field field--full">
                  <span>설명</span>
                  <textarea
                    name="description"
                    placeholder="담당 시스템과 주요 책임을 입력한다."
                    rows={4}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button" type="submit">
                  경력 추가
                </button>
              </div>
            </form>
          </article>

          <article className="module-card">
            <h3>새 프로젝트 추가</h3>
            <form action={createCareerProjectAction} className="stack-form">
              <div className="field-grid">
                <label className="field">
                  <span>프로젝트명</span>
                  <input name="name" placeholder="CareerOS Concept" required type="text" />
                </label>
                <label className="field">
                  <span>역할</span>
                  <input name="role" placeholder="Builder" type="text" />
                </label>
                <label className="field field--full">
                  <span>주요 결과</span>
                  <input
                    name="outcomes"
                    placeholder="도메인 모델 설계, MVP 화면 스캐폴드 작성"
                    type="text"
                  />
                </label>
                <label className="field field--full">
                  <span>기술 스택</span>
                  <input
                    name="technologies"
                    placeholder="TypeScript, Next.js, PostgreSQL"
                    type="text"
                  />
                </label>
                <label className="field field--full">
                  <span>설명</span>
                  <textarea
                    name="description"
                    placeholder="프로젝트 목적과 범위를 입력한다."
                    rows={4}
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button" type="submit">
                  프로젝트 추가
                </button>
              </div>
            </form>
          </article>
        </div>

        <div className="module-grid">
          <article className="module-card">
            <h3>경력</h3>
            <div className="stack-form">
              {snapshot.experiences.length === 0 ? <p>아직 등록된 경력이 없다.</p> : null}
              {snapshot.experiences.map((item) => (
                <article className="module-card" key={item.id}>
                  <h4>
                    {item.company} / {item.role}
                  </h4>
                  <p>
                    {formatDateInput(item.startDate)} ~ {formatDateInput(item.endDate) || "현재"}
                  </p>
                  <form action={updateCareerExperienceAction} className="stack-form">
                    <input name="id" type="hidden" value={item.id} />
                    <div className="field-grid">
                      <label className="field">
                        <span>회사명</span>
                        <input defaultValue={item.company} name="company" required type="text" />
                      </label>
                      <label className="field">
                        <span>역할</span>
                        <input defaultValue={item.role} name="role" required type="text" />
                      </label>
                      <label className="field">
                        <span>시작일</span>
                        <input
                          defaultValue={formatDateInput(item.startDate)}
                          name="startDate"
                          required
                          type="date"
                        />
                      </label>
                      <label className="field">
                        <span>종료일</span>
                        <input defaultValue={formatDateInput(item.endDate)} name="endDate" type="date" />
                      </label>
                      <label className="field field--full">
                        <span>주요 성과</span>
                        <input
                          defaultValue={stringifyCsv(item.achievements)}
                          name="achievements"
                          type="text"
                        />
                      </label>
                      <label className="field field--full">
                        <span>설명</span>
                        <textarea defaultValue={item.description ?? ""} name="description" rows={4} />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="button" type="submit">
                        경력 저장
                      </button>
                    </div>
                  </form>
                  <form action={deleteCareerExperienceAction} className="inline-form">
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
            <h3>프로젝트</h3>
            <div className="stack-form">
              {snapshot.projects.length === 0 ? <p>아직 등록된 프로젝트가 없다.</p> : null}
              {snapshot.projects.map((item) => (
                <article className="module-card" key={item.id}>
                  <h4>{item.name}</h4>
                  <form action={updateCareerProjectAction} className="stack-form">
                    <input name="id" type="hidden" value={item.id} />
                    <div className="field-grid">
                      <label className="field">
                        <span>프로젝트명</span>
                        <input defaultValue={item.name} name="name" required type="text" />
                      </label>
                      <label className="field">
                        <span>역할</span>
                        <input defaultValue={item.role ?? ""} name="role" type="text" />
                      </label>
                      <label className="field field--full">
                        <span>주요 결과</span>
                        <input defaultValue={stringifyCsv(item.outcomes)} name="outcomes" type="text" />
                      </label>
                      <label className="field field--full">
                        <span>기술 스택</span>
                        <input
                          defaultValue={stringifyCsv(item.technologies)}
                          name="technologies"
                          type="text"
                        />
                      </label>
                      <label className="field field--full">
                        <span>설명</span>
                        <textarea defaultValue={item.description ?? ""} name="description" rows={4} />
                      </label>
                    </div>
                    <div className="form-actions">
                      <button className="button" type="submit">
                        프로젝트 저장
                      </button>
                    </div>
                  </form>
                  <form action={deleteCareerProjectAction} className="inline-form">
                    <input name="id" type="hidden" value={item.id} />
                    <button className="button button--ghost" type="submit">
                      삭제
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </article>
        </div>

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
