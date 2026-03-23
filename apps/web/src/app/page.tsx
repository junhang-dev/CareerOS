import Link from "next/link";
import { moduleOverview, nextMilestones, recommendedPaths } from "../lib/module-overview";
import { getDashboardSnapshot } from "../server/services/dashboard";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot();

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__grid">
          <div>
            <span className="eyebrow">CareerOS / Single User MVP</span>
            <h1>채용 탐색부터 지원 준비까지 이어지는 개인 커리어 운영체제</h1>
            <p>
              현재 스캐폴드는 공고 수집, 커리어 자산화, 적합도 분석, 지원 준비를 분리된 모듈로
              설계한 기준선이다. 실제 구현은 이 경계를 따라 진행하면 된다.
            </p>
            <div className="pill-row">
              <span className="pill">잡 포스팅 변경 추적</span>
              <span className="pill">문서 자산 구조화</span>
              <span className="pill">승인 기반 지원 플로우</span>
              <span className="pill">보안 경계 분리</span>
            </div>
          </div>
          <div className="hero__metrics">
            <article className="metric-card">
              <strong>{snapshot.metrics.searchProfileCount}</strong>
              <span>활성 탐색 프로필</span>
            </article>
            <article className="metric-card">
              <strong>{snapshot.metrics.activeJobPostingCount}</strong>
              <span>현재 활성 공고</span>
            </article>
            <article className="metric-card">
              <strong>{snapshot.metrics.applicationPreparationCount}</strong>
              <span>진행 중인 지원 준비</span>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">오늘의 스냅샷</h2>
        <div className="module-grid">
          {snapshot.recentJobPostings.map((item) => (
            <article className="module-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.companyName} / {item.locationText ?? "위치 미정"}
              </p>
              <div className="pill-row">
                <span className="pill">적합도 {item.fitScore ?? "-"}</span>
                <span className="pill">갭 {item.gapCount}개</span>
                <span className="pill">{item.preparationStatus ?? "준비 전"}</span>
              </div>
              <p>{item.analysisSummary ?? "분석 대기 중"}</p>
              <Link className="nav__link nav__link--inline" href={`/job-postings/${item.id}`}>
                이 공고 보기
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">시스템 모듈</h2>
        <div className="module-grid">
          {moduleOverview.map((module) => (
            <article className="module-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
              <ul>
                {module.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">다음 구현 우선순위</h2>
        <div className="todo-grid">
          {nextMilestones.map((item) => (
            <article className="todo-card" key={item}>
              <h3>{item}</h3>
              <p>
                현재 MVP는 탐색 프로필, 수동 공고 입력, 자산 문서, 수동 분석, 지원 준비까지 연결된
                상태다. 다음 단계는 외부 유입과 실제 파이프라인 자동화다.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">바로 가기</h2>
        <div className="path-grid">
          <article className="path-card">
            <h3>탐색 프로필 관리</h3>
            <Link className="nav__link nav__link--inline" href="/search-profiles">
              `/search-profiles`
            </Link>
          </article>
          <article className="path-card">
            <h3>공고 목록과 상세</h3>
            <Link className="nav__link nav__link--inline" href="/job-postings">
              `/job-postings`
            </Link>
          </article>
          <article className="path-card">
            <h3>자산 현황 보기</h3>
            <Link className="nav__link nav__link--inline" href="/career-assets">
              `/career-assets`
            </Link>
          </article>
          <article className="path-card">
            <h3>지원 준비 흐름</h3>
            <Link className="nav__link nav__link--inline" href="/application-assistant">
              `/application-assistant`
            </Link>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">먼저 읽을 파일</h2>
        <div className="path-grid">
          {recommendedPaths.map((item) => (
            <article className="path-card" key={item}>
              <h3>{item.split("/").slice(-1)[0]}</h3>
              <code>{item}</code>
            </article>
          ))}
        </div>
        <article className="todo-card">
          <h3 className="warning">설계 메모</h3>
          <p>
            `secret_credentials` 저장 전략, 다국어 JD 분리, 채용 소스 어댑터 표준 인터페이스는 실제
            구현 전에 별도 ADR로 고정하는 편이 안전하다.
          </p>
        </article>
      </section>
    </main>
  );
}
