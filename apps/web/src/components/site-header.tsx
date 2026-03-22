import Link from "next/link";

const navigationItems = [
  { href: "/", label: "대시보드" },
  { href: "/search-profiles", label: "탐색 프로필" },
  { href: "/job-postings", label: "공고 분석" },
  { href: "/career-assets", label: "커리어 자산" },
  { href: "/application-assistant", label: "지원 준비" }
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div>
        <Link className="brand" href="/">
          CareerOS
        </Link>
        <p className="brand-subtitle">Single-user MVP workspace</p>
      </div>
      <nav className="nav">
        {navigationItems.map((item) => (
          <Link className="nav__link" href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

