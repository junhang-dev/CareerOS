import { access } from "node:fs/promises";
import path from "node:path";

const requiredPaths = [
  "README.md",
  "package.json",
  "apps/web/next.config.ts",
  "apps/web/src/app/page.tsx",
  "apps/web/src/app/icon.svg",
  "apps/web/src/app/search-profiles/page.tsx",
  "apps/web/src/app/job-postings/page.tsx",
  "apps/web/src/app/career-assets/page.tsx",
  "apps/web/src/app/application-assistant/page.tsx",
  "apps/web/src/app/api/dashboard/route.ts",
  "apps/web/src/server/repositories/index.ts",
  "apps/web/src/server/repositories/types.ts",
  "packages/domain/src/index.ts",
  "packages/domain/package.json",
  "packages/db/schema/careeros-schema.sql",
  "packages/db/src/schema.ts",
  "packages/db/src/client.ts",
  "packages/integrations/src/job-sources/types.ts",
  "packages/workers/src/contracts.ts",
  "packages/security/src/index.ts",
  "docs/architecture/system-overview.md"
];

const root = process.cwd();

const checks = await Promise.all(
  requiredPaths.map(async (relativePath) => {
    const absolutePath = path.join(root, relativePath);

    try {
      await access(absolutePath);
      return { relativePath, ok: true };
    } catch {
      return { relativePath, ok: false };
    }
  })
);

const missing = checks.filter((check) => !check.ok);

for (const check of checks) {
  console.log(`${check.ok ? "OK" : "MISSING"} ${check.relativePath}`);
}

if (missing.length > 0) {
  console.error(`구조 검증 실패: ${missing.length}개 경로가 없습니다.`);
  process.exit(1);
}

console.log("구조 검증 성공");
