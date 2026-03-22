import "./globals.css";
import type { ReactNode } from "react";
import { SiteHeader } from "../components/site-header";

export const metadata = {
  title: "CareerOS MVP",
  description: "개인 커리어 에이전트 플랫폼 싱글유저 MVP 스캐폴드"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <SiteHeader />
        </div>
        {children}
      </body>
    </html>
  );
}
